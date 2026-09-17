import type { CompiledRule, Document, TextBlock } from "../../contracts/index.js";

/** Coincidencia bruta dentro de un bloque (índices sobre `block.text`). */
export interface RawMatch {
  blockIndex: number;
  start: number;
  end: number;
  /** Datos para interpolar en el mensaje: {count}, {ratio}, {term}… */
  data?: Record<string, string | number>;
}

export type Detector = (rule: CompiledRule, doc: Document) => RawMatch[];

/** Palabras funcionales frecuentes; se excluyen de tríadas y n-gramas. */
export const STOPWORDS = new Set(
  (
    "a al algo alguna algunas alguno algunos ante antes aquel aquella aquellas aquellos aquí así aun aunque bajo bien cada casi " +
    "como con contra cual cuales cuando de del desde donde dos e el ella ellas ello ellos en entre era eran es esa esas ese eso esos esta " +
    "estaba estaban estamos están estar estas este esto estos fue fueron ha había habían han hasta hay la las le les lo los más me " +
    "mi mis mientras muy nada ni no nos nosotros nuestra nuestras nuestro nuestros o os otra otras otro otros para pero poco por " +
    "porque que quien quienes se sea sean según ser será serán si sido sin sino sobre son su sus también tan tanto te tener tiene " +
    "tienen toda todas todo todos tras tu tus un una unas uno unos usted ustedes vosotros ya yo él ésta éste"
  ).split(" "),
);

/** Escapa texto para usarlo literal en una RegExp. */
export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const LB = "(?<![\\p{L}\\p{M}\\p{N}])";
const RB = "(?![\\p{L}\\p{M}\\p{N}])";

/**
 * Construye una única RegExp a partir de una lista de términos o expresiones.
 * Los términos literales admiten espacios (se convierten en `\s+`) y se delimitan por límites de palabra Unicode.
 * Los términos que empiezan por `re:` se insertan como expresión regular (ya validada por el compilador).
 */
export function buildTermRegExp(terms: string[], flags = "giu"): RegExp | null {
  const alts: string[] = [];
  const raw: string[] = [];
  for (const t of terms) {
    if (t.startsWith("raw:")) raw.push(`(?:${t.slice(4)})`);
    else if (t.startsWith("re:")) alts.push(`(?:${t.slice(3)})`);
    else if (t.trim()) alts.push(escapeRe(t.trim()).replace(/\s+/g, "\\s+"));
  }
  if (alts.length === 0 && raw.length === 0) return null;
  // Términos más largos primero para evitar coincidencias parciales.
  alts.sort((a, b) => b.length - a.length);
  const parts: string[] = [];
  if (alts.length) parts.push(`${LB}(?:${alts.join("|")})${RB}`);
  parts.push(...raw); // `raw:` = expresión sin límites de palabra (símbolos, puntuación).
  return new RegExp(parts.length === 1 ? (parts[0] as string) : `(?:${parts.join("|")})`, flags);
}

export function wordsIn(block: TextBlock, doc: Document, blockIndex: number): number {
  let n = 0;
  for (const t of doc.tokens) {
    if (t.blockIndex !== blockIndex) continue;
    if (t.isWord) n++;
  }
  return n;
}

/** Devuelve los índices de tokens por bloque (cache barata por documento). */
export function tokensByBlock(doc: Document): number[][] {
  const out: number[][] = doc.blocks.map(() => []);
  doc.tokens.forEach((t, i) => (out[t.blockIndex] as number[]).push(i));
  return out;
}

/** Comprueba si una coincidencia cae dentro de una excepción (patrón sobre una ventana de contexto). */
export function isExcepted(rule: CompiledRule, text: string, start: number, end: number): boolean {
  const pats = rule.exceptions.patterns;
  if (!pats || pats.length === 0) return false;
  const ctxStart = Math.max(0, start - 40);
  const ctxEnd = Math.min(text.length, end + 40);
  const ctx = text.slice(ctxStart, ctxEnd);
  for (const p of pats) {
    // La excepción debe solapar con la coincidencia, no solo aparecer cerca.
    for (const m of execAll(new RegExp(p, "iu"), ctx)) {
      const ms = ctxStart + m.index;
      const me = ms + m.length;
      if (ms < end && me > start) return true;
    }
  }
  return false;
}

export function execAll(re: RegExp, text: string): { index: number; length: number; match: RegExpExecArray }[] {
  const out: { index: number; length: number; match: RegExpExecArray }[] = [];
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = r.exec(text)) !== null) {
    if (m[0].length === 0) {
      r.lastIndex++;
      continue;
    }
    out.push({ index: m.index, length: m[0].length, match: m });
  }
  return out;
}
