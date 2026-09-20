/**
 * Análisis de un texto en memoria. Puro: no lee archivos ni escribe nada.
 *
 * Vive fuera de `runner/index.ts` porque ese módulo trae `node:fs` y `fast-glob` para
 * descubrir archivos, y esto tiene que poder ejecutarse también en el navegador
 * (`src/web/index.ts`). Es la misma función para los dos caminos: lo que analiza la CLI
 * y lo que analiza la web salen de aquí.
 */
import type { CompiledRule, Config, FileResult, Level, RulePack } from "../contracts/index.js";
import { buildDocument, detectFormat } from "../document/index.js";
import { runRules } from "../rules/runtime/index.js";
import { computeScore } from "../scoring/index.js";
import { applySuppressions, parseSuppressions } from "../suppressions/index.js";
import { resolveEffectiveRules } from "../config/core.js";

export interface RunnerContext {
  config: Config;
  root: string;
  pack: RulePack;
  toolVersion: string;
}

export function lintDocumentText(
  text: string,
  ctx: RunnerContext,
  opts: { relPath?: string; format?: "text" | "markdown" } = {},
): FileResult {
  const t0 = performance.now();
  const relPath = (opts.relPath ?? "<texto>").replace(/\\/g, "/");
  const format = opts.format ?? detectFormat(relPath === "<texto>" ? null : relPath);
  const doc = buildDocument(text, { path: relPath, format });
  const effective = resolveEffectiveRules(ctx.config, ctx.pack.rules, relPath === "<texto>" ? null : relPath);
  const levels: Record<string, Level> = {};
  for (const e of effective) levels[e.rule] = e.level;
  const findings = runRules(doc, ctx.pack.rules, { levels, relPath, snippets: ctx.config.privacy.snippets });
  applySuppressions(findings, parseSuppressions(doc.original, doc.lineStarts, doc.codeRanges));
  const ruleMap = new Map(ctx.pack.rules.map((r) => [r.id, r] as [string, CompiledRule]));
  const score = computeScore(findings, ruleMap, doc.eligibleWords, ctx.config.min_words_for_index);
  return { path: relPath, format, findings, score, durationMs: Math.round((performance.now() - t0) * 100) / 100 };
}
