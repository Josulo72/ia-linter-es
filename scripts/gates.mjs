#!/usr/bin/env node
/**
 * Gates de calidad (quality-policy.yml). Uso: node scripts/gates.mjs [--only=imports,perf,rules,index]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policy = parseYaml(fs.readFileSync(path.join(root, "quality-policy.yml"), "utf8"));
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "--only=imports,rules,perf,index").slice(7).split(",");
const failures = [];
const ok = (msg) => console.log(`  ✔ ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.log(`  ✘ ${msg}`);
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|js|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

/* ---------------- Gate: imports (sin red, fs acotado) ---------------- */
if (only.includes("imports")) {
  console.log("Gate imports");
  const src = path.join(root, "packages", "linter", "src");
  const forbidden = ["http", "https", "net", "dns", "tls", "dgram", "http2", "child_process", "worker_threads"];
  const fsAllowed = ["runner", "cli", "config", "baseline", "rules/compiler", "paths.ts", "api"];
  let bad = 0;
  for (const f of walk(src)) {
    const rel = path.relative(src, f).replace(/\\/g, "/");
    const code = fs.readFileSync(f, "utf8");
    for (const m of code.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/gm)) {
      const mod = (m[1] ?? m[2]).replace(/^node:/, "");
      if (forbidden.includes(mod)) {
        fail(`${rel} importa ${mod}`);
        bad++;
      }
      if (mod === "fs" && !fsAllowed.some((a) => rel.startsWith(a))) {
        fail(`${rel} importa fs fuera de los módulos permitidos`);
        bad++;
      }
      if (/^(node-fetch|axios|undici|got)$/.test(mod)) {
        fail(`${rel} importa cliente HTTP ${mod}`);
        bad++;
      }
    }
    if (/\bfetch\s*\(/.test(code)) {
      fail(`${rel} usa fetch()`);
      bad++;
    }
  }
  if (!bad) ok("ningún módulo usa red; fs solo en runner/cli/config/baseline/compiler/api");
}

/* ---------------- Gate: reglas (rulepack) ---------------- */
let pack = null;
const packPath = path.join(root, "packages", "linter", "rulepack", "rulepack.json");
if (only.includes("rules") || only.includes("perf") || only.includes("index")) {
  if (!fs.existsSync(packPath)) fail(`falta ${path.relative(root, packPath)} (ejecuta pnpm build)`);
  else pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
}
if (only.includes("rules") && pack) {
  console.log("Gate reglas");
  const stable = pack.rules.filter((r) => r.status === "stable").length;
  if (stable < policy.rules.stable_min || stable > policy.rules.stable_max) fail(`reglas stable: ${stable} (política ${policy.rules.stable_min}-${policy.rules.stable_max})`);
  else ok(`${stable} reglas stable (${pack.rules.length} en el pack)`);
  const cats = new Set(pack.rules.filter((r) => r.status === "stable").map((r) => r.category));
  if (cats.size < 4) fail(`categorías con reglas stable: ${cats.size} < 4`);
  else ok(`${cats.size} categorías distintas`);
  const kinds = new Set(pack.rules.map((r) => r.detector));
  ok(`detectores usados: ${[...kinds].sort().join(", ")}`);
}

/* ---------------- Gate: rendimiento ---------------- */
if (only.includes("perf") && pack) {
  console.log("Gate rendimiento");
  const api = await import(path.join(root, "packages", "linter", "dist", "api", "index.js").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));
  const sample = fs.readFileSync(path.join(root, "examples", "muestra-ia.md"), "utf8");
  let text = "";
  while (text.split(/\s+/).length < 10_000) text += sample + "\n\n";
  api.lintText(text, { format: "markdown" }); // calentamiento
  const t0 = performance.now();
  api.lintText(text, { format: "markdown" });
  const ms = Math.round(performance.now() - t0);
  if (ms > policy.performance.max_ms_per_10k_words) fail(`10k palabras: ${ms} ms > ${policy.performance.max_ms_per_10k_words} ms`);
  else ok(`10k palabras en ${ms} ms (límite ${policy.performance.max_ms_per_10k_words})`);
}

/* ---------------- Gate: índice (benchmark publicado) ---------------- */
if (only.includes("index")) {
  console.log("Gate benchmark");
  const rep = path.join(root, "benchmark", "reports", "holdout-v1.1.json");
  if (!fs.existsSync(rep)) fail("falta benchmark/reports/holdout-v1.0.json");
  else {
    const r = JSON.parse(fs.readFileSync(rep, "utf8"));
    const gap = r.aggregate.index_median_ai - r.aggregate.index_median_human;
    if (gap < policy.index.min_median_gap) fail(`separación de medianas del índice: ${gap} < ${policy.index.min_median_gap}`);
    else ok(`separación de medianas del índice: ${gap} (mínimo ${policy.index.min_median_gap})`);
    const badRules = Object.entries(r.per_rule).filter(([, v]) => v.status === "stable" && v.fp_per_1000_human_words > policy.rules.max_fp_per_1000_human_words);
    if (badRules.length) fail(`reglas stable con FP/1000 > ${policy.rules.max_fp_per_1000_human_words}: ${badRules.map(([k]) => k).join(", ")}`);
    else {
      // Una regla que no ha marcado nada tiene FP 0 por vacío, no por buena: se cuenta aparte.
      const stables = Object.entries(r.per_rule).filter(([, v]) => v.status === "stable");
      const conEvidencia = stables.filter(([, v]) => v.docs_human + v.docs_ai > 0).length;
      ok(`${conEvidencia} de ${stables.length} reglas stable disparan en este corpus, todas con FP/1000 <= ${policy.rules.max_fp_per_1000_human_words}`);
      if (conEvidencia < stables.length) {
        console.log(`  · ${stables.length - conEvidencia} reglas stable no marcan nada aquí: su FP es 0 por vacío (ver benchmark/reports/auditoria-banco-v1.1.md)`);
      }
    }
  }
}

console.log(failures.length ? `\n${failures.length} gate(s) fallido(s)` : "\nTodos los gates en verde");
process.exit(failures.length ? 1 : 0);
