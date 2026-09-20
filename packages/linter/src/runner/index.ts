import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import fg from "fast-glob";
import ignore from "ignore";
import type {
  CompiledRule,
  Config,
  FileResult,
  Finding,
  Level,
  PolicyResult,
  RulePack,
  ScanResult,
} from "../contracts/index.js";
import { SCHEMA_VERSION } from "../contracts/index.js";
import { buildDocument, detectFormat } from "../document/index.js";
import { runRules } from "../rules/runtime/index.js";
import { computeScore } from "../scoring/index.js";
import { applySuppressions, parseSuppressions } from "../suppressions/index.js";
import { applyBaseline, readBaseline } from "../baseline/index.js";
import { resolveEffectiveRules } from "../config/index.js";
import { lintDocumentText, type RunnerContext } from "./lint-text.js";
import { matchesAny } from "../config/glob.js";

export type { RunnerContext } from "./lint-text.js";
export { lintDocumentText } from "./lint-text.js";

const LEVEL_ORDER: Record<Level, number> = { off: 0, info: 1, warning: 2, error: 3 };

/* ---------------- Descubrimiento de archivos ---------------- */

export function discoverFiles(ctx: RunnerContext, targets: string[]): string[] {
  const root = ctx.root;
  const ig = ignore();
  if (ctx.config.respect_gitignore) {
    const gi = path.join(root, ".gitignore");
    if (fs.existsSync(gi)) ig.add(fs.readFileSync(gi, "utf8"));
  }
  const files = new Set<string>();
  const explicit: string[] = [];
  const patterns: string[] = [];
  for (const t of targets.length ? targets : ["."]) {
    const abs = path.resolve(root, t);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) explicit.push(abs);
    else if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      const rel = path.relative(root, abs).replace(/\\/g, "/");
      // El nombre del directorio va escapado: «docs (v1)» o «notas [2021]» son rutas, no patrones.
      for (const inc of ctx.config.include) patterns.push(rel ? `${fg.convertPathToPattern(rel)}/${inc}` : inc);
    } else patterns.push(t.replace(/\\/g, "/"));
  }
  for (const f of explicit) files.add(f);
  if (patterns.length) {
    const found = fg.sync(patterns, { cwd: root, dot: false, onlyFiles: true, ignore: ctx.config.exclude, followSymbolicLinks: false });
    for (const f of found) files.add(path.resolve(root, f));
  }
  const out: string[] = [];
  for (const abs of files) {
    const rel = path.relative(root, abs).replace(/\\/g, "/");
    if (rel.startsWith("..")) {
      out.push(abs);
      continue;
    }
    // `exclude` vale también para los archivos nombrados uno a uno (así los pasa pre-commit), igual que .gitignore.
    if (matchesAny(rel, ctx.config.exclude)) continue;
    if (ctx.config.respect_gitignore && ig.ignores(rel)) continue;
    out.push(abs);
  }
  return out.sort((a, b) => a.localeCompare(b, "en"));
}

/* ---------------- Caché ---------------- */

interface CacheEntry {
  key: string;
  result: FileResult;
}

function cacheKey(ctx: RunnerContext, relPath: string, content: string): string {
  const h = createHash("sha256");
  h.update(ctx.toolVersion).update("\0").update(ctx.pack.version).update("\0");
  h.update(JSON.stringify(ctx.config)).update("\0").update(relPath).update("\0").update(content);
  // El pack completo también forma parte de la clave (cambios en reglas invalidan).
  h.update(packHash(ctx.pack));
  return h.digest("hex");
}

const packHashes = new WeakMap<RulePack, string>();
function packHash(pack: RulePack): string {
  let h = packHashes.get(pack);
  if (!h) {
    h = createHash("sha256").update(JSON.stringify(pack.rules)).digest("hex");
    packHashes.set(pack, h);
  }
  return h;
}

function cachePath(ctx: RunnerContext, key: string): string {
  return path.join(ctx.root, ctx.config.cache.dir, key.slice(0, 2), `${key}.json`);
}

/* ---------------- Escaneo ---------------- */

