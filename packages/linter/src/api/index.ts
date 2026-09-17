/**
 * API programática. Mismo motor, misma configuración y misma puntuación que la CLI.
 */
import fs from "node:fs";
import path from "node:path";
import type { CompiledRule, Config, FileResult, RulePack, ScanResult } from "../contracts/index.js";
import { SCHEMA_VERSION } from "../contracts/index.js";
import { defaultConfig, explainConfig, loadConfig, mergeConfig, validateConfigObject, type LoadedConfig } from "../config/index.js";
import { lintDocumentText, scanProject, type RunnerContext, type ScanOptions } from "../runner/index.js";
import { packageRoot, rulepackPath } from "../paths.js";

export type * from "../contracts/index.js";
export { SCHEMA_VERSION } from "../contracts/index.js";
export { defaultConfig, loadConfig, validateConfigObject, explainConfig, resolveEffectiveRules } from "../config/index.js";
export { reportJson, reportSarif, reportTerminal, render } from "../reporters/index.js";
export { createBaseline, readBaseline, writeBaseline, updateBaseline, applyBaseline } from "../baseline/index.js";
export { buildDocument } from "../document/index.js";
export { runRules } from "../rules/runtime/index.js";
export { computeScore } from "../scoring/index.js";
export { evaluatePolicy, discoverFiles } from "../runner/index.js";

let cachedPack: RulePack | null = null;

export function toolVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot(), "package.json"), "utf8")) as { version: string };
  return pkg.version;
}

/** Carga el Rule Pack oficial compilado (o uno alternativo). */
export function loadRulePack(file?: string): RulePack {
  if (!file && cachedPack) return cachedPack;
  const p = file ?? rulepackPath();
  if (!fs.existsSync(p)) {
    throw new Error(`No se encuentra el Rule Pack en ${p}. Ejecuta el build del paquete.`);
  }
  const pack = JSON.parse(fs.readFileSync(p, "utf8")) as RulePack;
  if (pack.schema_version !== SCHEMA_VERSION) throw new Error(`Rule Pack con schema_version ${pack.schema_version}; se esperaba ${SCHEMA_VERSION}`);
  if (!file) cachedPack = pack;
  return pack;
}

export interface ContextOptions {
  /** Configuración ya cargada, objeto parcial, o ruta a archivo. Si se omite se busca desde `cwd`. */
  config?: LoadedConfig | Partial<Config> | string;
  cwd?: string;
  rulepack?: string;
}

export function createContext(opts: ContextOptions = {}): RunnerContext {
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  let loaded: LoadedConfig;
  if (opts.config && typeof opts.config === "object" && "config" in opts.config && "root" in opts.config) {
    loaded = opts.config as LoadedConfig;
  } else if (typeof opts.config === "string") {
    loaded = loadConfig({ cwd, file: opts.config });
  } else if (opts.config && typeof opts.config === "object") {
    const issues = validateConfigObject(opts.config);
    if (issues.length) throw new Error(`Configuración inválida: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
    loaded = { config: mergeConfig(defaultConfig(), opts.config as Record<string, unknown>), file: null, root: cwd, issues: [] };
  } else {
    loaded = loadConfig({ cwd });
  }
  if (loaded.issues.length) throw new Error(`Configuración inválida en ${loaded.file}: ${loaded.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
  return { config: loaded.config, root: loaded.root, pack: loadRulePack(opts.rulepack), toolVersion: toolVersion() };
}

/** Analiza un texto en memoria. */
export function lintText(text: string, opts: ContextOptions & { format?: "text" | "markdown"; path?: string } = {}): FileResult {
  const ctx = createContext(opts);
  return lintDocumentText(text, ctx, { relPath: opts.path, format: opts.format ?? (opts.path ? undefined : "text") });
}

/** Analiza un archivo del disco (respeta overrides por ruta). */
export function lintFile(file: string, opts: ContextOptions = {}): FileResult {
  const ctx = createContext(opts);
  const abs = path.resolve(ctx.root, file);
  const rel = path.relative(ctx.root, abs).replace(/\\/g, "/");
  return lintDocumentText(fs.readFileSync(abs, "utf8"), ctx, { relPath: rel });
}

/** Analiza un proyecto completo (descubrimiento, gitignore, caché, baseline y política). */
export function lintProject(opts: ContextOptions & ScanOptions = {}): ScanResult {
  const ctx = createContext(opts);
  return scanProject(ctx, { targets: opts.targets, noCache: opts.noCache, baseline: opts.baseline });
}

/** Devuelve la regla compilada y su documentación. */
export function explainRule(id: string, rulepack?: string): CompiledRule | null {
  return loadRulePack(rulepack).rules.find((r) => r.id === id) ?? null;
}

export function listRules(rulepack?: string): CompiledRule[] {
  return loadRulePack(rulepack).rules;
}
