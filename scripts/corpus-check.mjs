#!/usr/bin/env node
/**
 * Comprobación del corpus (sin red): licencias, trazabilidad, hashes, particiones, congelación del holdout y veto.
 * Uso: node scripts/corpus-check.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPORA = [
  { label: "v1.1", dir: path.join(root, "corpus"), lock: "holdout-v1.1.lock", prompts: "prompts-v1.1.yml" },
  { label: "v1.0 (archivo)", dir: path.join(root, "corpus", "archive", "v1.0"), lock: "holdout-v1.0.lock", prompts: "prompts.yml" },
];
const yml = (...p) => parseYaml(fs.readFileSync(path.join(root, ...p), "utf8"));
const policy = yml("quality-policy.yml");
const sources = yml("corpus", "policy", "sources.yml");
const licenses = yml("corpus", "policy", "licenses.yml");
const veto = yml(policy.corpus.veto_file);
const failures = [];
const fail = (m) => { failures.push(m); console.log(`  ✘ ${m}`); };
const ok = (m) => console.log(`  ✔ ${m}`);

let missingLocal = 0;
for (const C of CORPORA) {
const corpus = C.dir;
const prompts = yml("corpus", "policy", C.prompts);
console.log(`Corpus ${C.label}: manifiestos`);
const allowed = new Set(policy.corpus.allowed_licenses);
if (JSON.stringify([...allowed].sort()) !== JSON.stringify([...licenses.allowed].sort())) fail("licenses.yml y quality-policy.yml no admiten las mismas licencias");
const allowIds = new Map(sources.records.map((r) => [r.id, r]));
const promptIds = new Map(prompts.prompts.map((p) => [p.id, p]));
const seen = new Map();
for (const part of ["development", "holdout", "challenge"]) {
  const before = failures.length;
  const m = parseYaml(fs.readFileSync(path.join(corpus, "manifests", `${part}.yml`), "utf8"));
  if (m.partition !== part) fail(`${part}.yml declara la partición ${m.partition}`);
  const listed = new Set();
  for (const s of m.samples) {
    const where = `${part}/${s.id}`;
    if (seen.has(s.id)) fail(`${where}: id repetido en ${seen.get(s.id)}`);
    seen.set(s.id, part);
    if (!s.file?.startsWith(`${part}/`)) fail(`${where}: archivo fuera de su partición (${s.file})`);
    listed.add(s.file);
    const abs = path.join(corpus, s.file ?? "");
    if (!fs.existsSync(abs)) {
      if (s.storage === "local") missingLocal++; // texto no redistribuido: solo se comprueba si está descargado
      else fail(`${where}: falta ${s.file}`);
      if (s.storage !== "local") continue;
    }
    const text = fs.readFileSync(abs, "utf8");
    if (createHash("sha256").update(text).digest("hex") !== s.sha256) fail(`${where}: hash distinto`);
    if (text.includes("\r")) fail(`${where}: finales de línea CRLF`);
    if (s.class === "human") {
      if (s.storage === "local") {
        // Texto de foro: no se redistribuye, así que no hay allowlist ni licencia abierta; se exige origen y no publicación.
        if (!/^foro:/.test(String(s.source))) fail(`${where}: storage local sin foro de origen`);
        if (allowed.has(s.license)) fail(`${where}: un texto no redistribuible no puede declarar licencia abierta`);
      } else {
        const rec = allowIds.get(s.id);
        if (!rec) fail(`${where}: no está en la allowlist sources.yml`);
        else if (rec.partition !== part) fail(`${where}: la allowlist lo asigna a ${rec.partition}`);
        if (!allowed.has(s.license)) fail(`${where}: licencia no admitida (${s.license})`);
        if (licenses.sources[s.source]?.license !== s.license) fail(`${where}: licencia distinta de la documentada para ${s.source}`);
      }
      for (const k of ["source_url", "author", "date", "human_evidence", "register"]) if (!s[k]) fail(`${where}: falta ${k}`);
      if (!(String(s.date) < sources.cutoff_date)) fail(`${where}: fecha ${s.date} no anterior a ${sources.cutoff_date}`);
      if (!["H1", "H2", "H3"].includes(s.level)) fail(`${where}: nivel ${s.level}`);
      if (s.level === "H3" && part !== "challenge") fail(`${where}: H3 solo se admite en challenge`);
    } else if (s.class === "ai") {
      const p = promptIds.get(s.prompt_id);
      if (!p) fail(`${where}: prompt_id sin registrar`);
      else if (p.model !== s.model || p.partition !== (s.origin_partition ?? part)) fail(`${where}: no coincide con ${C.prompts}`);
      if (s.condition === "guiada" && part !== "challenge") fail(`${where}: la condición guiada solo va en challenge`);
      for (const k of ["provider", "model", "generated", "edits", "register"]) if (!s[k]) fail(`${where}: falta ${k}`);
    } else fail(`${where}: clase ${s.class}`);
  }
  for (const f of fs.readdirSync(path.join(corpus, part))) if (!listed.has(`${part}/${f}`)) fail(`${part}/${f}: archivo sin entrada en el manifiesto`);
  if (failures.length === before) ok(`${part}: ${m.samples.length} muestras con licencia, trazabilidad y hash correctos`);
}

console.log(`Corpus ${C.label}: congelación del holdout`);
const lockFile = path.join(root, "benchmark", "configs", C.lock);
if (!fs.existsSync(lockFile)) fail(`falta benchmark/configs/${C.lock}`);
else {
  const lock = parseYaml(fs.readFileSync(lockFile, "utf8"));
  const h = createHash("sha256").update(fs.readFileSync(path.join(corpus, "manifests", "holdout.yml"), "utf8")).digest("hex");
  if (h !== lock.manifest_sha256) fail(`holdout.yml no coincide con ${C.lock}`);
  else ok(`holdout congelado el ${lock.frozen}`);
}
}
if (missingLocal) console.log(`  · ${missingLocal} textos de foro no descargados en este equipo (no se redistribuyen): ejecuta benchmark/scripts/fetch-foros.mjs`);

console.log("Corpus: veto");
const patterns = veto.vetoed.flatMap((v) => v.patterns.map((p) => [v.name, p.toLowerCase()]));
const exempt = new Set(veto.citation_allowed.map((p) => p.replace(/\\/g, "/")));
let scanned = 0;
const hitsBefore = failures.length;
for (const d of veto.scan) {
  const abs = path.join(root, d);
  if (!fs.existsSync(abs)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      const rel = path.relative(root, p).replace(/\\/g, "/");
      if (e.isDirectory()) { if (e.name !== "node_modules") walk(p); continue; }
      if ([...exempt].some((x) => rel === x || rel.startsWith(`${x}/`))) continue;
      scanned++;
      const hay = `${rel}\n${fs.readFileSync(p, "utf8")}`.toLowerCase();
      for (const [name, pat] of patterns) if (hay.includes(pat)) fail(`${rel}: referencia vetada (${name})`);
    }
  })(abs);
}
if (failures.length === hitsBefore) ok(`${scanned} archivos sin referencias vetadas`);

console.log(failures.length ? `\n${failures.length} fallo(s) de corpus` : "\nCorpus en verde");
process.exit(failures.length ? 1 : 0);
