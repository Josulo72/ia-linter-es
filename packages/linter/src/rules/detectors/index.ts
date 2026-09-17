import type { CompiledRule, DetectorKind, Document, TextBlock } from "../../contracts/index.js";
import { buildTermRegExp, execAll, isExcepted, STOPWORDS, tokensByBlock, type Detector, type RawMatch } from "./shared.js";

export type { RawMatch, Detector } from "./shared.js";

/* ------------------------------------------------------------------ */
/* regex: patrones sobre el texto de cada bloque.                      */
/* params: { patterns: string[], flags?: string, anchor?: "block_start" | "block_end" | "last_block" | "first_block" } */
/* ------------------------------------------------------------------ */
const regex: Detector = (rule, doc) => {
  const p = rule.params as { patterns: string[]; flags?: string; anchor?: string; kinds?: string[] };
  const flags = p.flags ?? "giu";
  const res = p.patterns.map((s) => new RegExp(s, flags.includes("g") ? flags : flags + "g"));
  const out: RawMatch[] = [];
  doc.blocks.forEach((b, bi) => {
    if (p.kinds && !p.kinds.includes(b.kind)) return;
    if (p.anchor === "last_block" && bi !== doc.blocks.length - 1) return;
    if (p.anchor === "first_block" && bi !== 0) return;
    for (const re of res) {
      for (const m of execAll(re, b.text)) {
        if (p.anchor === "block_start" && m.index !== 0) continue;
        if (p.anchor === "block_end" && m.index + m.length !== b.text.length) continue;
        if (isExcepted(rule, b.text, m.index, m.index + m.length)) continue;
        out.push({ blockIndex: bi, start: m.index, end: m.index + m.length, data: { term: m.match[0] } });
      }
    }
  });
  return out;
};

/* ------------------------------------------------------------------ */
/* lexicon: términos literales (o re:) con límites de palabra.          */
/* params: { terms: string[], kinds?: string[] }                        */
/* ------------------------------------------------------------------ */
const lexicon: Detector = (rule, doc) => {
  const p = rule.params as { terms: string[]; kinds?: string[] };
  const re = buildTermRegExp(p.terms);
  if (!re) return [];
  const out: RawMatch[] = [];
  doc.blocks.forEach((b, bi) => {
    if (p.kinds && !p.kinds.includes(b.kind)) return;
    for (const m of execAll(re, b.text)) {
      if (isExcepted(rule, b.text, m.index, m.index + m.length)) continue;
      out.push({ blockIndex: bi, start: m.index, end: m.index + m.length, data: { term: m.match[0] } });
    }
  });
  return out;
};

/* ------------------------------------------------------------------ */
/* sequence: pasos en orden dentro de una frase, con hueco máximo.      */
/* params: { steps: string[][] (alternativas literales o re: por paso), max_gap: number (palabras) } */
/* ------------------------------------------------------------------ */
const sequence: Detector = (rule, doc) => {
  const p = rule.params as { steps: string[][]; max_gap: number };
  const stepRes = p.steps.map((alts) => buildTermRegExp(alts));
  if (stepRes.some((r) => r === null)) return [];
  const out: RawMatch[] = [];
  for (const s of doc.sentences) {
    const b = doc.blocks[s.blockIndex] as TextBlock;
    let cursor = s.start;
    let first = -1;
    let last = -1;
    let ok = true;
    for (let i = 0; i < stepRes.length; i++) {
      const re = new RegExp((stepRes[i] as RegExp).source, "iug");
      re.lastIndex = cursor;
      let found: RegExpExecArray | null = null;
      let m: RegExpExecArray | null;
      while ((m = re.exec(b.text)) !== null) {
        if (m.index + m[0].length > s.end) break;
        if (i === 0) {
          found = m;
          break;
        }
        const gapText = b.text.slice(last, m.index);
        const gapWords = (gapText.match(/[\p{L}\p{N}]+/gu) ?? []).length;
        if (gapWords <= p.max_gap) {
          found = m;
          break;
        }
        // Demasiado lejos: probamos un inicio posterior no tiene sentido; abortamos.
        break;
      }
      if (!found) {
        ok = false;
        break;
      }
      if (i === 0) first = found.index;
      last = found.index + found[0].length;
      cursor = last;
    }
    if (ok && first >= 0 && !isExcepted(rule, b.text, first, last)) {
      out.push({ blockIndex: s.blockIndex, start: first, end: last, data: { term: b.text.slice(first, last) } });
    }
  }
  return out;
};

