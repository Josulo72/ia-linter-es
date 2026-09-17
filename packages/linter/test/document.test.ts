import { describe, expect, it } from "vitest";
import { buildDocument, normalizeText, offsetToLineColumn } from "../src/document/index.js";

describe("normalizeText", () => {
  it("elimina BOM y mapea offsets", () => {
    const n = normalizeText("﻿hola");
    expect(n.text).toBe("hola");
    expect(n.toOriginal(0)).toBe(1);
    expect(n.toOriginal(4)).toBe(5);
  });
  it("convierte CRLF a LF con mapa exacto", () => {
    const orig = "ab\r\ncd\r\nef";
    const n = normalizeText(orig);
    expect(n.text).toBe("ab\ncd\nef");
    for (let i = 0; i < n.text.length; i++) {
      const ch = n.text[i];
      if (ch === "\n") continue;
      expect(orig[n.toOriginal(i)]).toBe(ch);
    }
    expect(n.toOriginal(n.text.length)).toBe(orig.length);
  });
  it("CR solitario no desplaza", () => {
    const n = normalizeText("a\rb");
    expect(n.text).toBe("a\nb");
    expect(n.toOriginal(2)).toBe(2);
  });
  it("BOM + CRLF combinados", () => {
    const orig = "﻿uno\r\ndos";
    const n = normalizeText(orig);
    expect(orig.slice(n.toOriginal(4), n.toOriginal(7))).toBe("dos");
  });
});

describe("offsetToLineColumn", () => {
  it("cuenta columnas en code points (emojis y tildes compuestas)", () => {
    const text = "a😀b\nñ́c";
    const doc = buildDocument(text, { format: "text" });
    // 'b' está en offset 3 (emoji ocupa 2 unidades) -> columna 3
    expect(offsetToLineColumn(text, doc.lineStarts, 3)).toEqual({ line: 1, column: 3 });
    // 'c' en línea 2: ñ + combinante ocupan 2 unidades -> columna 3
    const cOff = text.indexOf("c");
    expect(offsetToLineColumn(text, doc.lineStarts, cOff)).toEqual({ line: 2, column: 3 });
  });
});

describe("buildDocument texto plano", () => {
  it("separa párrafos, frases y tokens con offsets exactos", () => {
    const text = "Primera frase. Segunda frase con 3 palabras.\n\nOtro párrafo aquí.";
    const doc = buildDocument(text, { format: "text" });
    expect(doc.blocks).toHaveLength(2);
    expect(doc.sentences.map((s) => s.text)).toEqual(["Primera frase.", "Segunda frase con 3 palabras.", "Otro párrafo aquí."]);
    for (const t of doc.tokens) {
      const b = doc.blocks[t.blockIndex]!;
      const o = b.map[t.start]!;
      expect(text.slice(o, o + t.text.length)).toBe(t.text);
    }
    expect(doc.eligibleWords).toBe(9);
  });
  it("no corta en abreviaturas ni decimales", () => {
    const doc = buildDocument("El Sr. Pérez pagó 3.5 euros. Fin.", { format: "text" });
    expect(doc.sentences.map((s) => s.text)).toEqual(["El Sr. Pérez pagó 3.5 euros.", "Fin."]);
  });
  it("round-trip con CRLF y BOM", () => {
    const orig = "﻿Línea uno.\r\n\r\nLínea dos con más texto.";
    const doc = buildDocument(orig, { format: "text" });
    expect(doc.blocks).toHaveLength(2);
    for (const t of doc.tokens) {
      const b = doc.blocks[t.blockIndex]!;
      const o = b.map[t.start]!;
      expect(orig.slice(o, o + t.text.length)).toBe(t.text);
    }
    const last = doc.blocks[1]!;
    expect(offsetToLineColumn(orig, doc.lineStarts, last.map[0]!)).toEqual({ line: 3, column: 1 });
  });
});

describe("buildDocument markdown", () => {
  const md = [
    "---",
    "title: hola",
    "---",
    "",
    "# Título *con* énfasis",
    "",
    "Un párrafo con `código inline` y un [enlace visible](https://example.com/vertiginoso).",
    "",
    "```js",
    "const vertiginoso = 1;",
    "```",
    "",
    "- Elemento uno",
    "- Elemento **dos**",
    "",
    "> Cita con texto.",
    "",
    "<!-- comentario vertiginoso -->",
    "",
    "[ref]: https://example.com",
    "",
    "| a | b |",
    "|---|---|",
    "| celda uno | celda dos |",
  ].join("\n");

  it("extrae solo bloques elegibles y mantiene offsets", () => {
    const doc = buildDocument(md, { format: "markdown" });
    const kinds = doc.blocks.map((b) => b.kind);
    expect(kinds).toEqual([
      "heading",
      "paragraph",
      "list_item",
      "list_item",
      "blockquote",
      "table_cell",
      "table_cell",
      "table_cell",
      "table_cell",
    ]);
    const all = doc.blocks.map((b) => b.text).join("\n");
    expect(all).not.toContain("vertiginoso");
    expect(all).not.toContain("title:");
    expect(all).not.toContain("example.com");
    expect(all).toContain("enlace visible");
    expect(doc.blocks[0]!.text).toBe("Título con énfasis");
    for (const t of doc.tokens) {
      const b = doc.blocks[t.blockIndex]!;
      const o = b.map[t.start]!;
      expect(md.slice(o, o + t.text.length)).toBe(t.text);
    }
  });

  it("entidades HTML y escapes no rompen offsets", () => {
    const src = "Texto con &amp; y \\* asterisco final.";
    const doc = buildDocument(src, { format: "markdown" });
    const b = doc.blocks[0]!;
    expect(b.text).toBe("Texto con & y * asterisco final.");
    for (let i = 0; i < b.text.length; i++) {
      const o = b.map[i]!;
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThan(src.length);
    }
    const tok = doc.tokens.find((t) => t.text === "final")!;
    const o = b.map[tok.start]!;
    expect(src.slice(o, o + 5)).toBe("final");
  });
});
