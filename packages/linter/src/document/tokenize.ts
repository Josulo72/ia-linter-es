import type { Sentence, TextBlock, Token } from "../contracts/index.js";

const WORD_RE = /[\p{L}\p{M}\p{N}]+(?:['’\-·][\p{L}\p{M}\p{N}]+)*/gu;
const SENT_END = /[.!?…]+["»”')\]]*|\n/g;
const ABBREV = new Set([
  "sr", "sra", "srta", "dr", "dra", "etc", "p", "pp", "pág", "págs", "ej", "núm", "ud", "uds", "vs",
  "art", "cap", "fig", "vol", "aprox", "tel", "av", "avda", "sto", "sta", "d", "dña", "prof", "ing", "lic",
]);

export function tokenizeBlock(block: TextBlock, blockIndex: number): Token[] {
  const tokens: Token[] = [];
  const re = new RegExp(WORD_RE.source, WORD_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(block.text)) !== null) {
    const text = m[0];
    const isWord = /\p{L}/u.test(text);
    tokens.push({ blockIndex, start: m.index, end: m.index + text.length, text, lower: text.toLowerCase(), isWord });
  }
  return tokens;
}

/** Divide un bloque en frases. Un encabezado o elemento de lista sin puntuación es una única frase. */
export function splitSentences(block: TextBlock, blockIndex: number): Sentence[] {
  const text = block.text;
  const out: Sentence[] = [];
  let start = 0;
  const re = new RegExp(SENT_END.source, SENT_END.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + m[0].length;
    if (m[0] !== "\n") {
      const before = text.slice(Math.max(start, m.index - 8), m.index);
      const wordBefore = /(\p{L}+)$/u.exec(before)?.[1]?.toLowerCase();
      const next = text.charAt(end);
      if (m[0] === "." && wordBefore && ABBREV.has(wordBefore)) continue;
      if (m[0] === "." && /\p{N}/u.test(next)) continue;
      if (m[0] === "." && wordBefore && wordBefore.length === 1 && /\p{Lu}/u.test(before.slice(-1))) continue; // iniciales
      if (next !== "" && !/\s/.test(next)) continue; // "v1.0", "www.x"
    }
    push(start, end);
    start = end;
  }
  push(start, text.length);
  return out;

  function push(s: number, e: number): void {
    const t = text.slice(s, e);
    const ns = s + (t.length - t.trimStart().length);
    const ne = e - (t.length - t.trimEnd().length);
    if (ne <= ns) return;
    out.push({ blockIndex, start: ns, end: ne, text: text.slice(ns, ne) });
  }
}
