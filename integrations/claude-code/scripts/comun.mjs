// Capa común de humanización para los hooks del plugin (docs/decisions.md, 2026-09-18).
// Los hooks no reescriben nada: pasan el resultado por la misma CLI y, si hay algo, le devuelven orientación a la misma IA.
// No hay motor aquí ni reglas: todo sale de `ia-linter-es lint`.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export const MAX_INTENTOS = Number(process.env.IA_LINTER_REVISAR_INTENTOS ?? 2);
export const MIN_PALABRAS = Number(process.env.IA_LINTER_REVISAR_MIN_PALABRAS ?? 40);

/**
 * Nivel de intervención. De momento solo existe `normal`; cualquier otro valor se trata como `normal`.
 * Si llegan más niveles, se resuelven aquí: qué niveles de hallazgo cortan y cómo se formula la orientación.
 */
export function nivel() {
  const pedido = (process.env.IA_LINTER_NIVEL ?? "normal").trim().toLowerCase();
  const NIVELES = { normal: {} };
  const nombre = pedido in NIVELES ? pedido : "normal";
  const cortan = new Set((process.env.IA_LINTER_REVISAR_NIVELES ?? "error,warning").split(",").map((s) => s.trim()).filter(Boolean));
  return { nombre, cortan };
}

export const encendido = (variable) => /^(1|true|sí|si|yes)$/i.test(process.env[variable] ?? "");

export function leerEntrada() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return null; // entrada ilegible: no es motivo para bloquear nada
  }
}

export const palabras = (texto) => (texto.match(/\S+/g) ?? []).length;

/**
 * Pasa el texto por la CLI y devuelve los hallazgos que cortan y el cuerpo de la orientación (`--format revision`).
 * `args` son las opciones de perfil (`--profile chat`, `--profile auto`…). Devuelve null si no hay nada que decir
 * o si la CLI no está o falla: la revisión nunca estorba por un fallo suyo.
 */
export function revisar({ cli, texto, nombre, args, cwd, cortan }) {
  const base = [cli, "lint", "--stdin", "--stdin-filename", nombre, ...args, "--no-color", "--fail-on", "never"];
  const opts = { input: texto, encoding: "utf8", cwd: cwd && fs.existsSync(cwd) ? cwd : undefined, maxBuffer: 32 * 1024 * 1024 };
  const run = spawnSync(process.execPath, [...base, "--format", "json"], opts);
  if (run.error || run.status === 2) return null;
  let result;
  try {
    result = JSON.parse(run.stdout);
  } catch {
    return null;
  }
  const hallazgos = (result.files?.[0]?.findings ?? []).filter((f) => !f.suppressed && cortan.has(f.level));
  if (!hallazgos.length) return { hallazgos, cuerpo: [] };
  // La orientación de la CLI; con info entre los niveles que cortan se pide --verbose. Una CLI anterior que no conoce
  // `revision` sale con 2, y entonces se cae a la lista de mensajes.
  const rev = spawnSync(process.execPath, [...base, "--format", "revision", ...(cortan.has("info") ? ["--verbose"] : [])], opts);
  if (!rev.error && rev.status === 0 && rev.stdout.trim()) return { hallazgos, cuerpo: [rev.stdout.trimEnd()] };
  const porRegla = new Map();
  for (const f of hallazgos) if (!porRegla.has(f.rule)) porRegla.set(f.rule, f);
  const indice = result.files?.[0]?.score?.index;
  return {
    hallazgos,
    cuerpo: [...[...porRegla.values()].map((f) => `- ${f.message} (${f.rule})`), "", indice === null || indice === undefined ? "" : `Índice: ${indice}/100.`],
  };
}

/** El mensaje que lee la IA. Es orientación: decide ella qué corrige, qué mantiene y cómo lo adapta. */
export function mensaje(cabecera, cuerpo) {
  return (
    [
      cabecera,
      "",
      ...cuerpo,
      "",
      "Decide tú qué corriges, qué mantienes y cómo lo adaptas al contexto. Si un hallazgo no aplica aquí, déjalo.",
      "Si reescribes, cambia la frase entera en vez de darle la vuelta a las palabras, y no alternes frases largas y cortas por sistema, que es el defecto contrario.",
      `Si crees que está bien como está, dilo y sigue: esta revisión no insiste más de ${MAX_INTENTOS} veces.`,
    ]
      .filter(Boolean)
      .join("\n") + "\n"
  );
}

/* ---------------- Tope de intentos ---------------- */

/** Un fichero por sesión, con el id que viene en el propio evento: dos sesiones a la vez no se pisan. */
function ficheroEstado(payload) {
  const dir = path.join(os.tmpdir(), "ia-linter-es");
  fs.mkdirSync(dir, { recursive: true });
  const clave = createHash("sha256").update(String(payload.session_id ?? "")).digest("hex").slice(0, 16);
  return path.join(dir, `revisar-${clave}.json`);
}

function leerEstado(payload) {
  try {
    const s = JSON.parse(fs.readFileSync(ficheroEstado(payload), "utf8"));
    return s && typeof s.intentos === "object" ? s.intentos : {};
  } catch {
    return {};
  }
}

/** Cuántas veces se ha devuelto ya esto mismo. La clave distingue la respuesta de un turno o un archivo concreto. */
export function intentos(payload, clave) {
  return Number(leerEstado(payload)[clave]) || 0;
}

export function guardarIntentos(payload, clave, n) {
  try {
    const todos = leerEstado(payload);
    if (n) todos[clave] = n;
    else delete todos[clave];
    fs.writeFileSync(ficheroEstado(payload), JSON.stringify({ intentos: todos }), "utf8");
  } catch {
    /* si no se puede guardar, el peor caso es revisar de más */
  }
}

/* ---------------- CLI y plugin ---------------- */

export const raizPlugin = () => process.env.CLAUDE_PLUGIN_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** La CLI del proyecto si está instalada; si no, el bundle que viene con el plugin. */
export function resolverCli(cwd) {
  const env = process.env.IA_LINTER_CLI;
  if (env && fs.existsSync(env)) return env;
  let dir = cwd && fs.existsSync(cwd) ? path.resolve(cwd) : process.cwd();
  for (;;) {
    const p = path.join(dir, "node_modules", "ia-linter-es", "dist", "cli", "main.js");
    if (fs.existsSync(p)) return p;
    const padre = path.dirname(dir);
    if (padre === dir) break;
    dir = padre;
  }
  const bundle = path.join(raizPlugin(), "bundle", "dist", "cli.mjs");
  return fs.existsSync(bundle) ? bundle : null;
}
