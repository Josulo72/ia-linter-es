import type { Finding } from "../contracts/index.js";

/**
 * Supresiones inline en Markdown mediante comentarios HTML (también válidas en texto plano):
 *   <!-- ia-linter-disable -->                  desactiva todo hasta el enable
 *   <!-- ia-linter-enable -->
 *   <!-- ia-linter-disable regla1, regla2 -->   desactiva reglas concretas
 *   <!-- ia-linter-disable-next-line [reglas] --> siguiente línea
 *   <!-- ia-linter-disable-line [reglas] -->    misma línea
 *   <!-- ia-linter-disable-file [reglas] -->    todo el archivo
 * Se admite `motivo: ...` tras `--` en el mismo comentario: <!-- ia-linter-disable regla -- motivo: cita literal -->
 */
export interface SuppressionDirective {
  kind: "disable" | "enable" | "next-line" | "line" | "file";
  rules: string[] | null; // null = todas
  line: number; // 1-based, línea donde está el comentario
  offset: number;
  reason?: string;
}

const DIRECTIVE_RE = /<!--\s*ia-linter-(disable-next-line|disable-line|disable-file|disable|enable)\b([^>]*?)-->/g;

export function parseSuppressions(text: string, lineStarts: number[]): SuppressionDirective[] {
  const out: SuppressionDirective[] = [];
  const re = new RegExp(DIRECTIVE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const kindRaw = m[1] as string;
    let body = (m[2] ?? "").trim();
    let reason: string | undefined;
    const sep = body.indexOf("--");
    if (sep !== -1) {
      reason = body.slice(sep + 2).replace(/^\s*motivo\s*:\s*/i, "").trim() || undefined;
      body = body.slice(0, sep).trim();
    }
    const rules = body ? body.split(/[,\s]+/).filter(Boolean) : null;
    const kind: SuppressionDirective["kind"] =
      kindRaw === "disable-next-line" ? "next-line" : kindRaw === "disable-line" ? "line" : kindRaw === "disable-file" ? "file" : (kindRaw as "disable" | "enable");
    out.push({ kind, rules, line: lineOf(lineStarts, m.index), offset: m.index, reason });
  }
  return out;
}

function lineOf(lineStarts: number[], offset: number): number {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((lineStarts[mid] as number) <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

function ruleMatches(rules: string[] | null, id: string): boolean {
  if (rules === null) return true;
  return rules.some((r) => r === id || (r.endsWith("/*") && id.startsWith(r.slice(0, -1))));
}

/** Marca como suprimidos los hallazgos afectados por directivas. Devuelve el mismo array (mutado). */
export function applySuppressions(findings: Finding[], directives: SuppressionDirective[]): Finding[] {
  if (directives.length === 0) return findings;
  const fileRules = directives.filter((d) => d.kind === "file");
  // Rangos disable/enable ordenados por offset.
  const ranges: { from: number; to: number; rules: string[] | null; reason?: string }[] = [];
  const open: { from: number; rules: string[] | null; reason?: string }[] = [];
  for (const d of [...directives].sort((a, b) => a.offset - b.offset)) {
    if (d.kind === "disable") open.push({ from: d.offset, rules: d.rules, reason: d.reason });
    else if (d.kind === "enable") {
      for (let i = open.length - 1; i >= 0; i--) {
        const o = open[i]!;
        const closes = d.rules === null || o.rules === null || o.rules.every((r) => d.rules!.includes(r));
        if (closes) {
          ranges.push({ from: o.from, to: d.offset, rules: o.rules, reason: o.reason });
          open.splice(i, 1);
        }
      }
    }
  }
  for (const o of open) ranges.push({ from: o.from, to: Number.MAX_SAFE_INTEGER, rules: o.rules, reason: o.reason });
  const lineDirectives = directives.filter((d) => d.kind === "line" || d.kind === "next-line");
  for (const f of findings) {
    if (f.suppressed) continue;
    const fd = fileRules.find((d) => ruleMatches(d.rules, f.rule));
    if (fd) {
      f.suppressed = { by: "inline", reason: fd.reason };
      continue;
    }
    const startLine = f.range.start.line;
    const ld = lineDirectives.find((d) => ruleMatches(d.rules, f.rule) && (d.kind === "line" ? d.line === startLine : d.line + 1 === startLine));
    if (ld) {
      f.suppressed = { by: "inline", reason: ld.reason };
      continue;
    }
    const rg = ranges.find((r) => f.range.start.offset >= r.from && f.range.start.offset < r.to && ruleMatches(r.rules, f.rule));
    if (rg) f.suppressed = { by: "inline", reason: rg.reason };
  }
  return findings;
}
