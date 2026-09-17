#!/usr/bin/env node
// Hook Stop: pasa el linter a la última respuesta antes de que se enseñe y, si huele a IA, la devuelve para reescribir.
// Desactivado por defecto: solo actúa si IA_LINTER_REVISAR vale 1, true o sí.
// No contiene motor: llama a la misma CLI con --stdin.
//
// Entrada (stdin, JSON del hook): session_id, prompt_id, cwd, last_assistant_message, hook_event_name.
// Salida: exit 0 deja pasar; exit 2 bloquea y el texto de stderr es lo que lee el modelo.
// Tope: como mucho MAX_INTENTOS bloqueos por cada prompt_id, para no dejar la sesión dando vueltas.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const MAX_INTENTOS = Number(process.env.IA_LINTER_REVISAR_INTENTOS ?? 2);
const PERFIL = process.env.IA_LINTER_REVISAR_PERFIL ?? "chat";
const NIVELES = new Set((process.env.IA_LINTER_REVISAR_NIVELES ?? "error,warning").split(",").map((s) => s.trim()).filter(Boolean));
const MIN_PALABRAS = Number(process.env.IA_LINTER_REVISAR_MIN_PALABRAS ?? 40);

const activo = /^(1|true|sí|si|yes)$/i.test(process.env.IA_LINTER_REVISAR ?? "");
if (!activo) process.exit(0);

let payload = {};
try {
  payload = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
} catch {
  process.exit(0); // entrada ilegible: no es motivo para bloquear una respuesta
}

const texto = String(payload.last_assistant_message ?? "").trim();
if (!texto) process.exit(0);
// Respuestas muy cortas no tienen ritmo que medir y el índice no se calcula.
if ((texto.match(/\S+/g) ?? []).length < MIN_PALABRAS) process.exit(0);

const estado = estadoDe(payload);
if (estado.intentos >= MAX_INTENTOS) process.exit(0);

const cli = resolverCli(payload.cwd);
if (!cli) process.exit(0); // sin CLI no se revisa nada, pero tampoco se estorba

// El nombre lógico hace que se analice como Markdown: así los bloques de código quedan fuera
// del recuento de frases y los guiones de las opciones no se toman por rayas de inciso.
const run = spawnSync(process.execPath, [cli, "lint", "--stdin", "--stdin-filename", "respuesta.md", "--profile", PERFIL, "--format", "json", "--no-color", "--fail-on", "never"], {
  input: texto,
  encoding: "utf8",
  cwd: payload.cwd && fs.existsSync(payload.cwd) ? payload.cwd : undefined,
  maxBuffer: 32 * 1024 * 1024,
});
if (run.error || run.status === 2) process.exit(0);

let result;
try {
  result = JSON.parse(run.stdout);
} catch {
  process.exit(0);
}

const hallazgos = (result.files?.[0]?.findings ?? []).filter((f) => !f.suppressed && NIVELES.has(f.level));
if (hallazgos.length === 0) {
  guardar({ ...estado, intentos: 0 });
  process.exit(0);
}

guardar({ ...estado, intentos: estado.intentos + 1 });

const porRegla = new Map();
for (const f of hallazgos) if (!porRegla.has(f.rule)) porRegla.set(f.rule, f);
const lineas = [...porRegla.values()].map((f) => `- ${f.message} (${f.rule})`);
const indice = result.files?.[0]?.score?.index;

process.stderr.write(
  [
    "La respuesta que acabas de dar tiene cosas que suenan a IA:",
    "",
    ...lineas,
    "",
    indice === null || indice === undefined ? "" : `Índice: ${indice}/100 (perfil ${PERFIL}).`,
    "Reescríbela con eso arreglado y responde otra vez. Dilo con tus palabras, no la parafrasees por encima.",
    `Si crees que está bien como está, dilo y sigue: esta revisión no insiste más de ${MAX_INTENTOS} veces.`,
  ].filter(Boolean).join("\n") + "\n",
);
process.exit(2);

/* --------------------------------------------------------------- */

/** Un fichero por sesión, con el id que viene en el propio evento: dos sesiones a la vez no se pisan. */
function ficheroEstado(payload) {
  const dir = path.join(os.tmpdir(), "ia-linter-es");
  fs.mkdirSync(dir, { recursive: true });
  const clave = createHash("sha256").update(String(payload.session_id ?? "")).digest("hex").slice(0, 16);
  return path.join(dir, `revisar-${clave}.json`);
}

function estadoDe(payload) {
  const promptId = String(payload.prompt_id ?? payload.session_id ?? "");
  try {
    const s = JSON.parse(fs.readFileSync(ficheroEstado(payload), "utf8"));
    if (s.promptId === promptId) return { payload, promptId, intentos: Number(s.intentos) || 0 };
  } catch {
    /* sin estado previo */
  }
  return { payload, promptId, intentos: 0 };
}

function guardar(estado) {
  try {
    const { payload, ...resto } = estado;
    fs.writeFileSync(ficheroEstado(payload), JSON.stringify(resto), "utf8");
  } catch {
    /* si no se puede guardar, el peor caso es revisar de más */
  }
}

/** La CLI del proyecto si está instalada; si no, el bundle que viene con el plugin. */
function resolverCli(cwd) {
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
  const raiz = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const bundle = path.join(raiz, "bundle", "dist", "cli.mjs");
  return fs.existsSync(bundle) ? bundle : null;
}
