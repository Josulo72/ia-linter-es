#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import type { Level, ScanResult } from "../contracts/index.js";
import { explainConfig, loadConfig } from "../config/index.js";
import { createBaseline, readBaseline, updateBaseline, writeBaseline } from "../baseline/index.js";
import { render, type ReporterName } from "../reporters/index.js";
import { scanProject, lintDocumentText, evaluatePolicy, type RunnerContext } from "../runner/index.js";
import { loadRulePack, toolVersion } from "../api/index.js";
import { SCHEMA_VERSION } from "../contracts/index.js";

/** Códigos de salida: 0 OK, 1 la política falla, 2 error de uso o configuración. */
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;

function die(msg: string): never {
  process.stderr.write(`ia-linter-es: ${msg}\n`);
  process.exit(EXIT_USAGE);
}

interface GlobalOpts {
  config?: string;
  cwd?: string;
  rulepack?: string;
}

function context(g: GlobalOpts): RunnerContext & { configFile: string | null } {
  const cwd = path.resolve(g.cwd ?? process.cwd());
  const loaded = loadConfig({ cwd, file: g.config });
  if (g.config && !fs.existsSync(path.resolve(cwd, g.config))) die(`no existe el archivo de configuración ${g.config}`);
  if (loaded.issues.length) {
    die(`configuración inválida (${loaded.file}):\n` + loaded.issues.map((i) => `  ${i.path || "(raíz)"}: ${i.message}`).join("\n"));
  }
  let pack;
  try {
    pack = loadRulePack(g.rulepack);
  } catch (e) {
    die((e as Error).message);
  }
  return { config: loaded.config, root: loaded.root, pack, toolVersion: toolVersion(), configFile: loaded.file };
}

function readStdin(): string {
  return fs.readFileSync(0, "utf8");
}

const program = new Command();
program
  .name("ia-linter-es")
  .description("Linter determinista de patrones de escritura de IA en español. Mide patrones editoriales, no autoría.")
  .version(toolVersion())
  .option("-c, --config <archivo>", "archivo de configuración (por defecto se busca ia-linter.yml hacia arriba)")
  .option("--cwd <dir>", "directorio de trabajo")
  .option("--rulepack <archivo>", "Rule Pack alternativo (JSON compilado)");

program
  .command("lint")
  .description("analiza archivos, directorios o globs")
  .argument("[rutas...]", "archivos, directorios o globs (por defecto, el proyecto)")
  .option("-f, --format <reporter>", "terminal | json | sarif")
  .option("-o, --output <archivo>", "escribe el informe en un archivo")
  .option("--stdin", "lee el texto de la entrada estándar")
  .option("--stdin-filename <nombre>", "nombre lógico para --stdin (decide formato y overrides)")
  .option("--fail-on <nivel>", "never | info | warning | error")
  .option("--max-index <n>", "falla si el índice de algún archivo supera n")
  .option("--profile <perfil>", "general | tecnico | academico | marketing | chat | correo | readme | redes")
  .option("--baseline <archivo>", "baseline a aplicar")
  .option("--no-baseline", "ignora la baseline configurada")
  .option("--no-cache", "no usa la caché")
  .option("--no-color", "sin color")
  .option("-v, --verbose", "muestra snippets, contribuyentes y archivos sin hallazgos")
  .action((rutas: string[], o) => {
    const ctx = context(program.opts<GlobalOpts>());
    if (o.failOn) {
      if (!["never", "info", "warning", "error"].includes(o.failOn)) die("--fail-on debe ser never, info, warning o error");
      ctx.config.fail_on = o.failOn as Level | "never";
    }
    if (o.maxIndex !== undefined) {
      const n = Number(o.maxIndex);
      if (!Number.isFinite(n) || n < 0 || n > 100) die("--max-index debe estar entre 0 y 100");
      ctx.config.max_index = n;
    }
    if (o.profile) {
      if (!["general", "tecnico", "academico", "marketing", "chat", "correo", "readme", "redes"].includes(o.profile)) die("--profile inválido");
      ctx.config.profile = o.profile;
    }
    const reporter = (o.format ?? ctx.config.reporter) as ReporterName;
    if (!["terminal", "json", "sarif"].includes(reporter)) die("--format debe ser terminal, json o sarif");
    let result: ScanResult;
    if (o.stdin) {
      const file = lintDocumentText(readStdin(), ctx, { relPath: o.stdinFilename, format: o.stdinFilename ? undefined : "text" });
      result = {
        schema_version: SCHEMA_VERSION,
        tool: { name: "ia-linter-es", version: ctx.toolVersion, rulepack: ctx.pack.version },
        files: [file],
        policy: evaluatePolicy([file], ctx.config),
        durationMs: 0,
      };
    } else {
      const baseline = o.baseline === false ? null : typeof o.baseline === "string" ? o.baseline : undefined;
      result = scanProject(ctx, { targets: rutas, noCache: o.cache === false, baseline });
      if (rutas.length && result.files.length === 0) die(`ninguna ruta coincide: ${rutas.join(", ")}`);
    }
    const color = o.color !== false && reporter === "terminal" && !o.output && process.stdout.isTTY === true && !process.env.NO_COLOR;
    const out = render(reporter, result, ctx.pack.rules, { color, verbose: o.verbose, uriBase: pathToFileUri(ctx.root) });
    if (o.output) fs.writeFileSync(path.resolve(o.output), out, "utf8");
    else process.stdout.write(out);
    process.exitCode = result.policy.ok ? 0 : EXIT_FAIL;
  });

