#!/usr/bin/env node
// Lista los hallazgos de una partición con la misma clave que usa `benchmark run` para las adjudicaciones
// (`<id>|<regla>|<huella>`), más el índice por documento. Sirve para redactar los archivos de adjudicación.
//
// Uso:
//   node benchmark/scripts/dump-findings.mjs development [--corpus corpus-v1.2] [--register correo] [--profile correo] [--json]
//   node benchmark/scripts/dump-findings.mjs development --corpus corpus-v1.2 --register correo --profile correo --ciego <carpeta>
//
// Los hallazgos salen con el mismo contexto que `benchmark run` (perfil pedido, reglas a su nivel por defecto, sin overrides
// ni caché), así que las huellas casan con las del informe. Sin --profile se usa el perfil por defecto, igual que el benchmark.
//
// --ciego escribe en <carpeta> el paquete para que otro modelo adjudique sin saber quién escribió cada texto ni en qué
// estado está cada regla: `paquete-<registro>.md` (lo que se le da al modelo) y `mapa-<registro>.json` (id opaco -> clave
// del benchmark, que no se le da). Los paquetes llevan párrafos de la clase humana, que no se redistribuye: la carpeta
// no se sube al repositorio.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const partition = args[0] && !args[0].startsWith("--") ? args[0] : "development";
const corpusDir = path.resolve(root, opt("corpus") ?? "corpus");
const register = opt("register");
const profile = opt("profile");
const ciego = opt("ciego");

// Reglas que solo miden longitudes de frase: no hay nada que leer en el fragmento para decir si acierta.
// Se evalúan por falsos positivos por mil palabras, no por adjudicación.
const NO_ADJUDICABLES = new Set(["estructura/longitud-uniforme", "estructura/ritmo-plano", "estructura/ritmo-metronomo"]);

if (partition === "holdout") {
  if (ciego) throw new Error("la adjudicación se hace sobre development, no sobre holdout");
  if (!fs.existsSync(path.join(root, "benchmark", "reports", "holdout-v1.0.json")))
    throw new Error("el holdout no se inspecciona antes de su ejecución única");
}
if (ciego && !register) throw new Error("--ciego necesita --register: cada registro va en su paquete");

const dist = path.join(root, "packages", "linter", "dist");
const api = await import(pathToFileURL(path.join(dist, "api", "index.js")).href);
const { benchmarkContext } = await import(pathToFileURL(path.join(dist, "cli", "benchmark.js")).href);
const { lintDocumentText } = await import(pathToFileURL(path.join(dist, "runner", "index.js")).href);
const ctx = benchmarkContext(api.createContext({ cwd: root, ...(profile ? { config: { profile } } : {}) }));

const manifest = parse(fs.readFileSync(path.join(corpusDir, "manifests", `${partition}.yml`), "utf8"));
const samples = register ? manifest.samples.filter((s) => s.register === register) : manifest.samples;
if (!samples.length) throw new Error(`no hay muestras${register ? ` del registro ${register}` : ""} en ${partition}`);

const out = [];
for (const s of samples) {
  const text = fs.readFileSync(path.join(corpusDir, s.file), "utf8");
  const r = lintDocumentText(text, ctx, { relPath: s.file });
  out.push({
    id: s.id, class: s.class, register: s.register, index: r.score.index, text,
    findings: r.findings.map((f) => ({ key: `${s.id}|${f.rule}|${f.fingerprint}`, rule: f.rule, message: f.message, offset: f.range.start.offset,
      snippet: (f.snippet ?? "").replace(/\s+/g, " ").slice(0, 80) })),
  });
}

if (ciego) escribirPaqueteCiego();
else if (args.includes("--json")) console.log(JSON.stringify(out.map(({ text, ...d }) => d), null, 2));
else for (const d of out) {
  console.log(`${d.id} [${d.class}/${d.register}] índice ${d.index}`);
  for (const f of d.findings) console.log(`  ${f.key}  # ${f.snippet}`);
}

