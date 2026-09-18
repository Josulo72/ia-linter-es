import type { CompiledRule, Finding, ScoreResult } from "../contracts/index.js";

/**
 * Índice de patrones editoriales (0-100). Única fórmula del producto.
 *
 * Para cada regla con hallazgos no suprimidos:
 *   contribución = weight * min(cap, 1 + ln(n))   (rendimientos decrecientes por repetición)
 * Suma de contribuciones, normalizada por palabras elegibles (por cada 1000) y comprimida
 * con una curva saturante para acotar en 0-100:
 *   raw = 1000 * sum / eligibleWords
 *   index = round(100 * raw / (raw + K))
 * K se fija en 40: un texto con ~40 puntos de contribución por mil palabras marca 50.
 *
 * Mide densidad de señales editoriales. No es una probabilidad de autoría.
 */
export const SCORE_K = 40;

export function computeScore(
  findings: Finding[],
  rules: Map<string, CompiledRule>,
  eligibleWords: number,
  minWords: number,
): ScoreResult {
  const perRule = new Map<string, number>();
  for (const f of findings) {
    if (f.suppressed) continue;
    perRule.set(f.rule, (perRule.get(f.rule) ?? 0) + 1);
  }
  const contributors = [...perRule.entries()]
    .map(([rule, n]) => {
      const r = rules.get(rule);
      const weight = r?.score.weight ?? 1;
      const cap = r?.score.cap ?? 3;
      const contribution = weight * Math.min(cap, 1 + Math.log(n));
      return { rule, findings: n, contribution: round2(contribution) };
    })
    .sort((a, b) => b.contribution - a.contribution || a.rule.localeCompare(b.rule, "en"));
  if (eligibleWords < minWords) {
    return { index: null, eligibleWords, minWords, contributors };
  }
  const sum = contributors.reduce((a, c) => a + c.contribution, 0);
  const raw = eligibleWords > 0 ? (1000 * sum) / eligibleWords : 0;
  const index = Math.round((100 * raw) / (raw + SCORE_K));
  return { index, eligibleWords, minWords, contributors };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