/* ------------------------------------------------------------------ */
/* density: frecuencia de un léxico/patrón en una ventana.              */
/* params: { terms: string[], window: "block"|"document", unit?: "match"|"block_start"|"sentence",
/*           min_count: number, per_1000?: number, ratio?: number, min_words?: number, kinds?: string[] } */
/* ------------------------------------------------------------------ */
const density: Detector = (rule, doc) => {
  const p = rule.params as {
    terms: string[];
    window: "block" | "document";
    unit?: "match" | "block_start" | "sentence";
    min_count: number;
    per_1000?: number;
    ratio?: number;
    min_words?: number;
    kinds?: string[];
  };
  const re = buildTermRegExp(p.terms);
  if (!re) return [];
  const unit = p.unit ?? "match";
  const out: RawMatch[] = [];
  const tb = tokensByBlock(doc);

  const countBlock = (b: TextBlock, bi: number): { count: number; first: [number, number] | null; units: number } => {
    let count = 0;
    let first: [number, number] | null = null;
    if (unit === "block_start") {
      const r = new RegExp(re.source, "iu");
      const m = r.exec(b.text);
      if (m && m.index === 0) {
        count = 1;
        first = [0, m[0].length];
      }
      return { count, first, units: 1 };
    }
    if (unit === "sentence") {
      const sents = doc.sentences.filter((s) => s.blockIndex === bi);
      for (const s of sents) {
        const r = new RegExp(re.source, "iu");
        const m = r.exec(s.text);
        if (m) {
          count++;
          if (!first) first = [s.start + m.index, s.start + m.index + m[0].length];
        }
      }
      return { count, first, units: sents.length };
    }
    for (const m of execAll(re, b.text)) {
      if (isExcepted(rule, b.text, m.index, m.index + m.length)) continue;
      count++;
      if (!first) first = [m.index, m.index + m.length];
    }
    const words = (tb[bi] as number[]).filter((i) => (doc.tokens[i] as { isWord: boolean }).isWord).length;
    return { count, first, units: words };
  };

  if (p.window === "block") {
    doc.blocks.forEach((b, bi) => {
      if (p.kinds && !p.kinds.includes(b.kind)) return;
      const { count, first, units } = countBlock(b, bi);
      if (count < p.min_count || !first) return;
      if (p.min_words && units < p.min_words) return;
      if (p.per_1000 !== undefined && units > 0 && (count * 1000) / units < p.per_1000) return;
      if (p.ratio !== undefined && units > 0 && count / units < p.ratio) return;
      out.push({ blockIndex: bi, start: first[0], end: first[1], data: { count, per_1000: units ? Math.round((count * 1000) / units) : 0 } });
    });
    return out;
  }
  // window: document
  let total = 0;
  let units = 0;
  let first: RawMatch | null = null;
  doc.blocks.forEach((b, bi) => {
    if (p.kinds && !p.kinds.includes(b.kind)) return;
    const r = countBlock(b, bi);
    total += r.count;
    units += r.units;
    if (!first && r.first) first = { blockIndex: bi, start: r.first[0], end: r.first[1] };
  });
  if (unit === "match") units = doc.eligibleWords;
  if (total < p.min_count || !first) return [];
  if (p.min_words && doc.eligibleWords < p.min_words) return [];
  const per1000 = units > 0 ? (total * 1000) / units : 0;
  if (p.per_1000 !== undefined && per1000 < p.per_1000) return [];
  if (p.ratio !== undefined && units > 0 && total / units < p.ratio) return [];
  const f = first as RawMatch;
  f.data = { count: total, per_1000: Math.round(per1000), ratio: units ? Math.round((100 * total) / units) : 0 };
  return [f];
};

