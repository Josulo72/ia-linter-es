#!/usr/bin/env node
// Construye corpus-v1.2/manifests/{development,holdout,challenge}.yml del corpus v1.2 (registros correo, readme y redes).
// - Clase humana: lo aceptado por fetch-registros.mjs (corpus-v1.2/manifests/_human_{correo,readme,redes}.yml; textos solo en local).
// - Clase IA base (development y holdout) y guiada (challenge), según corpus/policy/prompts-v1.2.yml.
// - Deduplica (hash exacto y solapamiento de 8-gramas) entre todas las particiones.
// - Congela el holdout: escribe benchmark/configs/holdout-v1.2.lock la primera vez y falla si después cambia.
// El corpus v1.1 (registro cotidiano) sigue en corpus/ con sus manifiestos y su lock.
// Sin red. Salida determinista: los manifiestos no contienen marcas de tiempo de ejecución.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const corpus = path.join(root, "corpus-v1.2");
const PARTITIONS = ["development", "holdout", "challenge"];
const REGISTROS = ["correo", "readme", "redes"];
const sha = (s) => createHash("sha256").update(s).digest("hex");
const words = (s) => (s.match(/\S+/g) ?? []).length;
const die = (m) => {
  console.error(`ERROR: ${m}`);
  process.exit(1);
};

const prompts = parse(fs.readFileSync(path.join(root, "corpus", "policy", "prompts-v1.2.yml"), "utf8"));
const samples = Object.fromEntries(PARTITIONS.map((p) => [p, []]));

for (const reg of REGISTROS) {
  const mf = path.join(corpus, "manifests", `_human_${reg}.yml`);
  if (!fs.existsSync(mf)) die(`falta ${path.relative(root, mf)}; ejecuta benchmark/scripts/fetch-registros.mjs --source ${reg}`);
  for (const h of parse(fs.readFileSync(mf, "utf8")).samples) {
    const part = h.file.split("/")[0];
    if (!PARTITIONS.includes(part)) die(`${h.id}: partición desconocida en ${h.file}`);
    if (!fs.existsSync(path.join(corpus, h.file))) die(`${h.id}: falta el texto local ${h.file}; ejecuta fetch-registros.mjs --source ${reg}`);
    samples[part].push(h);
  }
}

for (const p of prompts.prompts) {
  for (const cond of ["base", "guiada"]) {
    const id = cond === "base" ? `ai-${p.id}` : `ai-g-${p.id}`;
    const part = cond === "base" ? p.partition : "challenge";
    const rel = `${part}/${id}.md`;
    const abs = path.join(corpus, rel);
    if (!fs.existsSync(abs)) die(`${id}: falta ${rel}`);
    // Normaliza finales de línea y espacio final; es la única edición sobre el texto bruto.
    const raw = fs.readFileSync(abs, "utf8");
    const text = raw.replace(/\r\n?/g, "\n").trimEnd() + "\n";
    if (text !== raw) fs.writeFileSync(abs, text, "utf8");
    samples[part].push({
      id,
      class: "ai",
      file: rel,
      register: p.register,
      theme: p.theme,
      prompt_id: p.id,
      condition: cond,
      origin_partition: p.partition,
      provider: prompts.provider,
      model: p.model,
      generated: prompts.generated,
      harness: prompts.harness,
      system_prompt: "el del arnés; no visible",
      parameters: "los del arnés; no controlables",
      edits: "ninguna (solo finales de línea)",
      words: words(text),
      sha256: sha(text),
    });
  }
}

const all = PARTITIONS.flatMap((p) => samples[p]);
const shingles = new Map();
const ids = new Set();
const hashes = new Map();
for (const s of all) {
  const text = fs.readFileSync(path.join(corpus, s.file), "utf8");
  if (sha(text) !== s.sha256) die(`${s.id}: el archivo no coincide con el hash registrado`);
  if (ids.has(s.id)) die(`id duplicado: ${s.id}`);
  ids.add(s.id);
  if (hashes.has(s.sha256)) die(`texto duplicado: ${s.id} = ${hashes.get(s.sha256)}`);
  hashes.set(s.sha256, s.id);
  const toks = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const set = new Set();
  for (let i = 0; i + 8 <= toks.length; i++) set.add(toks.slice(i, i + 8).join(" "));
  shingles.set(s.id, set);
}
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = shingles.get(all[i].id);
    const b = shingles.get(all[j].id);
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    const overlap = inter / Math.max(1, Math.min(a.size, b.size));
    if (overlap > 0.2) die(`casi duplicados (${(overlap * 100).toFixed(0)} % de 8-gramas): ${all[i].id} y ${all[j].id}`);
  }
}

for (const p of PARTITIONS) {
  const body = stringify({ schema_version: 1, corpus_version: "1.2", partition: p, samples: samples[p] }, { lineWidth: 0 });
  fs.writeFileSync(path.join(corpus, "manifests", `${p}.yml`), `# Generado por benchmark/scripts/build-manifests-v1.2.mjs. No editar a mano.\n${body}`, "utf8");
  const h = samples[p].filter((s) => s.class === "human").length;
  const porReg = REGISTROS.map((r) => `${r} ${samples[p].filter((s) => s.register === r).length}`).join(", ");
  console.log(`${p}: ${samples[p].length} muestras (${h} humanas, ${samples[p].length - h} IA) · ${porReg}`);
}

const lockFile = path.join(root, "benchmark", "configs", "holdout-v1.2.lock");
const holdoutSha = sha(fs.readFileSync(path.join(corpus, "manifests", "holdout.yml"), "utf8"));
if (fs.existsSync(lockFile)) {
  const lock = parse(fs.readFileSync(lockFile, "utf8"));
  if (lock.manifest_sha256 !== holdoutSha) die("el manifiesto de holdout ha cambiado tras su congelación (benchmark/configs/holdout-v1.2.lock)");
  console.log("holdout: coincide con holdout-v1.2.lock");
} else {
  fs.writeFileSync(
    lockFile,
    stringify({
      schema_version: 1,
      manifest: "corpus-v1.2/manifests/holdout.yml",
      manifest_sha256: holdoutSha,
      frozen: new Date().toISOString().slice(0, 10),
      samples: samples.holdout.length,
    }),
    "utf8",
  );
  console.log(`holdout congelado: ${holdoutSha}`);
}
