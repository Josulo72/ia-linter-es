import type { Document, TextBlock } from "../contracts/index.js";
import { computeLineStarts, normalizeText } from "./text.js";
import { splitSentences, tokenizeBlock } from "./tokenize.js";
import { markdownBlocks } from "../markdown/index.js";

export { normalizeText, computeLineStarts, offsetToLineColumn, snippetOf } from "./text.js";
export { splitSentences, tokenizeBlock } from "./tokenize.js";

/** Bloques de texto plano: párrafos separados por líneas en blanco. */
export function plainTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const re = /(?:[^\n]|\n(?![ \t]*\n))+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (!body) continue;
    const start = m.index + lead;
    const map = new Int32Array(body.length + 1);
    for (let i = 0; i <= body.length; i++) map[i] = start + i;
    blocks.push({ kind: "plain", text: body, map, depth: 0 });
  }
  return blocks;
}

export function detectFormat(path: string | null | undefined): "text" | "markdown" {
  if (!path) return "text";
  return /\.(md|markdown|mdown|mkd)$/i.test(path) ? "markdown" : "text";
}

export function buildDocument(
  original: string,
  opts: { path?: string | null; format?: "text" | "markdown" },
): Document {
  const format = opts.format ?? detectFormat(opts.path);
  const norm = normalizeText(original);
  const codeRanges: [number, number][] = [];
  const blocks = format === "markdown" ? markdownBlocks(norm.text, codeRanges) : plainTextBlocks(norm.text);
  if (norm.hadBom || norm.hadCr) {
    for (const b of blocks) {
      for (let i = 0; i < b.map.length; i++) b.map[i] = norm.toOriginal(b.map[i] as number);
    }
    for (const r of codeRanges) {
      r[0] = norm.toOriginal(r[0]);
      r[1] = norm.toOriginal(r[1]);
    }
  }
  const sentences = [];
  const tokens = [];
  let eligibleWords = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i] as TextBlock;
    sentences.push(...splitSentences(b, i));
    const t = tokenizeBlock(b, i);
    for (const tk of t) if (tk.isWord) eligibleWords++;
    tokens.push(...t);
  }
  return {
    path: opts.path ?? null,
    format,
    original,
    lineStarts: computeLineStarts(original),
    blocks,
    sentences,
    tokens,
    eligibleWords,
    ...(codeRanges.length ? { codeRanges } : {}),
  };
}
