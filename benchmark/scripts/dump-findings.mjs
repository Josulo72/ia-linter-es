#!/usr/bin/env node
// Lista los hallazgos de una partición con la misma clave que usa `benchmark run` para las adjudicaciones
// (`<id>|<regla>|<huella>`), más el índice por documento. Sirve para redactar benchmark/annotations/<partición>.yml.
// Uso: node benchmark/scripts/dump-findings.mjs development [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const partition = process.argv[2] ?? "development";
if (partition === "holdout" && !fs.existsSync(path.join(root, "benchmark", "reports", "holdout-v1.0.json")))
  throw new Error("el holdout no se inspecciona antes de su ejecución única");
const api = await import(pathToFileURL(path.join(root, "packages", "linter", "dist", "api", "index.js")).href);
const manifest = parse(fs.readFileSync(path.join(root, "corpus", "manifests", `${partition}.yml`), "utf8"));
const out = [];
for (const s of manifest.samples) {
  const text = fs.readFileSync(path.join(root, "corpus", s.file), "utf8");
  // Misma configuración que el benchmark: valores por defecto, sin overrides ni caché.
  const r = api.lintText(text, { path: s.file, config: {} });
  out.push({ id: s.id, class: s.class, register: s.register, index: r.score.index,
    findings: r.findings.map((f) => ({ key: `${s.id}|${f.rule}|${f.fingerprint}`, rule: f.rule, snippet: (f.snippet ?? "").replace(/\s+/g, " ").slice(0, 80) })) });
}
if (process.argv.includes("--json")) console.log(JSON.stringify(out, null, 2));
else for (const d of out) { console.log(`${d.id} [${d.class}/${d.register}] índice ${d.index}`); for (const f of d.findings) console.log(`  ${f.key}  # ${f.snippet}`); }
