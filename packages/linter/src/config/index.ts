import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ConfigIssue, LoadedConfig } from "./core.js";
import { CONFIG_FILENAMES, defaultConfig, mergeConfig, validateConfigObject } from "./core.js";

export * from "./core.js";

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