/* ------------------------------------------------------------------ */
/* repetition: inicios de frase/párrafo repetidos o n-gramas repetidos. */
/* params: { unit: "sentence_start"|"block_start"|"ngram", n: number, min_repeats: number, consecutive?: boolean } */
/* ------------------------------------------------------------------ */
const repetition: Detector = (rule, doc) => {
  const p = rule.params as { unit: "sentence_start" | "block_start" | "ngram"; n: number; min_repeats: number; consecutive?: boolean };
  const out: RawMatch[] = [];
  const tb = tokensByBlock(doc);
  if (p.unit === "ngram") {
    const seen = new Map<string, { blockIndex: number; start: number; end: number }[]>();
    // Recorrido lineal: frases y tokens están ordenados por bloque y posición.
    let si = 0;
    doc.blocks.forEach((_b, bi) => {
      const words = (tb[bi] as number[]).map((i) => doc.tokens[i]!).filter((t) => t.isWord);
      let wi = 0;
      while (si < doc.sentences.length && doc.sentences[si]!.blockIndex < bi) si++;
      for (; si < doc.sentences.length && doc.sentences[si]!.blockIndex === bi; si++) {
        const s = doc.sentences[si]!;
        while (wi < words.length && words[wi]!.start < s.start) wi++;
        const from = wi;
        while (wi < words.length && words[wi]!.end <= s.end) wi++;
        for (let i = from; i + p.n <= wi; i++) {
          let stops = 0;
          let key = "";
          for (let k = 0; k < p.n; k++) {
            const t = words[i + k]!;
            if (STOPWORDS.has(t.lower)) stops++;
            key += (k ? " " : "") + t.lower;
          }
          if (stops >= p.n - 1) continue; // al menos dos palabras plenas
          if (STOPWORDS.has(words[i]!.lower) && STOPWORDS.has(words[i + p.n - 1]!.lower)) continue;
          let arr = seen.get(key);
          if (!arr) seen.set(key, (arr = []));
          arr.push({ blockIndex: bi, start: words[i]!.start, end: words[i + p.n - 1]!.end });
        }
      }
    });
    for (const [key, arr] of seen) {
      if (arr.length < p.min_repeats) continue;
      // Evitar solapamientos con n-gramas más largos ya notificados: nos quedamos con la primera ocurrencia.
      const a = arr[0]!;
      out.push({ blockIndex: a.blockIndex, start: a.start, end: a.end, data: { term: key, count: arr.length } });
    }
    return dedupeOverlaps(out);
  }
  // sentence_start / block_start
  const units: { blockIndex: number; start: number; end: number; key: string }[] = [];
  if (p.unit === "sentence_start") {
    for (const s of doc.sentences) {
      const words = (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).slice(0, p.n).map((w) => w.toLowerCase());
      if (words.length < p.n) continue;
      units.push({ blockIndex: s.blockIndex, start: s.start, end: s.end, key: words.join(" ") });
    }
  } else {
    doc.blocks.forEach((b, bi) => {
      const words = (b.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).slice(0, p.n).map((w) => w.toLowerCase());
      if (words.length < p.n) return;
      units.push({ blockIndex: bi, start: 0, end: Math.min(b.text.length, 80), key: words.join(" ") });
    });
  }
  if (p.consecutive !== false) {
    let run: typeof units = [];
    const flush = () => {
      if (run.length >= p.min_repeats) {
        const u = run[0]!;
        out.push({ blockIndex: u.blockIndex, start: u.start, end: u.end, data: { term: u.key, count: run.length } });
      }
      run = [];
    };
    for (const u of units) {
      if (run.length && run[run.length - 1]!.key === u.key) run.push(u);
      else {
        flush();
        run = [u];
      }
    }
    flush();
  } else {
    const groups = new Map<string, typeof units>();
    for (const u of units) groups.set(u.key, [...(groups.get(u.key) ?? []), u]);
    for (const [key, g] of groups) {
      if (g.length >= p.min_repeats && !key.split(" ").every((w) => STOPWORDS.has(w))) {
        const u = g[0]!;
        out.push({ blockIndex: u.blockIndex, start: u.start, end: u.end, data: { term: key, count: g.length } });
      }
    }
  }
  return out;
};

