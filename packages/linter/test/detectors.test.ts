import { describe, expect, it } from "vitest";
import { buildDocument } from "../src/document/index.js";
import { runRules } from "../src/rules/runtime/index.js";
import type { CompiledRule, DetectorKind } from "../src/contracts/index.js";

function rule(detector: DetectorKind, params: Record<string, unknown>, extra: Partial<CompiledRule> = {}): CompiledRule {
  return {
    id: `lexico/test-${detector}`, revision: 1, status: "stable", title: "t", summary: "s", category: "lexico", scope: "sentence",
    detector, params, exceptions: {}, default_level: "warning", score: { weight: 1, cap: 3 }, message: "m {term}{count}",
    explanation: "", rewrite_guidance: "", profiles: {}, ...extra,
  };
}
const run = (text: string, r: CompiledRule, format: "text" | "markdown" = "text") => runRules(buildDocument(text, { format }), [r]);

describe("regex", () => {
  it("encuentra coincidencias con offsets exactos", () => {
    const text = "Hoy en día todo cambia. En la era digital, hoy en día más.";
    const f = run(text, rule("regex", { patterns: ["hoy en d[ií]a"] }));
    expect(f).toHaveLength(2);
    expect(text.slice(f[0]!.range.start.offset, f[0]!.range.end.offset)).toBe("Hoy en día");
    expect(f[1]!.range.start.column).toBe(44);
  });
  it("respeta anchor block_start y last_block", () => {
    const text = "En resumen, primero.\n\nOtra cosa en resumen.\n\nEn resumen, final.";
    expect(run(text, rule("regex", { patterns: ["en resumen"], anchor: "block_start" }))).toHaveLength(2);
    expect(run(text, rule("regex", { patterns: ["en resumen"], anchor: "last_block" }))).toHaveLength(1);
  });
  it("aplica excepciones por contexto", () => {
    const r = rule("regex", { patterns: ["clave"] }, { exceptions: { patterns: ["clave (privada|pública)"] } });
    expect(run("La clave privada y la palabra clave.", r)).toHaveLength(1);
  });
});

describe("lexicon", () => {
  it("delimita palabras completas y admite espacios flexibles", () => {
    const r = rule("lexicon", { terms: ["sumérgete", "en el vertiginoso mundo"] });
    const f = run("Sumérgete en el vertiginoso  mundo. Sumergetea no cuenta.", r);
    expect(f.map((x) => x.snippet)).toEqual(["Sumérgete", "en el vertiginoso mundo"]);
  });
});

describe("sequence", () => {
  it("exige orden y hueco máximo dentro de la frase", () => {
    const r = rule("sequence", { steps: [["no solo", "no solamente"], ["sino"]], max_gap: 6 });
    expect(run("No solo es rápido, sino también barato.", r)).toHaveLength(1);
    expect(run("No solo es rápido y además muy muy muy muy muy bonito y práctico, sino barato.", r)).toHaveLength(0);
    expect(run("No solo es rápido. Sino que además.", r)).toHaveLength(0);
  });
});

describe("density", () => {
  it("ventana de documento por mil palabras", () => {
    const r = rule("density", { terms: ["re:[\\p{L}]+mente"], window: "document", min_count: 3, per_1000: 50 });
    const text = "Realmente es claramente algo sumamente raro y otras palabras que suman aquí.";
    const f = run(text, r);
    expect(f).toHaveLength(1);
    expect(f[0]!.message).toContain("3");
    expect(run("Realmente una sola vez con muchas otras palabras normales por aquí.", r)).toHaveLength(0);
  });
  it("unidad block_start cuenta párrafos que empiezan por conector", () => {
    const r = rule("density", { terms: ["además", "asimismo", "por otro lado"], window: "document", unit: "block_start", min_count: 2, ratio: 0.5 });
    expect(run("Además, uno.\n\nAsimismo, dos.\n\nTres normal.", r)).toHaveLength(1);
    expect(run("Además, uno.\n\nDos.\n\nTres.\n\nCuatro.", r)).toHaveLength(0);
  });
});

