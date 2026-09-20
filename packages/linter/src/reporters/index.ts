import type { CompiledRule, Finding, ScanResult } from "../contracts/index.js";

export type ReporterName = "terminal" | "json" | "sarif" | "revision";

/* ---------------- JSON ---------------- */

/** JSON determinista: mismas claves, mismo orden, sin tiempos. */
export function reportJson(result: ScanResult, opts: { pretty?: boolean; includeTimings?: boolean } = {}): string {
  const clean: ScanResult = {
    ...result,
    durationMs: opts.includeTimings ? result.durationMs : 0,
    files: result.files.map((f) => {
      const { fromCache: _fc, ...rest } = f;
      return { ...rest, durationMs: opts.includeTimings ? f.durationMs : 0 };
    }),
  };
  return JSON.stringify(clean, null, opts.pretty === false ? undefined : 2) + "\n";
}

/* ---------------- Terminal ---------------- */

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

export function reportTerminal(result: ScanResult, opts: { color?: boolean; verbose?: boolean } = {}): string {
  const c = (code: keyof typeof COLORS, s: string) => (opts.color ? `${COLORS[code]}${s}${COLORS.reset}` : s);
  const lines: string[] = [];
  const levelTag = (f: Finding) =>
    f.level === "error" ? c("red", "error  ") : f.level === "warning" ? c("yellow", "warning") : c("cyan", "info   ");
  for (const file of result.files) {
    const active = file.findings.filter((f) => !f.suppressed);
    const suppressed = file.findings.length - active.length;
    if (active.length === 0 && !opts.verbose) continue;
    const idx = file.score.index === null ? c("dim", `índice: n/d (${file.score.eligibleWords} palabras, mínimo ${file.score.minWords})`) : `índice ${c("bold", String(file.score.index))}/100`;
    lines.push(`${c("bold", file.path)}  ${idx}${suppressed ? c("dim", `  (${suppressed} suprimidos)`) : ""}`);
    for (const f of active) {
      const pos = `${f.range.start.line}:${f.range.start.column}`;
      lines.push(`  ${pos.padEnd(8)} ${levelTag(f)} ${f.message}  ${c("dim", f.rule)}`);
      if (f.snippet && opts.verbose) lines.push(`           ${c("dim", `«${f.snippet}»`)}`);
    }
    if (file.score.contributors.length && opts.verbose) {
      lines.push(`  ${c("dim", "contribuyentes: " + file.score.contributors.slice(0, 5).map((x) => `${x.rule} (${x.findings})`).join(", "))}`);
    }
    lines.push("");
  }
  const { counts } = result.policy;
  const total = counts.error + counts.warning + counts.info;
  const summary = `${result.files.length} archivo(s), ${total} hallazgo(s): ${counts.error} error, ${counts.warning} warning, ${counts.info} info` + (counts.suppressed ? `, ${counts.suppressed} suprimido(s)` : "");
  lines.push(summary);
  if (result.baseline) lines.push(c("dim", `baseline ${result.baseline.path}: ${result.baseline.matched} coincidencias, ${result.baseline.stale} obsoletas`));
  if (result.policy.ok) lines.push(c("green", "OK") + c("dim", ` (fail_on: ${result.policy.failOn})`));
  else {
    lines.push(c("red", "FALLO"));
    for (const r of result.policy.reasons) lines.push(`  - ${r}`);
  }
  return lines.join("\n") + "\n";
}

/* ---------------- SARIF 2.1.0 ---------------- */

