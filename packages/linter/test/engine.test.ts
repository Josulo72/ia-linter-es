import { describe, expect, it } from "vitest";
import { computeScore } from "../src/scoring/index.js";
import { applySuppressions, parseSuppressions } from "../src/suppressions/index.js";
import { applyBaseline, createBaseline, updateBaseline } from "../src/baseline/index.js";
import { adversarialText, checkPattern, hasNestedQuantifier } from "../src/rules/compiler/safety.js";
import { buildDocument, computeLineStarts } from "../src/document/index.js";
import { runRules } from "../src/rules/runtime/index.js";
import type { CompiledRule, FileResult, Finding } from "../src/contracts/index.js";

const rule = (id: string, weight = 1, cap = 3): CompiledRule => ({
  id, revision: 1, status: "stable", title: id, summary: "", category: "lexico", scope: "sentence", detector: "lexicon",
  params: { terms: ["hoy en día"] }, exceptions: {}, default_level: "warning", score: { weight, cap }, message: "m",
  explanation: "", rewrite_guidance: "", profiles: {},
});
const finding = (ruleId: string, offset = 0, line = 1): Finding => ({
  rule: ruleId, revision: 1, level: "warning", category: "lexico", message: "m",
  range: { start: { offset, line, column: 1 }, end: { offset: offset + 5, line, column: 6 } }, snippet: "x", fingerprint: `fp-${ruleId}-${offset}`,
});

describe("scoring", () => {
  it("omite el índice con pocas palabras pero lista contribuyentes", () => {
    const s = computeScore([finding("a")], new Map([["a", rule("a")]]), 50, 150);
    expect(s.index).toBeNull();
    expect(s.contributors[0]).toEqual({ rule: "a", findings: 1, contribution: 1 });
  });
  it("aplica peso, cap y rendimientos decrecientes; normaliza por palabras", () => {
    const rules = new Map([["a", rule("a", 2, 2)], ["b", rule("b", 1, 5)]]);
    const fs = [finding("a"), finding("a", 1), finding("a", 2), finding("a", 3), finding("b")];
    const s = computeScore(fs, rules, 1000, 150);
    // a: 2 * min(2, 1+ln4=2.39) = 4 ; b: 1
    expect(s.contributors.map((c) => [c.rule, c.contribution])).toEqual([["a", 4], ["b", 1]]);
    // raw = 5 -> 100*5/45 = 11
    expect(s.index).toBe(11);
    const s2 = computeScore(fs, rules, 200, 150);
    expect(s2.index).toBeGreaterThan(s.index!);
    expect(s2.index).toBeLessThanOrEqual(100);
  });
  it("ignora hallazgos suprimidos", () => {
    const f = finding("a");
    f.suppressed = { by: "inline" };
    expect(computeScore([f], new Map([["a", rule("a")]]), 1000, 150).index).toBe(0);
  });
});

describe("supresiones", () => {
  const text = [
    "<!-- textoneitor-disable-file lexico/z -->",
    "Uno hoy en día.",
    "<!-- textoneitor-disable-next-line lexico/a -- motivo: cita literal -->",
    "Dos hoy en día.",
    "Tres hoy en día. <!-- textoneitor-disable-line -->",
    "<!-- textoneitor-disable lexico/* -->",
    "Cuatro hoy en día.",
    "<!-- textoneitor-enable -->",
    "Cinco hoy en día.",
  ].join("\n");
  const ls = computeLineStarts(text);
  const dirs = parseSuppressions(text, ls);
  it("parsea directivas", () => {
    expect(dirs.map((d) => d.kind)).toEqual(["file", "next-line", "line", "disable", "enable"]);
    expect(dirs[1]!.reason).toBe("cita literal");
    expect(dirs[1]!.rules).toEqual(["lexico/a"]);
  });
  it("aplica archivo, línea, siguiente línea y rangos", () => {
    const off = (line: number) => ls[line - 1]!;
    const fs = [
      finding("lexico/z", off(2), 2), finding("lexico/a", off(2) + 1, 2),
      finding("lexico/a", off(4), 4), finding("lexico/b", off(4) + 1, 4),
      finding("lexico/b", off(5), 5),
      finding("lexico/a", off(7), 7), finding("estructura/c", off(7) + 1, 7),
      finding("lexico/a", off(9), 9),
    ];
    applySuppressions(fs, dirs);
    expect(fs.map((f) => f.suppressed?.by ?? "-")).toEqual(["inline", "-", "inline", "-", "inline", "inline", "-", "-"]);
    expect(fs[2]!.suppressed?.reason).toBe("cita literal");
  });
});