describe("repetition", () => {
  it("inicios de frase consecutivos repetidos", () => {
    const r = rule("repetition", { unit: "sentence_start", n: 2, min_repeats: 3 });
    expect(run("Es hora de actuar. Es hora de cambiar. Es hora de vivir. Fin.", r)).toHaveLength(1);
    expect(run("Es hora de actuar. Ahora bien. Es hora de vivir.", r)).toHaveLength(0);
  });
  it("n-gramas repetidos sin cruzar frases", () => {
    const r = rule("repetition", { unit: "ngram", n: 3, min_repeats: 3 });
    const f = run("La gestión del cambio importa. La gestión del cambio cuesta. Sin la gestión del cambio nada.", r);
    expect(f.length).toBeGreaterThanOrEqual(1);
    expect(f[0]!.message).toContain("gestión del cambio");
  });
});

describe("structure", () => {
  it("triada de palabras de la misma clase", () => {
    const r = rule("structure", { kind: "triad" });
    expect(run("Un enfoque claro, conciso y directo.", r)).toHaveLength(1);
    expect(run("Compramos pan, queso y vino.", r)).toHaveLength(0);
    expect(run("Una solución innovadora, escalable y sostenible.", r)).toHaveLength(1);
    expect(run("Vinieron Juan, Pedro y María.", r)).toHaveLength(0);
  });
  it("encabezado con dos puntos y title case", () => {
    const md = "# Guía completa: todo lo que necesitas\n\n# Cómo Elegir Tu Mejor Estrategia Digital\n\n# CLI\n";
    expect(run(md, rule("structure", { kind: "heading_colon" }), "markdown")).toHaveLength(1);
    expect(run(md, rule("structure", { kind: "heading_title_case", min_words: 3 }), "markdown")).toHaveLength(1);
  });
  it("coeficiente de variación de longitud de frase", () => {
    const uniform = Array.from({ length: 12 }, (_, i) => `Esta es una frase de longitud fija número ${i}.`).join(" ");
    const varied = "Corta. Esta frase es bastante más larga que la anterior y sigue un rato más. Media aquí. " +
      "Otra muy larga que se alarga y se alarga y se alarga sin parar durante un buen rato para variar. Sí. Fin de todo esto. " +
      "Y aún otra frase intermedia. Otra. Y una más larga para cerrar el conjunto de frases con variedad real. Última frase corta. Otra.";
    const r = rule("structure", { kind: "sentence_length_cv", min_sentences: 10, max_cv: 0.3 });
    expect(run(uniform, r)).toHaveLength(1);
    expect(run(varied, r)).toHaveLength(0);
  });
  it("listas con negrita inicial", () => {
    const md = "- **Uno:** algo\n- **Dos:** algo\n- **Tres:** algo\n\n- normal\n- **Solo:** uno\n";
    expect(run(md, rule("structure", { kind: "list_bold_lead", min_consecutive: 3 }), "markdown")).toHaveLength(1);
  });
});

describe("cooccurrence", () => {
  it("ventana de frase ordenada", () => {
    const r = rule("cooccurrence", { groups: [["no se trata de"], ["sino de"]], window: "sentence", ordered: true });
    expect(run("No se trata de correr, sino de llegar.", r)).toHaveLength(1);
    expect(run("Sino de llegar; no se trata de correr.", r)).toHaveLength(0);
  });
  it("ventana de documento con anclaje a inicio de bloque", () => {
    const r = rule("cooccurrence", { groups: [["en primer lugar"], ["en segundo lugar"]], window: "document", ordered: true, anchor: "block_start" });
    expect(run("En primer lugar, a.\n\nEn segundo lugar, b.", r)).toHaveLength(1);
    expect(run("Dijo que en primer lugar a.\n\nEn segundo lugar, b.", r)).toHaveLength(0);
  });
});

describe("runtime", () => {
  it("es determinista y produce huellas estables independientes de la línea", () => {
    const r = rule("lexicon", { terms: ["hoy en día"] });
    const a = run("Hoy en día. Hoy en día.", r);
    const b = run("\n\n\nHoy en día. Hoy en día.", r);
    expect(a.map((f) => f.fingerprint)).toEqual(b.map((f) => f.fingerprint));
    expect(a[0]!.fingerprint).not.toBe(a[1]!.fingerprint);
    expect(JSON.stringify(a)).toBe(JSON.stringify(run("Hoy en día. Hoy en día.", r)));
  });
  it("omite reglas en off y respeta niveles", () => {
    const r = rule("lexicon", { terms: ["hoy en día"] });
    expect(runRules(buildDocument("Hoy en día.", { format: "text" }), [r], { levels: { [r.id]: "off" } })).toHaveLength(0);
    expect(runRules(buildDocument("Hoy en día.", { format: "text" }), [r], { levels: { [r.id]: "error" } })[0]!.level).toBe("error");
  });
});