const rules = program.command("rules").description("consulta las reglas del Rule Pack");
rules
  .command("list")
  .option("--json", "salida JSON")
  .option("--status <estado>", "filtra por estado")
  .action((o) => {
    const ctx = context(program.opts<GlobalOpts>());
    const list = ctx.pack.rules.filter((r) => !o.status || r.status === o.status);
    if (o.json) {
      process.stdout.write(JSON.stringify(list.map((r) => ({ id: r.id, status: r.status, category: r.category, detector: r.detector, default_level: r.default_level, title: r.title })), null, 2) + "\n");
      return;
    }
    const w = Math.max(...list.map((r) => r.id.length));
    for (const r of list) process.stdout.write(`${r.id.padEnd(w)}  ${r.status.padEnd(10)} ${r.default_level.padEnd(8)} ${r.title}\n`);
    process.stdout.write(`\n${list.length} reglas (Rule Pack ${ctx.pack.version})\n`);
  });
rules
  .command("explain")
  .argument("<id>", "identificador de la regla")
  .option("--json", "salida JSON")
  .action((id: string, o) => {
    const ctx = context(program.opts<GlobalOpts>());
    const r = ctx.pack.rules.find((x) => x.id === id);
    if (!r) die(`regla desconocida: ${id}`);
    if (o.json) {
      process.stdout.write(JSON.stringify(r, null, 2) + "\n");
      return;
    }
    process.stdout.write(
      [
        `${r.id}  (rev ${r.revision}, ${r.status})`,
        r.title,
        "",
        r.summary,
        "",
        r.explanation,
        "",
        `Cómo reescribir: ${r.rewrite_guidance}`,
        "",
        `Categoría: ${r.category} · Detector: ${r.detector} · Nivel: ${r.default_level} · Peso: ${r.score.weight} (cap ${r.score.cap})`,
        Object.keys(r.profiles).length ? `Perfiles: ${Object.entries(r.profiles).map(([k, v]) => `${k}=${v}`).join(", ")}` : "",
        "",
      ].join("\n"),
    );
  });

const config = program.command("config").description("valida y explica la configuración");
config.command("validate").action(() => {
  const g = program.opts<GlobalOpts>();
  const loaded = loadConfig({ cwd: path.resolve(g.cwd ?? process.cwd()), file: g.config });
  if (!loaded.file) {
    process.stdout.write("Sin archivo de configuración: se usan los valores internos.\n");
    return;
  }
  const pack = loadRulePack(g.rulepack);
  const known = new Set(pack.rules.map((r) => r.id));
  const cats = new Set(pack.rules.map((r) => `${r.category}/*`));
  const unknown: string[] = [];
  const check = (m: Record<string, Level> | undefined, where: string) => {
    for (const k of Object.keys(m ?? {})) if (!known.has(k) && !cats.has(k)) unknown.push(`${where}.${k}`);
  };
  check(loaded.config.rules, "rules");
  loaded.config.overrides.forEach((o, i) => check(o.rules, `overrides[${i}].rules`));
  for (const i of loaded.issues) process.stdout.write(`✘ ${i.path || "(raíz)"}: ${i.message}\n`);
  for (const u of unknown) process.stdout.write(`✘ ${u}: regla o categoría desconocida\n`);
  if (loaded.issues.length || unknown.length) {
    process.exitCode = EXIT_USAGE;
    return;
  }
  process.stdout.write(`✔ ${loaded.file} es válida\n`);
});
config
  .command("explain")
  .argument("[archivo]", "archivo para el que se resuelve la configuración efectiva")
  .option("--json", "salida JSON")
  .action((archivo: string | undefined, o) => {
    const g = program.opts<GlobalOpts>();
    const cwd = path.resolve(g.cwd ?? process.cwd());
    const loaded = loadConfig({ cwd, file: g.config });
    if (loaded.issues.length) die("configuración inválida; ejecuta `config validate`");
    const pack = loadRulePack(g.rulepack);
    const rel = archivo ? path.relative(loaded.root, path.resolve(cwd, archivo)).replace(/\\/g, "/") : null;
    const ex = explainConfig(loaded, pack.rules, rel);
    if (o.json) {
      process.stdout.write(JSON.stringify(ex, null, 2) + "\n");
      return;
    }
    const c = ex.config;
    process.stdout.write(
      [
        `Archivo de configuración: ${ex.file ?? "(ninguno; valores internos)"}`,
        `Raíz del proyecto:        ${ex.root}`,
        `Archivo analizado:        ${rel ?? "(ninguno)"}`,
        `Perfil: ${c.profile} · Registro: ${c.register} · fail_on: ${c.fail_on} · max_index: ${c.max_index ?? "—"}`,
        `Baseline: ${c.baseline.path ?? "—"} · Caché: ${c.cache.enabled ? c.cache.dir : "desactivada"} · Reporter: ${c.reporter}`,
        "",
        "Reglas (nivel efectivo ← origen):",
        ...ex.effective.map((e) => `  ${e.rule.padEnd(40)} ${e.level.padEnd(8)} ← ${e.source}: ${e.detail}`),
        "",
      ].join("\n"),
    );
  });

