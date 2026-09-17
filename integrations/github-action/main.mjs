#!/usr/bin/env node
// GitHub Action de ia-linter-es. No contiene lógica de análisis: llama a la misma CLI
// y traduce su JSON a anotaciones, salidas y código de salida. No redefine reglas ni umbrales.
// Sin dependencias: las anotaciones son comandos de workflow por stdout y las salidas van a $GITHUB_OUTPUT.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// GitHub pasa cada entrada como INPUT_<NOMBRE> en mayúsculas y con los espacios en guión bajo;
// el guión se conserva. Se acepta también la variante con guión bajo, que es como la escribe mucha gente.
const input = (name) => {
  const base = name.toUpperCase().replace(/ /g, "_");
  return (process.env[`INPUT_${base}`] ?? process.env[`INPUT_${base.replace(/-/g, "_")}`] ?? "").trim();
};
const bool = (name, def) => { const v = input(name).toLowerCase(); return v === "" ? def : v === "true" || v === "1" || v === "yes"; };

const cwd = path.resolve(input("working-directory") || ".");
if (!fs.existsSync(cwd)) fail(`working-directory no existe: ${cwd}`);

function fail(msg) {
  process.stdout.write(`::error::ia-linter-es: ${msg}\n`);
  process.exit(1);
}

/** Localiza la CLI: primero la instalada en el proyecto, después el bundle que acompaña a la Action. */
function resolveCli() {
  const fromEnv = process.env.IA_LINTER_CLI;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  let dir = cwd;
  for (;;) {
    const p = path.join(dir, "node_modules", "ia-linter-es", "dist", "cli", "main.js");
    if (fs.existsSync(p)) return p;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const bundled = path.join(here, "bundle", "dist", "cli.mjs");
  if (fs.existsSync(bundled)) return bundled;
  fail("no encuentro la CLI. Instala ia-linter-es en el proyecto (npm i -D ia-linter-es) antes de este paso.");
}

const args = ["lint", "--format", "json", "--no-color"];
const paths = input("paths");
if (paths) args.push(...paths.split(/\s+/).filter(Boolean));
for (const [inputName, flag] of [["config", "--config"], ["profile", "--profile"], ["fail-on", "--fail-on"], ["max-index", "--max-index"], ["baseline", "--baseline"]]) {
  const v = input(inputName);
  if (v) args.push(flag, v);
}
// --config es una opción global de la CLI y va antes del subcomando.
const gi = args.indexOf("--config");
if (gi > 0) args.unshift(...args.splice(gi, 2));

const cli = resolveCli();
const run = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
if (run.error) fail(run.error.message);
if (run.status === 2 || (run.status !== 0 && run.status !== 1)) fail((run.stderr || run.stdout || "error desconocido").trim());

let result;
try {
  result = JSON.parse(run.stdout);
} catch {
  fail(`la CLI no devolvió JSON:\n${(run.stdout || run.stderr).slice(0, 2000)}`);
}

const levelCommand = { error: "error", warning: "warning", info: "notice" };
let findings = 0;
const counts = { error: 0, warning: 0, info: 0 };
let maxIndex = 0;
const annotate = bool("annotations", true);

for (const file of result.files) {
  if (typeof file.score?.index === "number") maxIndex = Math.max(maxIndex, file.score.index);
  for (const f of file.findings) {
    if (f.suppressed) continue;
    findings++;
    counts[f.level] = (counts[f.level] ?? 0) + 1;
    if (!annotate) continue;
    const props = [
      `file=${escapeProp(file.path)}`,
      `line=${f.range.start.line}`,
      `col=${f.range.start.column}`,
      `endLine=${f.range.end.line}`,
      `endColumn=${f.range.end.column}`,
      `title=${escapeProp(f.rule)}`,
    ].join(",");
    process.stdout.write(`::${levelCommand[f.level] ?? "notice"} ${props}::${escapeData(f.message)}\n`);
  }
}

for (const [inputName, flag] of [["sarif", "sarif"], ["json", "json"]]) {
  const out = input(inputName);
  if (!out) continue;
  const abs = path.resolve(cwd, out);
  const extra = ["lint", "--format", flag, "--no-color", "--output", abs, ...(paths ? paths.split(/\s+/).filter(Boolean) : [])];
  for (const [n, f] of [["config", "--config"], ["profile", "--profile"], ["fail-on", "--fail-on"], ["max-index", "--max-index"], ["baseline", "--baseline"]]) {
    const v = input(n);
    if (v) extra.push(f, v);
  }
  const gj = extra.indexOf("--config");
  if (gj > 0) extra.unshift(...extra.splice(gj, 2));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const r = spawnSync(process.execPath, [cli, ...extra], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status === 2) fail((r.stderr || "").trim() || `no se pudo escribir ${out}`);
}

const passed = result.policy?.ok === true;
setOutput("findings", String(findings));
setOutput("errors", String(counts.error ?? 0));
setOutput("warnings", String(counts.warning ?? 0));
setOutput("max-index", String(maxIndex));
setOutput("passed", String(passed));

summary(result, findings, counts, maxIndex, passed);

if (!passed) {
  for (const r of result.policy?.reasons ?? []) process.stdout.write(`::error::${escapeData(r)}\n`);
  process.exit(1);
}

function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  const d = `ghadelimiter_${name}`;
  fs.appendFileSync(file, `${name}<<${d}\n${value}\n${d}\n`, "utf8");
}

function summary(result, findings, counts, maxIndex, passed) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  const porRegla = new Map();
  for (const f of result.files) for (const x of f.findings) if (!x.suppressed) porRegla.set(x.rule, (porRegla.get(x.rule) ?? 0) + 1);
  const top = [...porRegla.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  const lines = [
    `## ia-linter-es`,
    "",
    `${result.files.length} archivo(s), ${findings} hallazgo(s): ${counts.error ?? 0} error, ${counts.warning ?? 0} warning, ${counts.info ?? 0} info. Índice más alto: ${maxIndex}.`,
    "",
    ...(top.length ? ["| Regla | Hallazgos |", "|---|---|", ...top.map(([r, n]) => `| \`${r}\` | ${n} |`), ""] : []),
    passed ? "Política cumplida." : `Política incumplida: ${(result.policy?.reasons ?? []).join("; ")}`,
    "",
  ];
  fs.appendFileSync(file, lines.join("\n"), "utf8");
}

function escapeData(s) {
  return String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProp(s) {
  return escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}
