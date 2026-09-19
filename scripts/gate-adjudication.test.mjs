import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAdjudicatedPrecision } from "./gate-adjudication.mjs";

const report = (per_rule) => ({ per_rule });
const adjudicated = (correct, incorrect) => ({ adjudicated: { correct, incorrect } });

test("agrega informes y falla una regla con muestra suficiente por debajo del umbral", () => {
  const result = evaluateAdjudicatedPrecision({
    stableRuleIds: ["regla/a"],
    reports: [report({ "regla/a": adjudicated(1, 2) }), report({ "regla/a": adjudicated(1, 1) })],
    minPrecision: 0.7,
    minFindings: 5,
  });
  assert.deepEqual(result.below, [{ id: "regla/a", findings: 5, precision: 0.4 }]);
});

test("una muestra menor que el minimo queda pendiente y no cuenta como precision cero", () => {
  const result = evaluateAdjudicatedPrecision({
    stableRuleIds: ["regla/a", "regla/sin-casos"],
    reports: [report({ "regla/a": adjudicated(0, 4) })],
    minPrecision: 0.7,
    minFindings: 5,
  });
  assert.deepEqual(result.below, []);
  assert.deepEqual(result.insufficient, [
    { id: "regla/a", findings: 4 },
    { id: "regla/sin-casos", findings: 0 },
  ]);
});

test("excluye reglas no adjudicables y acepta las que cumplen", () => {
  const result = evaluateAdjudicatedPrecision({
    stableRuleIds: ["estructura/global", "regla/bien"],
    reports: [report({ "estructura/global": adjudicated(0, 8), "regla/bien": adjudicated(7, 3) })],
    minPrecision: 0.7,
    minFindings: 5,
    exemptRuleIds: ["estructura/global"],
  });
  assert.deepEqual(result.exempt, ["estructura/global"]);
  assert.deepEqual(result.measured, [{ id: "regla/bien", findings: 10, precision: 0.7 }]);
  assert.deepEqual(result.below, []);
});

test("rechaza contadores corruptos", () => {
  assert.throws(() => evaluateAdjudicatedPrecision({
    stableRuleIds: ["regla/a"],
    reports: [report({ "regla/a": adjudicated(-1, 6) })],
    minPrecision: 0.7,
    minFindings: 5,
  }), /adjudicacion invalida/);
});
