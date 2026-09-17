/** Normalización de texto y utilidades de posiciones. */

export interface NormalizedText {
  original: string;
  /** Texto sin BOM y con CRLF/CR convertidos a LF. */
  text: string;
  /** Offset en `text` -> offset en `original`. */
  toOriginal(offset: number): number;
  hadBom: boolean;
  hadCr: boolean;
}

/**
 * Elimina BOM y convierte CRLF/CR a LF conservando la correspondencia de offsets.
 */
export function normalizeText(original: string): NormalizedText {
  const hadBom = original.charCodeAt(0) === 0xfeff;
  const src = hadBom ? original.slice(1) : original;
  const bomShift = hadBom ? 1 : 0;
  if (!src.includes("\r")) {
    return { original, text: src, hadBom, hadCr: false, toOriginal: (o) => o + bomShift };
  }
  let out = "";
  let last = 0;
  // Posiciones (en `out`) a partir de las cuales el desplazamiento aumenta en 1.
  const shifts: number[] = [];
  for (let i = 0; i < src.length; i++) {
    if (src.charCodeAt(i) === 13) {
      out += src.slice(last, i);
      if (src.charCodeAt(i + 1) === 10) {
        // CRLF -> LF: se elimina el CR; desplazamiento +1 a partir de aquí.
        shifts.push(out.length);
      } else {
        // CR solitario -> LF: mismo tamaño.
        out += "\n";
      }
      last = i + 1;
    }
  }
  out += src.slice(last);
  const toOriginal = (o: number): number => {
    let lo = 0;
    let hi = shifts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((shifts[mid] as number) <= o) lo = mid + 1;
      else hi = mid;
    }
    return o + lo + bomShift;
  };
  return { original, text: out, hadBom, hadCr: true, toOriginal };
}

export function computeLineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

/** Línea y columna 1-based para un offset. La columna se cuenta en code points (no en unidades UTF-16). */
export function offsetToLineColumn(
  text: string,
  lineStarts: number[],
  offset: number,
): { line: number; column: number } {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((lineStarts[mid] as number) <= offset) lo = mid;
    else hi = mid - 1;
  }
  const lineStart = lineStarts[lo] as number;
  let column = 1;
  for (let i = lineStart; i < offset; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0xdc00 && c <= 0xdfff) continue; // unidad baja de par subrogado
    if (c === 13) continue; // CR de un CRLF no cuenta como columna
    column++;
  }
  return { line: lo + 1, column };
}

/** Recorta un fragmento para snippets sin partir pares subrogados. */
export function snippetOf(text: string, start: number, end: number, max = 120): string {
  let s = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (s.length > max) {
    let cut = max;
    const c = s.charCodeAt(cut - 1);
    if (c >= 0xd800 && c <= 0xdbff) cut--;
    s = s.slice(0, cut) + "…";
  }
  return s;
}
