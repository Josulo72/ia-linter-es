/**
 * Contratos públicos del linter. Todo formato JSON externo lleva `schema_version`.
 */
export const SCHEMA_VERSION = 1 as const;

export type Level = "off" | "info" | "warning" | "error";
export type RuleStatus = "draft" | "candidate" | "stable" | "deprecated";
export type RuleCategory = "lexico" | "estructura" | "repeticion" | "densidad" | "retorica" | "formato";
export type DetectorKind = "regex" | "lexicon" | "sequence" | "density" | "repetition" | "structure" | "cooccurrence";
export type RuleScope = "sentence" | "paragraph" | "document" | "block";
export type ProfileName = "general" | "tecnico" | "academico" | "marketing" | "chat" | "correo" | "readme" | "redes";
export type Register =
  | "general"
  | "tecnico"
  | "academico"
  | "marketing"
  | "literario"
  | "periodistico"
  | "institucional";

/** Posición: offset 0-based en el texto original (unidades UTF-16) y línea/columna 1-based (columna en code points). */
export interface Position {
  offset: number;
  line: number;
  column: number;
}

export interface SourceRange {
  start: Position;
  end: Position;
}

export interface RuleExample {
  text: string;
  /** Número de hallazgos esperados. */
  expect: number;
  note?: string;
}

/** Definición de regla tal y como se escribe en YAML (autoría). */
export interface RuleDefinition {
  schema_version: number;
  id: string;
  revision: number;
  status: RuleStatus;
  title: string;
  summary: string;
  category: RuleCategory;
  scope: RuleScope;
  detector: DetectorKind;
  conditions: Record<string, unknown>;
  exceptions?: Record<string, unknown>;
  default_level: Level;
  score: { weight: number; cap: number };
  message: string;
  explanation: string;
  rewrite_guidance: string;
  examples: { positive: RuleExample[]; negative: RuleExample[] };
  provenance: { evidence: string; known_false_positives: string[]; reviewed_by: string[] };
  profiles?: Partial<Record<ProfileName, Level>>;
}

/** Regla compilada: lo único que interpreta el runtime. */
export interface CompiledRule {
  id: string;
  revision: number;
  status: RuleStatus;
  title: string;
  summary: string;
  category: RuleCategory;
  scope: RuleScope;
  detector: DetectorKind;
  /** Parámetros del detector ya resueltos (léxicos expandidos, regex validadas). */
  params: Record<string, unknown>;
  exceptions: { patterns?: string[]; lexicon?: string[] };
  default_level: Level;
  score: { weight: number; cap: number };
  message: string;
  explanation: string;
  rewrite_guidance: string;
  profiles: Partial<Record<ProfileName, Level>>;
}

export interface RulePack {
  schema_version: number;
  name: string;
  version: string;
  generated_at: string;
  rules: CompiledRule[];
}

export type BlockKind = "paragraph" | "heading" | "list_item" | "blockquote" | "table_cell" | "plain";

/** Bloque de texto elegible para análisis, con su posición en el original. */
export interface TextBlock {
  kind: BlockKind;
  /** Texto del bloque sin marcado. */
  text: string;
  /** Mapa: índice en `text` -> offset en el texto original. Longitud = text.length + 1. */
  map: Int32Array;
  depth: number;
  /** El bloque empieza con texto en negrita (patrón «- **Título:** texto»). */
  startsWithStrong?: boolean;
}

export interface Sentence {
  blockIndex: number;
  /** Rango dentro de `block.text`. */
  start: number;
  end: number;
  text: string;
}

export interface Token {
  blockIndex: number;
  start: number;
  end: number;
  text: string;
  lower: string;
  /** Palabra alfabética (no número ni símbolo). */
  isWord: boolean;
}

export interface Document {
  path: string | null;
  format: "text" | "markdown";
  /** Texto original tal y como se leyó (con BOM y CRLF si los había). */
  original: string;
  lineStarts: number[];
  blocks: TextBlock[];
  sentences: Sentence[];
  tokens: Token[];
  /** Palabras elegibles (tokens alfabéticos de bloques analizados). */
  eligibleWords: number;
  /** Rangos [inicio, fin) del original ocupados por código en Markdown (bloques e inline). Las directivas de supresión escritas ahí son ejemplos, no directivas. */
  codeRanges?: [number, number][];
}

export interface Finding {
  rule: string;
  revision: number;
  level: Exclude<Level, "off">;
  category: RuleCategory;
  message: string;
  range: SourceRange;
  snippet: string;
  /** Huella estable para baseline y deduplicación. */
  fingerprint: string;
  suppressed?: { by: "inline" | "baseline"; reason?: string };
}

export interface ScoreContributor {
  rule: string;
  findings: number;
  contribution: number;
}

export interface ScoreResult {
  /** Índice de patrones editoriales 0-100. `null` si el texto no tiene suficientes palabras. */
  index: number | null;
  eligibleWords: number;
  minWords: number;
  contributors: ScoreContributor[];
}

export interface FileResult {
  path: string;
  format: "text" | "markdown";
  findings: Finding[];
  score: ScoreResult;
  durationMs: number;
  fromCache?: boolean;
}

export interface PolicyResult {
  ok: boolean;
  failOn: Level | "never";
  maxIndex: number | null;
  reasons: string[];
  counts: { error: number; warning: number; info: number; suppressed: number };
}

export interface ScanResult {
  schema_version: number;
  tool: { name: string; version: string; rulepack: string };
  files: FileResult[];
  policy: PolicyResult;
  baseline?: { path: string; matched: number; stale: number };
  durationMs: number;
}

export interface BaselineEntry {
  rule: string;
  path: string;
  fingerprint: string;
  reason?: string;
}

export interface BaselineFile {
  schema_version: number;
  created: string;
  entries: BaselineEntry[];
}

export interface PathOverride {
  files: string[];
  rules?: Record<string, Level>;
  profile?: ProfileName;
}

export interface Config {
  schema_version: number;
  profile: ProfileName;
  register: Register;
  include: string[];
  exclude: string[];
  respect_gitignore: boolean;
  rules: Record<string, Level>;
  overrides: PathOverride[];
  baseline: { path: string | null; require_reason: boolean };
  fail_on: Level | "never";
  max_index: number | null;
  privacy: { snippets: boolean };
  reporter: "terminal" | "json" | "sarif" | "revision";
  cache: { enabled: boolean; dir: string };
  min_words_for_index: number;
}
