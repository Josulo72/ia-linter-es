import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Config, Level, PathOverride, ProfileName, Register, CompiledRule } from "../contracts/index.js";
import { SCHEMA_VERSION } from "../contracts/index.js";
import { matchesAny } from "./glob.js";

export const CONFIG_FILENAMES = ["ia-linter.yml", "ia-linter.yaml", ".ia-linter.yml", ".ia-linter.yaml"];
const LEVELS: Level[] = ["off", "info", "warning", "error"];
const PROFILES: ProfileName[] = ["general", "tecnico", "academico", "marketing", "chat", "correo", "readme", "redes"];
const REGISTERS: Register[] = ["general", "tecnico", "academico", "marketing", "literario", "periodistico", "institucional"];

/** Valores internos (nivel 1 de precedencia). */
export function defaultConfig(): Config {
  return {
    schema_version: SCHEMA_VERSION,
    profile: "general",
    register: "general",
    include: ["**/*.md", "**/*.markdown", "**/*.txt"],
    exclude: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/CHANGELOG.md", "**/LICENSE*"],
    respect_gitignore: true,
    rules: {},
    overrides: [],
    baseline: { path: null, require_reason: false },
    fail_on: "warning",
    max_index: null,
    privacy: { snippets: true },
    reporter: "terminal",
    cache: { enabled: true, dir: ".ia-linter-cache" },
    min_words_for_index: 150,
  };
}

export interface ConfigIssue {
  path: string;
  message: string;
}

export interface LoadedConfig {
  config: Config;
  /** Ruta del archivo de configuración o null si se usan solo valores internos. */
  file: string | null;
  /** Directorio raíz del proyecto (donde está la configuración o el cwd). */
  root: string;
  issues: ConfigIssue[];
}