describe("baseline", () => {
  const mk = (p: string, fps: string[]): FileResult => ({
    path: p, format: "text", durationMs: 0, score: { index: null, eligibleWords: 0, minWords: 150, contributors: [] },
    findings: fps.map((fp, i) => ({ ...finding("lexico/a", i), fingerprint: fp })),
  });
  it("crea, aplica y detecta obsoletas sin guardar texto", () => {
    const b = createBaseline([mk("a.md", ["f1", "f2"]), mk("b\\c.md", ["f3"])], "legado", new Date("2026-01-01T00:00:00Z"));
    expect(JSON.stringify(b)).not.toContain('"snippet"');
    expect(b.entries.map((e) => e.path)).toEqual(["a.md", "a.md", "b/c.md"]);
    const now = [mk("a.md", ["f1", "f9"]), mk("b/c.md", ["f3"])];
    const r = applyBaseline(now, b);
    expect(r.matched).toBe(2);
    expect(r.stale.map((e) => e.fingerprint)).toEqual(["f2"]);
    expect(now[0]!.findings.map((f) => f.suppressed?.by ?? "-")).toEqual(["baseline", "-"]);
    expect(now[0]!.findings[0]!.suppressed?.reason).toBe("legado");
  });
  it("update elimina obsoletas y no añade nuevas salvo que se pida", () => {
    const b = createBaseline([mk("a.md", ["f1", "f2"]), mk("z.md", ["fz"])]);
    const now = [mk("a.md", ["f1", "f9"])];
    const u1 = updateBaseline(b, now, { addNew: false });
    expect(u1.entries.map((e) => e.fingerprint)).toEqual(["f1", "fz"]);
    const u2 = updateBaseline(b, now, { addNew: true, reason: "r" });
    expect(u2.entries.map((e) => e.fingerprint)).toEqual(["f1", "f9", "fz"]);
  });
});

describe("seguridad de regex", () => {
  it("rechaza retroreferencias, no acotados, anidados y vacíos", () => {
    expect(checkPattern("(a)\\1")).toContain("retroreferencias no permitidas");
    expect(checkPattern("hoy.*día").join()).toContain("no acotado");
    expect(checkPattern("(a+)+")).toContain("cuantificador anidado sobre un grupo con cuantificador");
    expect(checkPattern("a*")).toContain("el patrón puede coincidir con la cadena vacía");
    expect(checkPattern("a{2,}")).toContain("cuantificador {n,} sin máximo");
    expect(checkPattern("[")[0]).toMatch(/inválido/);
  });
  it("acepta patrones acotados", () => {
    expect(checkPattern("desde [^.]{3,60} hasta [^.]{3,60}, pasando por")).toEqual([]);
    expect(checkPattern("(?:es|resulta) (?:importante|crucial) (?:destacar|señalar)")).toEqual([]);
    expect(hasNestedQuantifier("(?:ab)+c")).toBe(false);
    expect(hasNestedQuantifier("(?:a|b+)+")).toBe(true);
  });
  it("el motor procesa 1 MB adversarial en tiempo acotado", () => {
    const doc = buildDocument(adversarialText(1_000_000), { format: "text" });
    const rules: CompiledRule[] = [
      { ...rule("r1"), detector: "regex", params: { patterns: ["no (?:solo|solamente) [^.]{1,80} sino"] } },
      { ...rule("r2"), detector: "sequence", params: { steps: [["no solo"], ["sino"]], max_gap: 8 } },
      { ...rule("r3"), detector: "repetition", params: { unit: "ngram", n: 3, min_repeats: 3 } },
      { ...rule("r4"), detector: "structure", params: { kind: "triad" } },
    ];
    const t0 = performance.now();
    runRules(doc, rules);
    expect(performance.now() - t0).toBeLessThan(5000);
  });
});