const baseline = program.command("baseline").description("gestiona la baseline de hallazgos existentes");
baseline
  .command("create")
  .argument("[rutas...]")
  .option("-o, --output <archivo>", "ruta de la baseline")
  .option("--reason <texto>", "motivo que se guarda en cada entrada")
  .action((rutas: string[], o) => {
    const ctx = context(program.opts<GlobalOpts>());
    const out = o.output ?? ctx.config.baseline.path ?? "ia-linter-baseline.json";
    if (ctx.config.baseline.require_reason && !o.reason) die("la configuración exige --reason para crear la baseline");
    const result = scanProject(ctx, { targets: rutas, baseline: null, noCache: true });
    const b = createBaseline(result.files, o.reason);
    writeBaseline(path.resolve(ctx.root, out), b);
    process.stdout.write(`Baseline creada: ${out} (${b.entries.length} entradas)\n`);
  });
baseline
  .command("update")
  .argument("[rutas...]")
  .option("-o, --output <archivo>", "ruta de la baseline")
  .option("--add-new", "añade también los hallazgos nuevos")
  .option("--reason <texto>", "motivo para las entradas nuevas")
  .action((rutas: string[], o) => {
    const ctx = context(program.opts<GlobalOpts>());
    const out = o.output ?? ctx.config.baseline.path ?? "ia-linter-baseline.json";
    const abs = path.resolve(ctx.root, out);
    if (!fs.existsSync(abs)) die(`no existe la baseline ${out}; usa \`baseline create\``);
    if (o.addNew && ctx.config.baseline.require_reason && !o.reason) die("la configuración exige --reason para añadir entradas");
    const existing = readBaseline(abs);
    const result = scanProject(ctx, { targets: rutas, baseline: null, noCache: true });
    const b = updateBaseline(existing, result.files, { addNew: Boolean(o.addNew), reason: o.reason });
    writeBaseline(abs, b);
    process.stdout.write(`Baseline actualizada: ${out} (${existing.entries.length} → ${b.entries.length} entradas)\n`);
  });

program
  .command("benchmark")
  .description("ejecuta el benchmark reproducible sobre un corpus con manifiestos")
  .command("run")
  .requiredOption("--corpus <dir>", "directorio raíz del corpus")
  .requiredOption("--partition <nombre>", "development | holdout | challenge")
  .option("--profile <perfil>", "perfil con el que evaluar el corpus (queda registrado en el informe)")
  .option("-o, --output <archivo>", "informe JSON")
  .action(async (o) => {
    if (o.profile && !["general", "tecnico", "academico", "marketing", "chat", "correo", "readme", "redes"].includes(o.profile)) die("--profile inválido");
    const base = context(program.opts<GlobalOpts>());
    const ctx = o.profile ? { ...base, config: { ...base.config, profile: o.profile as typeof base.config.profile } } : base;
    const { runBenchmark } = await import("./benchmark.js");
    const report = runBenchmark(ctx, path.resolve(o.corpus), o.partition);
    const json = JSON.stringify(report, null, 2) + "\n";
    if (o.output) {
      fs.mkdirSync(path.dirname(path.resolve(o.output)), { recursive: true });
      fs.writeFileSync(path.resolve(o.output), json, "utf8");
      process.stdout.write(`Informe: ${o.output}\n`);
    } else process.stdout.write(json);
  });

function pathToFileUri(p: string): string {
  const s = p.replace(/\\/g, "/");
  return (s.startsWith("/") ? `file://${encodeURI(s)}` : `file:///${encodeURI(s)}`) + "/";
}

program.parseAsync(process.argv).catch((e) => die((e as Error).message));
