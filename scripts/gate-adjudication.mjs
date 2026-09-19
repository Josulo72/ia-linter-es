/** Evalua la precision adjudicada agregada de las reglas stable. */
export function evaluateAdjudicatedPrecision({
  stableRuleIds,
  reports,
  minPrecision,
  minFindings,
  exemptRuleIds = [],
}) {
  if (!Number.isFinite(minPrecision) || minPrecision < 0 || minPrecision > 1) {
    throw new Error("minPrecision debe estar entre 0 y 1");
  }
  if (!Number.isInteger(minFindings) || minFindings < 1) {
    throw new Error("minFindings debe ser un entero positivo");
  }

  const exempt = new Set(exemptRuleIds);
  const totals = new Map([...stableRuleIds].map((id) => [id, { correct: 0, incorrect: 0 }]));
  for (const report of reports) {
    for (const [id, value] of Object.entries(report.per_rule ?? {})) {
      if (!totals.has(id)) continue;
      const adjudicated = value.adjudicated ?? {};
      const correct = Number(adjudicated.correct ?? 0);
      const incorrect = Number(adjudicated.incorrect ?? 0);
      if (!Number.isInteger(correct) || correct < 0 || !Number.isInteger(incorrect) || incorrect < 0) {
        throw new Error(`${id}: adjudicacion invalida`);
      }
      const total = totals.get(id);
      total.correct += correct;
      total.incorrect += incorrect;
    }
  }

  const result = { measured: [], below: [], insufficient: [], exempt: [] };
  for (const id of [...stableRuleIds].sort()) {
    if (exempt.has(id)) {
      result.exempt.push(id);
      continue;
    }
    const counts = totals.get(id) ?? { correct: 0, incorrect: 0 };
    const findings = counts.correct + counts.incorrect;
    if (findings < minFindings) {
      result.insufficient.push({ id, findings });
      continue;
    }
    const precision = counts.correct / findings;
    const row = { id, findings, precision };
    result.measured.push(row);
    if (precision < minPrecision) result.below.push(row);
  }
  return result;
}