export function reportSarif(result: ScanResult, rules: CompiledRule[], opts: { uriBase?: string } = {}): string {
  const used = new Set(result.files.flatMap((f) => f.findings.map((x) => x.rule)));
  const ruleList = rules.filter((r) => used.has(r.id)).sort((a, b) => a.id.localeCompare(b.id, "en"));
  const ruleIndex = new Map(ruleList.map((r, i) => [r.id, i]));
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: result.tool.name,
            version: result.tool.version,
            informationUri: "https://github.com/Josulo72/textoneitor",
            rules: ruleList.map((r) => ({
              id: r.id,
              name: r.title,
              shortDescription: { text: r.summary },
              fullDescription: { text: r.explanation },
              help: { text: r.rewrite_guidance },
              defaultConfiguration: { level: sarifLevel(r.default_level) },
              properties: { category: r.category, status: r.status, revision: r.revision },
            })),
          },
        },
        originalUriBaseIds: { PROJECTROOT: { uri: opts.uriBase ?? "file:///" } },
        results: result.files.flatMap((f) =>
          f.findings.map((x) => ({
            ruleId: x.rule,
            ruleIndex: ruleIndex.get(x.rule) ?? -1,
            level: sarifLevel(x.level),
            message: { text: x.message },
            locations: [
              {
                physicalLocation: {
                  // SARIF pide una referencia URI válida: espacios, «ñ» o «<texto>» van codificados por segmento.
                  artifactLocation: { uri: f.path.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/"), uriBaseId: "PROJECTROOT" },
                  region: {
                    startLine: x.range.start.line,
                    startColumn: x.range.start.column,
                    endLine: x.range.end.line,
                    endColumn: x.range.end.column,
                    ...(x.snippet ? { snippet: { text: x.snippet } } : {}),
                  },
                },
              },
            ],
            partialFingerprints: { "textoneitor/v1": x.fingerprint },
            ...(x.suppressed ? { suppressions: [{ kind: x.suppressed.by === "inline" ? "inSource" : "external", ...(x.suppressed.reason ? { justification: x.suppressed.reason } : {}) }] } : {}),
          })),
        ),
        properties: {
          policy: result.policy,
          scores: Object.fromEntries(result.files.map((f) => [f.path, f.score.index])),
        },
      },
    ],
  };
  return JSON.stringify(sarif, null, 2) + "\n";
}

function sarifLevel(l: string): "error" | "warning" | "note" | "none" {
  return l === "error" ? "error" : l === "warning" ? "warning" : l === "info" ? "note" : "none";
}

/* ---------------- Revisión ---------------- */

/**
 * Orientación para quien vaya a reescribir el texto (el asistente, desde los hooks o /revisar). Es orientación y no una
 * lista de órdenes: quien reescribe decide qué hallazgos acepta, cuáles ignora y cómo los adapta al contexto.
 * Agrupa por regla para no repetir la orientación en cada hallazgo: qué busca la regla, la orientación (`rewrite_guidance`)
 * y dónde está cada caso. Texto plano, sin color y determinista. Sin --verbose lleva error y warning; con --verbose
 * también los info. Los suprimidos no salen nunca.
 */
export function reportRevision(result: ScanResult, rules: CompiledRule[], opts: { verbose?: boolean } = {}): string {
  const byId = new Map(rules.map((r) => [r.id, r]));
  const out: string[] = [];
  const cabecera = [
    "Orientación para revisar el texto. Cada hallazgo es una señal, no una orden: acéptalo, ignóralo o reinterprétalo según el contexto.",
    "",
  ];
  for (const file of result.files) {
    const active = file.findings.filter((f) => !f.suppressed && (opts.verbose || f.level !== "info"));
    if (!active.length) continue;
    const idx = file.score.index === null ? "sin índice (texto corto)" : `índice ${file.score.index}/100`;
    out.push(`${file.path} (${idx})`, "");
    const groups = new Map<string, Finding[]>();
    for (const f of active) {
      const g = groups.get(f.rule);
      if (g) g.push(f);
      else groups.set(f.rule, [f]);
    }
    for (const [id, fs] of groups) {
      const r = byId.get(id);
      out.push(`${id}${r ? `: ${r.title}` : ""}`);
      if (r) out.push(`  Qué busca: ${r.summary}`, `  Orientación: ${r.rewrite_guidance}`);
      // Las reglas que miden la estructura del texto entero (longitud de frase) no señalan un sitio: su «fragmento» es solo el principio.
      const wholeText = r?.scope === "document" && r.detector === "structure";
      for (const f of fs) {
        const pos = `${f.range.start.line}:${f.range.start.column}`;
        const where = wholeText ? " Afecta a todo el texto." : f.snippet ? ` Fragmento: "${f.snippet.replace(/\s+/g, " ")}"` : "";
        out.push(`  - ${wholeText ? "" : `${pos} `}${f.message}${where}`);
      }
      out.push("");
    }
  }
  if (!out.length) return "Nada que revisar.\n";
  return [...cabecera, ...out].join("\n");
}

export function render(name: ReporterName, result: ScanResult, rules: CompiledRule[], opts: { color?: boolean; verbose?: boolean; uriBase?: string } = {}): string {
  switch (name) {
    case "json":
      return reportJson(result);
    case "sarif":
      return reportSarif(result, rules, { uriBase: opts.uriBase });
    case "revision":
      return reportRevision(result, rules, { verbose: opts.verbose });
    default:
      return reportTerminal(result, { color: opts.color, verbose: opts.verbose });
  }
}