export interface ScanOptions {
  targets?: string[];
  /** Ignorar la caché aunque esté activada. */
  noCache?: boolean;
  /** Ruta de baseline (anula la configuración). */
  baseline?: string | null;
}

export function scanProject(ctx: RunnerContext, opts: ScanOptions = {}): ScanResult {
  const t0 = performance.now();
  const files = discoverFiles(ctx, opts.targets ?? []);
  const results: FileResult[] = [];
  const useCache = ctx.config.cache.enabled && !opts.noCache;
  for (const abs of files) {
    const rel = path.relative(ctx.root, abs).replace(/\\/g, "/");
    const content = fs.readFileSync(abs, "utf8");
    let result: FileResult | null = null;
    let key = "";
    if (useCache) {
      key = cacheKey(ctx, rel, content);
      const cp = cachePath(ctx, key);
      if (fs.existsSync(cp)) {
        try {
          const e = JSON.parse(fs.readFileSync(cp, "utf8")) as CacheEntry;
          if (e.key === key) {
            result = { ...e.result, fromCache: true };
            // Las supresiones por baseline se recalculan más abajo; limpiamos las antiguas.
            for (const f of result.findings) if (f.suppressed?.by === "baseline") delete f.suppressed;
          }
        } catch {
          result = null;
        }
      }
    }
    if (!result) {
      result = lintDocumentText(content, ctx, { relPath: rel });
      if (useCache) {
        const cp = cachePath(ctx, key);
        fs.mkdirSync(path.dirname(cp), { recursive: true });
        fs.writeFileSync(cp, JSON.stringify({ key, result } satisfies CacheEntry), "utf8");
      }
    }
    results.push(result);
  }
  results.sort((a, b) => a.path.localeCompare(b.path, "en"));
  let baselineInfo: ScanResult["baseline"];
  const baselinePath = opts.baseline === undefined ? ctx.config.baseline.path : opts.baseline;
  if (baselinePath) {
    const abs = path.resolve(ctx.root, baselinePath);
    if (fs.existsSync(abs)) {
      const b = readBaseline(abs);
      const r = applyBaseline(results, b);
      baselineInfo = { path: baselinePath, matched: r.matched, stale: r.stale.length };
    }
  }
  // Recalcular el índice tras la baseline.
  const ruleMap = new Map(ctx.pack.rules.map((r) => [r.id, r] as [string, CompiledRule]));
  for (const r of results) {
    r.score = computeScore(r.findings, ruleMap, r.score.eligibleWords, ctx.config.min_words_for_index);
  }
  const policy = evaluatePolicy(results, ctx.config);
  return {
    schema_version: SCHEMA_VERSION,
    tool: { name: "textoneitor", version: ctx.toolVersion, rulepack: ctx.pack.version },
    files: results,
    policy,
    baseline: baselineInfo,
    durationMs: Math.round(performance.now() - t0),
  };
}

/** La política decide si el proyecto falla. El motor solo detecta. */
export function evaluatePolicy(files: FileResult[], config: Config): PolicyResult {
  const counts = { error: 0, warning: 0, info: 0, suppressed: 0 };
  const reasons: string[] = [];
  for (const f of files) {
    for (const x of f.findings) {
      if (x.suppressed) counts.suppressed++;
      else counts[x.level]++;
    }
    if (config.max_index !== null && f.score.index !== null && f.score.index > config.max_index) {
      reasons.push(`${f.path}: índice ${f.score.index} > máximo ${config.max_index}`);
    }
  }
  if (config.fail_on !== "never") {
    const threshold = LEVEL_ORDER[config.fail_on];
    const n = (["error", "warning", "info"] as const).filter((l) => LEVEL_ORDER[l] >= threshold).reduce((a, l) => a + counts[l], 0);
    if (n > 0) reasons.push(`${n} hallazgo(s) de nivel ${config.fail_on} o superior`);
  }
  return { ok: reasons.length === 0, failOn: config.fail_on, maxIndex: config.max_index, reasons, counts };
}

export function activeFindings(files: FileResult[]): Finding[] {
  return files.flatMap((f) => f.findings.filter((x) => !x.suppressed));
}