/** Busca el archivo de configuración hacia arriba desde `start`. */
export function findConfigFile(start: string): string | null {
  let dir = path.resolve(start);
  for (;;) {
    for (const name of CONFIG_FILENAMES) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Valida un objeto crudo y devuelve los problemas. No lanza. */
export function validateConfigObject(raw: unknown): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (raw === null || raw === undefined) return issues;
  if (typeof raw !== "object" || Array.isArray(raw)) return [{ path: "", message: "la configuración debe ser un objeto" }];
  const o = raw as Record<string, unknown>;
  const known = new Set([
    "schema_version", "profile", "register", "include", "exclude", "respect_gitignore", "rules", "overrides",
    "baseline", "fail_on", "max_index", "privacy", "reporter", "cache", "min_words_for_index",
  ]);
  for (const k of Object.keys(o)) if (!known.has(k)) issues.push({ path: k, message: "clave desconocida" });
  if (o.schema_version !== undefined && o.schema_version !== SCHEMA_VERSION)
    issues.push({ path: "schema_version", message: `debe ser ${SCHEMA_VERSION}` });
  if (o.profile !== undefined && !PROFILES.includes(o.profile as ProfileName))
    issues.push({ path: "profile", message: `debe ser uno de: ${PROFILES.join(", ")}` });
  if (o.register !== undefined && !REGISTERS.includes(o.register as Register))
    issues.push({ path: "register", message: `debe ser uno de: ${REGISTERS.join(", ")}` });
  for (const k of ["include", "exclude"]) {
    if (o[k] !== undefined && (!Array.isArray(o[k]) || !(o[k] as unknown[]).every((x) => typeof x === "string")))
      issues.push({ path: k, message: "debe ser una lista de patrones glob" });
  }
  if (o.respect_gitignore !== undefined && typeof o.respect_gitignore !== "boolean")
    issues.push({ path: "respect_gitignore", message: "debe ser booleano" });
  if (o.rules !== undefined) issues.push(...validateRulesMap(o.rules, "rules"));
  if (o.overrides !== undefined) {
    if (!Array.isArray(o.overrides)) issues.push({ path: "overrides", message: "debe ser una lista" });
    else
      o.overrides.forEach((ov, i) => {
        const p = `overrides[${i}]`;
        if (typeof ov !== "object" || ov === null) return issues.push({ path: p, message: "debe ser un objeto" });
        const r = ov as Record<string, unknown>;
        if (!Array.isArray(r.files) || !r.files.every((x) => typeof x === "string"))
          issues.push({ path: `${p}.files`, message: "debe ser una lista de patrones glob" });
        if (r.rules !== undefined) issues.push(...validateRulesMap(r.rules, `${p}.rules`));
        if (r.profile !== undefined && !PROFILES.includes(r.profile as ProfileName))
          issues.push({ path: `${p}.profile`, message: `debe ser uno de: ${PROFILES.join(", ")}` });
      });
  }
  if (o.baseline !== undefined) {
    if (typeof o.baseline !== "object" || o.baseline === null) issues.push({ path: "baseline", message: "debe ser un objeto" });
    else {
      const b = o.baseline as Record<string, unknown>;
      if (b.path !== undefined && b.path !== null && typeof b.path !== "string")
        issues.push({ path: "baseline.path", message: "debe ser una ruta o null" });
      if (b.require_reason !== undefined && typeof b.require_reason !== "boolean")
        issues.push({ path: "baseline.require_reason", message: "debe ser booleano" });
    }
  }
  if (o.fail_on !== undefined && o.fail_on !== "never" && !LEVELS.includes(o.fail_on as Level))
    issues.push({ path: "fail_on", message: "debe ser never, info, warning o error" });
  if (o.max_index !== undefined && o.max_index !== null && (typeof o.max_index !== "number" || o.max_index < 0 || o.max_index > 100))
    issues.push({ path: "max_index", message: "debe ser un número entre 0 y 100 o null" });
  if (o.privacy !== undefined) {
    const p = o.privacy as Record<string, unknown>;
    if (typeof p !== "object" || p === null || (p.snippets !== undefined && typeof p.snippets !== "boolean"))
      issues.push({ path: "privacy.snippets", message: "debe ser booleano" });
  }
  if (o.reporter !== undefined && !["terminal", "json", "sarif", "revision"].includes(o.reporter as string))
    issues.push({ path: "reporter", message: "debe ser terminal, json, sarif o revision" });
  if (o.cache !== undefined) {
    const c = o.cache as Record<string, unknown>;
    if (typeof c !== "object" || c === null) issues.push({ path: "cache", message: "debe ser un objeto" });
    else {
      if (c.enabled !== undefined && typeof c.enabled !== "boolean") issues.push({ path: "cache.enabled", message: "debe ser booleano" });
      if (c.dir !== undefined && typeof c.dir !== "string") issues.push({ path: "cache.dir", message: "debe ser una ruta" });
    }
  }
  if (o.min_words_for_index !== undefined && (typeof o.min_words_for_index !== "number" || o.min_words_for_index < 0))
    issues.push({ path: "min_words_for_index", message: "debe ser un número >= 0" });
  return issues;
}

function validateRulesMap(v: unknown, p: string): ConfigIssue[] {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return [{ path: p, message: "debe ser un mapa id -> nivel" }];
  const out: ConfigIssue[] = [];
  for (const [k, lv] of Object.entries(v as Record<string, unknown>)) {
    if (!LEVELS.includes(lv as Level)) out.push({ path: `${p}.${k}`, message: "nivel inválido (off, info, warning, error)" });
  }
  return out;
}

/** Fusiona un objeto crudo validado sobre la configuración base. */
export function mergeConfig(base: Config, raw: Record<string, unknown>): Config {
  const c: Config = { ...base, rules: { ...base.rules }, overrides: [...base.overrides] };
  if (raw.profile !== undefined) c.profile = raw.profile as ProfileName;
  if (raw.register !== undefined) c.register = raw.register as Register;
  if (raw.include !== undefined) c.include = raw.include as string[];
  if (raw.exclude !== undefined) c.exclude = raw.exclude as string[];
  if (raw.respect_gitignore !== undefined) c.respect_gitignore = raw.respect_gitignore as boolean;
  if (raw.rules !== undefined) Object.assign(c.rules, raw.rules as Record<string, Level>);
  if (raw.overrides !== undefined) c.overrides = raw.overrides as PathOverride[];
  if (raw.baseline !== undefined) c.baseline = { ...c.baseline, ...(raw.baseline as object) };
  if (raw.fail_on !== undefined) c.fail_on = raw.fail_on as Level | "never";
  if (raw.max_index !== undefined) c.max_index = raw.max_index as number | null;
  if (raw.privacy !== undefined) c.privacy = { ...c.privacy, ...(raw.privacy as object) };
  if (raw.reporter !== undefined) c.reporter = raw.reporter as Config["reporter"];
  if (raw.cache !== undefined) c.cache = { ...c.cache, ...(raw.cache as object) };
  if (raw.min_words_for_index !== undefined) c.min_words_for_index = raw.min_words_for_index as number;
  return c;
}

export function loadConfig(opts: { cwd?: string; file?: string | null } = {}): LoadedConfig {
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  const file = opts.file === undefined ? findConfigFile(cwd) : opts.file;
  const base = defaultConfig();
  if (!file) return { config: base, file: null, root: cwd, issues: [] };
  const abs = path.resolve(cwd, file);
  let raw: unknown;
  try {
    raw = parseYaml(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    return { config: base, file: abs, root: path.dirname(abs), issues: [{ path: "", message: `YAML inválido: ${(e as Error).message}` }] };
  }
  const issues = validateConfigObject(raw);
  const config = issues.length === 0 && raw && typeof raw === "object" ? mergeConfig(base, raw as Record<string, unknown>) : base;
  return { config, file: abs, root: path.dirname(abs), issues };
}

/* ---------------- Resolución de niveles efectivos ---------------- */

export type LevelSource =
  | "internal"
  | "profile"
  | "register"
  | "project"
  | "override"
  | "rule"
  | "inline";

export interface EffectiveRule {
  rule: string;
  level: Level;
  source: LevelSource;
  detail: string;
}

/**
 * Registros que silencian categorías o reglas por defecto (nivel 3 de precedencia).
 * Se mantiene deliberadamente pequeño: solo lo que la evidencia del benchmark justifica.
 */
export const REGISTER_ADJUSTMENTS: Partial<Record<Register, Record<string, Level>>> = {
  literario: { "repeticion/anafora": "off", "retorica/pregunta-retorica-apertura": "off", "retorica/triada": "off", "densidad/exclamaciones": "off" },
  periodistico: { "estructura/encabezado-dos-puntos": "off" },
  institucional: { "densidad/conectores": "info", "estructura/enumeracion-ordinal": "off" },
  tecnico: {},
  academico: {},
  marketing: {},
  general: {},
};

/**
 * Resuelve el nivel efectivo de cada regla para un archivo concreto.
 * Precedencia: internos < perfil < registro < proyecto < override por ruta < regla concreta.
 * La supresión inline (nivel 7) se aplica en el runner sobre los hallazgos.
 */
export function resolveEffectiveRules(
  config: Config,
  rules: CompiledRule[],
  relPath: string | null,
): EffectiveRule[] {
  const out: EffectiveRule[] = [];
  const matchingOverrides = relPath ? config.overrides.filter((o) => matchesAny(relPath, o.files)) : [];
  // Perfil efectivo: un override puede cambiarlo.
  let profile = config.profile;
  for (const ov of matchingOverrides) if (ov.profile) profile = ov.profile;
  const registerAdj = REGISTER_ADJUSTMENTS[config.register] ?? {};
  for (const r of rules) {
    let level: Level = r.status === "deprecated" ? "off" : r.default_level;
    let source: LevelSource = "internal";
    let detail = `nivel por defecto de la regla (${r.status})`;
    const p = r.profiles[profile];
    if (p !== undefined) {
      level = p;
      source = "profile";
      detail = `perfil ${profile}`;
    }
    const ra = registerAdj[r.id];
    if (ra !== undefined) {
      level = ra;
      source = "register";
      detail = `registro ${config.register}`;
    }
    // Proyecto: `rules` admite id exacto o categoría "categoria/*".
    const cat = `${r.category}/*`;
    if (config.rules[cat] !== undefined) {
      level = config.rules[cat] as Level;
      source = "project";
      detail = `rules["${cat}"]`;
    }
    if (config.rules[r.id] !== undefined) {
      level = config.rules[r.id] as Level;
      source = "project";
      detail = `rules["${r.id}"]`;
    }
    // Override por ruta (categoría) y, con mayor precedencia, la regla concreta dentro del override.
    for (const ov of matchingOverrides) {
      const lvCat = ov.rules?.[cat];
      if (lvCat !== undefined) {
        level = lvCat;
        source = "override";
        detail = `override files=[${ov.files.join(", ")}] rules["${cat}"]`;
      }
    }
    for (const ov of matchingOverrides) {
      const lvId = ov.rules?.[r.id];
      if (lvId !== undefined) {
        level = lvId;
        source = "rule";
        detail = `override files=[${ov.files.join(", ")}] rules["${r.id}"]`;
      }
    }
    out.push({ rule: r.id, level, source, detail });
  }
  return out;
}

export function explainConfig(loaded: LoadedConfig, rules: CompiledRule[], relPath: string | null): {
  file: string | null;
  root: string;
  config: Config;
  effective: EffectiveRule[];
} {
  return { file: loaded.file, root: loaded.root, config: loaded.config, effective: resolveEffectiveRules(loaded.config, rules, relPath) };
}
