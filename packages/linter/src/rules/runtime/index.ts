import { createHash } from "node:crypto";
import type { CompiledRule, Document, Finding, Level, TextBlock } from "../../contracts/index.js";
import { offsetToLineColumn, snippetOf } from "../../document/text.js";
import { DETECTORS } from "../detectors/index.js";

export interface RuntimeOptions {
  /** Nivel efectivo por regla. Las reglas ausentes usan su nivel por defecto; `off` las omite. */
  levels?: Record<string, Level>;
  /** Ruta relativa usada en la huella. */
  relPath?: string;
  /** Incluir snippets (privacidad). */
  snippets?: boolean;
}

/** Interpola {clave} en el mensaje con los datos de la coincidencia. */
export function formatMessage(template: string, data: Record<string, string | number> | undefined): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => (data && data[k] !== undefined ? String(data[k]) : `{${k}}`));
}

function redactText(data: Record<string, string | number> | undefined): Record<string, string | number> | undefined {
  if (!data) return data;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(data)) out[k] = typeof v === "string" ? "…" : v;
  return out;
}

function normalizeSnippet(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function fingerprint(rule: string, relPath: string, snippet: string, ordinal: number): string {
  return createHash("sha256")
    .update(`${rule}\0${relPath}\0${normalizeSnippet(snippet)}\0${ordinal}`)
    .digest("hex")
    .slice(0, 24);
}

/**
 * Ejecuta las reglas compiladas sobre un documento. Puro: no lee archivos, no imprime.
 * Los hallazgos se devuelven ordenados por posición y luego por id de regla.
 */
export function runRules(doc: Document, rules: CompiledRule[], opts: RuntimeOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const relPath = opts.relPath ?? doc.path ?? "<texto>";
  const withSnippets = opts.snippets !== false;
  for (const rule of rules) {
    const level = opts.levels?.[rule.id] ?? rule.default_level;
    if (level === "off" || rule.status === "deprecated") continue;
    const detector = DETECTORS[rule.detector];
    const matches = detector(rule, doc);
    for (const m of matches) {
      const block = doc.blocks[m.blockIndex] as TextBlock;
      const startOff = block.map[m.start] as number;
      const endOff = block.map[m.end] as number;
      const rawSnippet = snippetOf(doc.original, startOff, endOff);
      findings.push({
        rule: rule.id,
        revision: rule.revision,
        level,
        category: rule.category,
        // Sin snippets, el mensaje tampoco cita el texto: los datos de texto ({term}) se sustituyen; los números se quedan.
        message: formatMessage(rule.message, withSnippets ? m.data : redactText(m.data)),
        range: {
          start: { offset: startOff, ...offsetToLineColumn(doc.original, doc.lineStarts, startOff) },
          end: { offset: endOff, ...offsetToLineColumn(doc.original, doc.lineStarts, endOff) },
        },
        snippet: withSnippets ? rawSnippet : "",
        fingerprint: "",
      });
      // La huella usa el snippet real aunque no se exponga.
      (findings[findings.length - 1] as Finding & { _raw?: string })._raw = rawSnippet;
    }
  }
  findings.sort(
    (a, b) => a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset || a.rule.localeCompare(b.rule, "en"),
  );
  // Ordinal por (regla, snippet) para distinguir repeticiones idénticas.
  const counters = new Map<string, number>();
  for (const f of findings) {
    const raw = (f as Finding & { _raw?: string })._raw ?? f.snippet;
    const key = `${f.rule}\0${normalizeSnippet(raw)}`;
    const n = counters.get(key) ?? 0;
    counters.set(key, n + 1);
    f.fingerprint = fingerprint(f.rule, relPath.replace(/\\/g, "/"), raw, n);
    delete (f as Finding & { _raw?: string })._raw;
  }
  return findings;
}