function dedupeOverlaps(ms: RawMatch[]): RawMatch[] {
  ms.sort((a, b) => a.blockIndex - b.blockIndex || a.start - b.start || b.end - a.end);
  const out: RawMatch[] = [];
  for (const m of ms) {
    const last = out[out.length - 1];
    if (last && last.blockIndex === m.blockIndex && m.start < last.end) continue;
    out.push(m);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* structure: comprobaciones estructurales con nombre.                  */
/* params: { kind: "triad"|"heading_colon"|"heading_title_case"|"sentence_length_cv"|"list_bold_lead"|"list_uniform_start"|"paragraph_bold_lead"|"sentence_length_alternation", ... } */
/* ------------------------------------------------------------------ */
const structure: Detector = (rule, doc) => {
  const p = rule.params as Record<string, unknown> & { kind: string };
  const out: RawMatch[] = [];
  switch (p.kind) {
    case "triad": {
      // "X, Y y Z" con tres palabras plenas de la misma clase aparente (misma terminación o todas no-stopword).
      const re = /(?<![\p{L}\p{M}])([\p{L}\p{M}]{4,}),\s+([\p{L}\p{M}]{4,})\s+(?:y|e|o|u)\s+([\p{L}\p{M}]{4,})(?![\p{L}\p{M}])/gu;
      const minPer = (p.min_per_document as number | undefined) ?? 1;
      const found: RawMatch[] = [];
      doc.blocks.forEach((b, bi) => {
        for (const m of execAll(re, b.text)) {
          const ws = [m.match[1]!, m.match[2]!, m.match[3]!];
          if (ws.some((w) => STOPWORDS.has(w.toLowerCase()))) continue;
          if (ws.some((w) => /^\p{Lu}/u.test(w))) continue; // nombres propios
          if (!sameClass(ws)) continue;
          if (isExcepted(rule, b.text, m.index, m.index + m.length)) continue;
          found.push({ blockIndex: bi, start: m.index, end: m.index + m.length, data: { term: m.match[0] } });
        }
      });
      if (found.length >= minPer) out.push(...found);
      return out;
    }
    case "heading_colon": {
      doc.blocks.forEach((b, bi) => {
        if (b.kind !== "heading") return;
        const m = /^[^:]{3,80}:\s+\S/u.exec(b.text);
        if (m && !/https?:/i.test(b.text)) out.push({ blockIndex: bi, start: 0, end: b.text.length, data: { term: b.text } });
      });
      return out;
    }
    case "heading_title_case": {
      const minWords = (p.min_words as number | undefined) ?? 4;
      doc.blocks.forEach((b, bi) => {
        if (b.kind !== "heading") return;
        const words = b.text.match(/[\p{L}\p{M}]+/gu) ?? [];
        if (words.length < minWords) return;
        const content = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
        if (content.length < minWords) return;
        const caps = content.filter((w) => /^\p{Lu}/u.test(w));
        // Todo en mayúsculas (siglas) no cuenta.
        if (content.every((w) => w === w.toUpperCase())) return;
        if (caps.length === content.length) out.push({ blockIndex: bi, start: 0, end: b.text.length, data: { term: b.text } });
      });
      return out;
    }
    case "sentence_length_cv": {
      const minSentences = (p.min_sentences as number | undefined) ?? 10;
      const maxCv = (p.max_cv as number | undefined) ?? 0.3;
      const lens = doc.sentences
        .filter((s) => (doc.blocks[s.blockIndex] as TextBlock).kind !== "heading")
        .map((s) => (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length)
        .filter((n) => n >= 3);
      if (lens.length < minSentences) return out;
      const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
      const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
      const cv = mean > 0 ? sd / mean : 0;
      if (cv < maxCv) {
        const s = doc.sentences[0]!;
        out.push({ blockIndex: s.blockIndex, start: s.start, end: s.end, data: { cv: Math.round(cv * 100) / 100, count: lens.length } });
      }
      return out;
    }
    case "list_bold_lead": {
      const min = (p.min_consecutive as number | undefined) ?? 3;
      let run: number[] = [];
      const flush = () => {
        if (run.length >= min) {
          const bi = run[0]!;
          out.push({ blockIndex: bi, start: 0, end: (doc.blocks[bi] as TextBlock).text.length, data: { count: run.length } });
        }
        run = [];
      };
      doc.blocks.forEach((b, bi) => {
        if (b.kind === "list_item" && b.startsWithStrong) run.push(bi);
        else if (b.kind === "list_item") flush();
        else flush();
      });
      flush();
      return out;
    }
    case "sentence_length_alternation": {
      // Proporción de frases en las que la longitud cambia de signo respecto a la anterior.
      // Cerca de 1 = larga, corta, larga, corta: cadencia de plantilla, no de persona.
      const minSentences = (p.min_sentences as number | undefined) ?? 8;
      const minRate = (p.min_alternation as number | undefined) ?? 0.85;
      const minCv = (p.min_cv as number | undefined) ?? 0;
      const lens = doc.sentences
        .filter((s) => (doc.blocks[s.blockIndex] as TextBlock).kind !== "heading")
        .map((s) => (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length)
        .filter((n) => n >= 3);
      if (lens.length < minSentences) return out;
      // Un texto plano oscila ±1 palabra y alternaría al 100 % sin ser un metrónomo:
      // se exige que además las frases varíen de verdad (mismo coeficiente que ritmo-plano).
      if (minCv > 0) {
        const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
        const cv = mean === 0 ? 0 : Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length) / mean;
        if (cv < minCv) return out;
      }
      let changes = 0;
      let pairs = 0;
      for (let i = 1; i < lens.length - 1; i++) {
        const a = Math.sign((lens[i] as number) - (lens[i - 1] as number));
        const b = Math.sign((lens[i + 1] as number) - (lens[i] as number));
        if (a === 0 || b === 0) continue;
        pairs++;
        if (a !== b) changes++;
      }
      if (pairs === 0) return out;
      const rate = changes / pairs;
      if (rate >= minRate) {
        const s = doc.sentences[0]!;
        out.push({ blockIndex: s.blockIndex, start: s.start, end: s.end, data: { rate: Math.round(rate * 100), count: lens.length } });
      }
      return out;
    }
    case "paragraph_bold_lead": {
      // Párrafos que abren con negrita a modo de titular. Un hallazgo por documento, en el primero.
      const min = (p.min_count as number | undefined) ?? 2;
      const hits: number[] = [];
      doc.blocks.forEach((b, bi) => {
        if (b.kind === "paragraph" && b.startsWithStrong) hits.push(bi);
      });
      if (hits.length >= min) {
        const bi = hits[0]!;
        out.push({ blockIndex: bi, start: 0, end: (doc.blocks[bi] as TextBlock).text.length, data: { count: hits.length } });
      }
      return out;
    }
    case "list_uniform_start": {
      const min = (p.min_consecutive as number | undefined) ?? 4;
      let run: { bi: number; key: string }[] = [];
      const flush = () => {
        if (run.length >= min && !STOPWORDS.has(run[0]!.key)) {
          const bi = run[0]!.bi;
          out.push({ blockIndex: bi, start: 0, end: (doc.blocks[bi] as TextBlock).text.length, data: { count: run.length, term: run[0]!.key } });
        }
        run = [];
      };
      doc.blocks.forEach((b, bi) => {
        if (b.kind !== "list_item") return flush();
        const w = /^[\p{L}\p{M}]+/u.exec(b.text)?.[0]?.toLowerCase();
        if (!w) return flush();
        if (run.length && run[run.length - 1]!.key !== w) flush();
        run.push({ bi, key: w });
      });
      flush();
      return out;
    }
    default:
      return out;
  }
};

function sameClass(ws: string[]): boolean {
  const suf = (w: string) => {
    const l = w.toLowerCase();
    if (/(mente)$/.test(l)) return "mente";
    if (/(ción|sión|dad|tad|eza|ura|ismo|anza|encia|ancia)$/.test(l)) return "nombre";
    if (/(ar|er|ir)$/.test(l)) return "verbo";
    if (/(ndo)$/.test(l)) return "gerundio";
    if (/(oso|osa|osos|osas|ivo|iva|ivos|ivas|able|ables|ible|ibles|al|ales|ante|antes|ente|entes|ado|ada|ados|adas|ido|ida|idos|idas|ico|ica|icos|icas|dor|dora|dores|doras|ar|ares)$/.test(l)) return "adj";
    return "otro";
  };
  const s = ws.map(suf);
  if (s[0] === s[1] && s[1] === s[2] && s[0] !== "otro") return true;
  // Misma terminación vocálica de género (claro, conciso y directo).
  const last = ws.map((w) => w.toLowerCase().slice(-1));
  return ws.every((w) => w.length >= 5) && (last.every((c) => c === "o") || last.every((c) => c === "a"));
}

/* ------------------------------------------------------------------ */
/* cooccurrence: dos (o más) grupos presentes en la misma ventana.      */
/* params: { groups: string[][], window: "sentence"|"block"|"document", ordered?: boolean } */
/* ------------------------------------------------------------------ */
const cooccurrence: Detector = (rule, doc) => {
  const p = rule.params as { groups: string[][]; window: "sentence" | "block" | "document"; ordered?: boolean; anchor?: "block_start" };
  const res = p.groups.map((g) => buildTermRegExp(g));
  if (res.some((r) => r === null)) return [];
  const out: RawMatch[] = [];
  const findIn = (text: string, from: number, to: number, re: RegExp): { index: number; length: number } | null => {
    for (const m of execAll(re, text)) {
      if (m.index >= from && m.index + m.length <= to) {
        if (p.anchor === "block_start" && m.index !== from) continue;
        return m;
      }
    }
    return null;
  };
  if (p.window === "document") {
    const hits: { blockIndex: number; start: number; end: number }[] = [];
    for (const re of res as RegExp[]) {
      let h: { blockIndex: number; start: number; end: number } | null = null;
      for (let bi = 0; bi < doc.blocks.length && !h; bi++) {
        const b = doc.blocks[bi] as TextBlock;
        const m = findIn(b.text, 0, b.text.length, re);
        if (m) h = { blockIndex: bi, start: m.index, end: m.index + m.length };
      }
      if (!h) return [];
      hits.push(h);
    }
    if (p.ordered) {
      for (let i = 1; i < hits.length; i++) {
        const a = hits[i - 1]!;
        const b = hits[i]!;
        if (b.blockIndex < a.blockIndex || (b.blockIndex === a.blockIndex && b.start < a.start)) return [];
      }
    }
    const h = hits[0]!;
    return [{ blockIndex: h.blockIndex, start: h.start, end: h.end, data: { count: hits.length } }];
  }
  const windows =
    p.window === "sentence"
      ? doc.sentences.map((s) => ({ bi: s.blockIndex, from: s.start, to: s.end }))
      : doc.blocks.map((b, bi) => ({ bi, from: 0, to: b.text.length }));
  for (const w of windows) {
    const b = doc.blocks[w.bi] as TextBlock;
    let cursor = w.from;
    let first: { index: number; length: number } | null = null;
    let last = 0;
    let ok = true;
    for (const re of res as RegExp[]) {
      const m = findIn(b.text, p.ordered ? cursor : w.from, w.to, re);
      if (!m) {
        ok = false;
        break;
      }
      if (!first) first = m;
      last = Math.max(last, m.index + m.length);
      cursor = m.index + m.length;
    }
    if (ok && first) {
      if (isExcepted(rule, b.text, first.index, last)) continue;
      out.push({ blockIndex: w.bi, start: first.index, end: last, data: { term: b.text.slice(first.index, last) } });
    }
  }
  return out;
};

export const DETECTORS: Record<DetectorKind, Detector> = { regex, lexicon, sequence, density, repetition, structure, cooccurrence };
