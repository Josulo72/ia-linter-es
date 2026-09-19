#!/usr/bin/env node
/**
 * Gates de calidad (quality-policy.yml). Uso: node scripts/gates.mjs [--only=imports,rules,perf,index,situaciones,agents-md]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";
import { evaluateAdjudicatedPrecision } from "./gate-adjudication.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policy = parseYaml(fs.readFileSync(path.join(root, "quality-policy.yml"), "utf8"));
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "--only=imports,rules,perf,index,situaciones,agents-md").slice(7).split(",");
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
  // AGENTS.md §2 y docs/decisions.md (2026-09-18): la API también lee disco (lintFile, Rule Pack, versión).
  const fsAllowed = ["runner", "cli", "config", "baseline", "rules/compiler", "api"];
  // Todas las formas de cargar un módulo: import con y sin `from`, export … from, import() literal, require y getBuiltinModule.
  const specifiers = [
    /\bimport\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+[^'";]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bgetBuiltinModule\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  let bad = 0;
  for (const f of walk(src)) {
    const rel = path.relative(src, f).replace(/\\/g, "/");
    const code = fs.readFileSync(f, "utf8");
    if (/\bimport\s*\(\s*[^"'\s)]/.test(code) || /\b(require|getBuiltinModule)\s*\(\s*[^"'\s)]/.test(code)) {
      fail(`${rel} carga un módulo con una expresión no literal: el gate no puede comprobarlo`);
      bad++;
    }
    for (const m of specifiers.flatMap((re) => [...code.matchAll(re)])) {
      const mod = m[1].replace(/^node:/, "").replace(/\/promises$/, "");
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
  if (!bad) ok("ningún módulo usa red (import, import(), export from, require, getBuiltinModule); fs solo en runner/cli/config/baseline/compiler/api");
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
  if (!fs.existsSync(rep)) fail("falta benchmark/reports/holdout-v1.1.json");
  else {
    let r = JSON.parse(fs.readFileSync(rep, "utf8"));
    // Si la clase humana está descargada en este equipo, el holdout se recalcula con el Rule Pack actual y se compara
    // con el informe publicado. Si no (en CI no está: no se redistribuye), se usa el informe y se dice.
    const corpusDir = path.join(root, "corpus");
    const manifest = parseYaml(fs.readFileSync(path.join(corpusDir, "manifests", "holdout.yml"), "utf8"));
    const completo = manifest.samples.every((s) => fs.existsSync(path.join(corpusDir, s.file)));
    if (completo && pack) {
      const toUrl = (p) => p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:");
      const api = await import(toUrl(path.join(root, "packages", "linter", "dist", "api", "index.js")));
      const { runBenchmark } = await import(toUrl(path.join(root, "packages", "linter", "dist", "cli", "benchmark.js")));
      const ctx = api.createContext({ cwd: root, config: { profile: r.config.profile } });
      const hoy = runBenchmark(ctx, corpusDir, "holdout");
      const a = (x) => JSON.stringify([x.aggregate.index_median_human, x.aggregate.index_median_ai, x.aggregate.confusion]);
      if (a(hoy) !== a(r)) fail(`holdout v1.1 recalculado con el Rule Pack actual no coincide con el informe publicado: ${a(hoy)} frente a ${a(r)}`);
      else ok("holdout v1.1 recalculado con el Rule Pack actual: coincide con benchmark/reports/holdout-v1.1.json");
      r = hoy;
    } else {
      console.log("  · holdout v1.1 no recalculado: la clase humana no está descargada aquí; se lee benchmark/reports/holdout-v1.1.json");
    }
    const gap = r.aggregate.index_median_ai - r.aggregate.index_median_human;
    if (gap < policy.index.min_median_gap) fail(`separación de medianas del índice: ${gap} < ${policy.index.min_median_gap}`);
    else ok(`separación de medianas del índice: ${gap} (mínimo ${policy.index.min_median_gap})`);
    // El estado de cada regla sale del Rule Pack actual, no del que había cuando se generó el informe.
    const estado = new Map((pack?.rules ?? []).map((x) => [x.id, x.status]));
    const stables = Object.entries(r.per_rule).filter(([k]) => estado.get(k) === "stable");
    const sinMedir = [...estado].filter(([k, s]) => s === "stable" && !(k in r.per_rule)).map(([k]) => k);
    if (sinMedir.length) fail(`reglas stable que el informe no mide: ${sinMedir.join(", ")}`);
    const badRules = stables.filter(([, v]) => v.fp_per_1000_human_words > policy.rules.max_fp_per_1000_human_words);
    if (badRules.length) fail(`reglas stable con FP/1000 > ${policy.rules.max_fp_per_1000_human_words}: ${badRules.map(([k]) => k).join(", ")}`);
    else {
      // Una regla que no ha marcado nada tiene FP 0 por vacío, no por buena: se cuenta aparte.
      const conEvidencia = stables.filter(([, v]) => v.docs_human + v.docs_ai > 0).length;
      ok(`${conEvidencia} de ${stables.length} reglas stable disparan en este corpus, todas con FP/1000 <= ${policy.rules.max_fp_per_1000_human_words}`);
      if (conEvidencia < stables.length) {
        console.log(`  · ${stables.length - conEvidencia} reglas stable no marcan nada aquí: su FP es 0 por vacío (ver benchmark/reports/auditoria-banco-v1.1.md)`);
      }
    }
    // La precision se decide con las rondas development adjudicadas a ciegas.
    // Holdout v1.1 se conserva para separacion y falsos positivos.
    const registers = ["correo", "readme", "redes"];
    const adjudicatedVersions = ["v1.2", "v1.3"];
    const developmentPaths = adjudicatedVersions.flatMap((version) => registers.map((register) =>
      path.join(root, "benchmark", "reports", `development-${version}-${register}.json`),
    ));
    const missingDevelopment = developmentPaths.filter((file) => !fs.existsSync(file));
    if (missingDevelopment.length) {
      fail(`faltan informes de adjudicacion: ${missingDevelopment.map((file) => path.relative(root, file)).join(", ")}`);
    } else {
      const adjudication = evaluateAdjudicatedPrecision({
        stableRuleIds: [...estado].filter(([, status]) => status === "stable").map(([id]) => id),
        reports: developmentPaths.map((file) => JSON.parse(fs.readFileSync(file, "utf8"))),
        minPrecision: policy.rules.min_adjudicated_precision,
        minFindings: policy.rules.min_adjudicated_findings,
        exemptRuleIds: policy.rules.adjudication_exempt_rules,
      });
      if (adjudication.below.length) {
        fail(`reglas stable con precision adjudicada < ${policy.rules.min_adjudicated_precision}: ${adjudication.below.map((x) => `${x.id} (${x.precision.toFixed(2)}, n=${x.findings})`).join(", ")}`);
      } else if (adjudication.measured.length) {
        ok(`${adjudication.measured.length} reglas stable con muestra suficiente cumplen precision >= ${policy.rules.min_adjudicated_precision}`);
      } else {
        console.log(`  - ninguna regla stable ha alcanzado aun la muestra minima de ${policy.rules.min_adjudicated_findings}`);
      }
      if (adjudication.insufficient.length) console.log(`  - ${adjudication.insufficient.length} reglas stable pendientes de muestra minima`);
      if (adjudication.exempt.length) console.log(`  - ${adjudication.exempt.length} regla(s) stable no adjudicable(s) por fragmento: ${adjudication.exempt.join(", ")}`);
    }
  }
}

/* ---------------- Gate: situaciones (guía y perfiles cuadran) ---------------- */
if (only.includes("situaciones")) {
  console.log("Gate situaciones");
  const rulesDir = path.join(root, "packages", "linter", "rules");
  const guiaPath = path.join(root, "integrations", "claude-code", "guia", "humano.md");
  const sit = parseYaml(fs.readFileSync(path.join(rulesDir, "situaciones.yml"), "utf8"))?.situaciones ?? [];
  const perfiles = new Set(fs.readdirSync(path.join(rulesDir, "profiles")).map((f) => f.replace(/\.yml$/, "")));
  // Las viñetas de «## Según la situación». La del registro formal no es una situación: es la excepción que la guía declara.
  const guia = fs.readFileSync(guiaPath, "utf8").replace(/\r\n/g, "\n");
  const seccion = guia.split(/^## /m).find((s) => s.startsWith("Según la situación")) ?? "";
  const vinetas = seccion.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
  const NO_SITUACION = ["Si el encargo pide"];
  let bad = 0;
  if (!seccion) {
    fail("la guía no tiene la sección «## Según la situación»");
    bad++;
  }
  for (const s of sit) {
    if (!perfiles.has(s.perfil)) {
      fail(`situación ${s.id}: el perfil ${s.perfil} no está en rules/profiles`);
      bad++;
    }
    if (!vinetas.some((v) => v.startsWith(s.guia))) {
      fail(`situación ${s.id}: la guía no tiene una viñeta que empiece por «${s.guia}»`);
      bad++;
    }
  }
  for (const v of vinetas) {
    if (NO_SITUACION.some((x) => v.startsWith(x))) continue;
    if (!sit.some((s) => v.startsWith(s.guia))) {
      fail(`la guía describe una situación sin entrada en situaciones.yml: «${v.slice(0, 50)}…»`);
      bad++;
    }
  }
  // Y el archivo tiene que cargar igual que lo carga la CLI (ids, perfiles y globs válidos).
  const dist = path.join(root, "packages", "linter", "dist", "config", "situaciones.js");
  if (fs.existsSync(dist)) {
    try {
      const { loadSituaciones } = await import(pathToFileURL(dist).href);
      loadSituaciones(path.join(rulesDir, "situaciones.yml"));
    } catch (e) {
      fail(`situaciones.yml no carga: ${e.message}`);
      bad++;
    }
  }
  if (!bad) ok(`${sit.length} situaciones con su perfil y su viñeta en la guía; ninguna viñeta sin situación`);
}

/* ---------------- Gate: agents-md (el fragmento está al día con la guía) ---------------- */
if (only.includes("agents-md")) {
  console.log("Gate agents-md");
  const { generar, SALIDA } = await import(pathToFileURL(path.join(root, "integrations", "agents-md", "build.mjs")).href);
  const actual = fs.existsSync(SALIDA) ? fs.readFileSync(SALIDA, "utf8").replace(/\r\n/g, "\n") : "";
  if (actual !== generar()) fail("integrations/agents-md/escribir-en-espanol.md no está al día con la guía: node integrations/agents-md/build.mjs");
  else ok("escribir-en-espanol.md coincide con lo que genera la guía");
}

console.log(failures.length ? `\n${failures.length} gate(s) fallido(s)` : "\nTodos los gates en verde");
process.exit(failures.length ? 1 : 0);