/** El párrafo que contiene el hallazgo, recortado si es muy largo. */
function contexto(text, offset) {
  const partes = text.replace(/\r\n/g, "\n").split(/\n[ \t]*\n/);
  let pos = 0;
  for (const p of partes) {
    if (offset <= pos + p.length) return p.trim().length > 1200 ? `${p.trim().slice(0, 1200)} […]` : p.trim();
    pos += p.length + 2;
  }
  return partes.at(-1).trim();
}

function escribirPaqueteCiego() {
  const reglas = new Map(ctx.pack.rules.map((r) => [r.id, r]));
  // Orden fijo pero sin agrupar por texto ni por clase: por hash de la clave.
  const items = out
    .flatMap((d) => d.findings.filter((f) => !NO_ADJUDICABLES.has(f.rule)).map((f) => ({ ...f, text: d.text })))
    .sort((a, b) => sha(a.key).localeCompare(sha(b.key)));
  // Prefijo propio por registro: con la inicial, readme y redes compartían `r-` y sus respuestas se podían mezclar.
  const pref = { correo: "c", readme: "m", redes: "s" }[register] ?? register;
  const mapa = {};
  const bloques = items.map((it, i) => {
    const id = `${pref}-${String(i + 1).padStart(3, "0")}`;
    mapa[id] = it.key;
    const r = reglas.get(it.rule);
    return [
      `### ${id}`,
      "",
      `Regla: \`${it.rule}\` (${r.title})`,
      `Qué busca: ${r.summary}`,
      `Qué ha visto: ${it.message}`,
      `Fragmento: ${it.snippet ? `"${it.snippet}"` : "(la regla mira el texto entero)"}`,
      "",
      "Contexto:",
      "",
      ...contexto(it.text, it.offset).split("\n").map((l) => `> ${l}`),
      "",
    ].join("\n");
  });
  const excluidos = out.flatMap((d) => d.findings).filter((f) => NO_ADJUDICABLES.has(f.rule)).length;
  const cabecera = [
    `# Adjudicación de hallazgos: ${register}`,
    "",
    `Hay ${items.length} hallazgos de un linter de estilo para textos en español. Para cada uno tienes la regla, qué busca, el fragmento que ha marcado y el párrafo donde está.`,
    "",
    "Contesta si el hallazgo acierta:",
    "",
    "- `correct`: el patrón que describe la regla está de verdad en el fragmento y es el caso de escritura que la regla quiere señalar, lo haya escrito quien lo haya escrito.",
    "- `incorrect`: coincide en la forma pero no es ese caso. Por ejemplo un término técnico o un nombre propio, una cita, una enumeración de datos concretos, código o una expresión que en ese contexto es la normal.",
    "- `dudoso`: con el contexto que tienes no se puede decidir. Lo revisa una persona.",
    "",
    "No juzgues si el texto está bien escrito ni quién lo ha escrito. Solo si la regla ha acertado en lo que dice buscar.",
    "",
    "Responde solo con un bloque YAML, una línea por hallazgo, en este formato:",
    "",
    "```yaml",
    `${pref}-001: correct`,
    `${pref}-002: incorrect`,
    "```",
    "",
    "---",
    "",
    "",
  ].join("\n");
  fs.mkdirSync(ciego, { recursive: true });
  fs.writeFileSync(path.join(ciego, `paquete-${register}.md`), cabecera + bloques.join("\n"), "utf8");
  fs.writeFileSync(
    path.join(ciego, `mapa-${register}.json`),
    JSON.stringify({ corpus: path.relative(root, corpusDir).replace(/\\/g, "/"), partition, register, profile: ctx.config.profile, excluidas: [...NO_ADJUDICABLES], items: mapa }, null, 2) + "\n",
    "utf8",
  );
  console.log(`${register}: ${items.length} hallazgos en el paquete, ${excluidos} de reglas de longitud de frase fuera -> ${path.join(ciego, `paquete-${register}.md`)}`);
}

function sha(s) {
  return createHash("sha256").update(s).digest("hex");
}
