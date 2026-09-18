import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { Ajv, type ValidateFunction } from "ajv";
import type { CompiledRule, Level, ProfileName, RuleDefinition, RulePack } from "../../contracts/index.js";
import { SCHEMA_VERSION } from "../../contracts/index.js";
import { buildDocument } from "../../document/index.js";
import { runRules } from "../runtime/index.js";
import { adversarialText, checkPattern, DEFAULT_SAFETY, type SafetyPolicy } from "./safety.js";
import { packageRoot } from "../../paths.js";

export interface CompileIssue {
  rule: string;
  severity: "error" | "warning";
  message: string;
}

export interface CompileOptions {
  rulesDir: string; // packages/linter/rules
  version: string;
  safety?: SafetyPolicy;
  /** Bytes del texto adversarial para la prueba de tiempo por regla. */
  adversarialBytes?: number;
  maxMsPerRule?: number;
  /** Requisitos mínimos de fixtures. */
  minPositive?: number;
  minNegative?: number;
  minReviewers?: number;
}

export interface CompileResult {
  pack: RulePack;
  issues: CompileIssue[];
  definitions: RuleDefinition[];
  timings: Record<string, number>;
}

const PROFILE_NAMES: ProfileName[] = ["general", "tecnico", "academico", "marketing", "chat", "correo", "readme", "redes"];

export function loadLexicons(dir: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => /\.ya?ml$/.test(x)).sort()) {
    const raw = parseYaml(fs.readFileSync(path.join(dir, f), "utf8")) as { name?: string; terms?: unknown };
    const name = raw?.name ?? f.replace(/\.ya?ml$/, "");
    if (!Array.isArray(raw?.terms)) throw new Error(`léxico ${f}: falta terms`);
    const terms = (raw.terms as unknown[]).map((t) => String(t).trim()).filter(Boolean);
    out.set(name, [...new Set(terms)]);
  }
  return out;
}

export function loadProfiles(dir: string): Map<ProfileName, Record<string, Level>> {
  const out = new Map<ProfileName, Record<string, Level>>();
  if (!fs.existsSync(dir)) return out;
  for (const name of PROFILE_NAMES) {
    const f = path.join(dir, `${name}.yml`);
    if (!fs.existsSync(f)) continue;
    const raw = parseYaml(fs.readFileSync(f, "utf8")) as { rules?: Record<string, Level> };
    out.set(name, raw?.rules ?? {});
  }
  return out;
}

export function loadDefinitions(dir: string): { defs: RuleDefinition[]; files: Map<string, string> } {
  const defs: RuleDefinition[] = [];
  const files = new Map<string, string>();
  for (const f of fs.readdirSync(dir).filter((x) => /\.ya?ml$/.test(x)).sort()) {
    const full = path.join(dir, f);
    const raw = parseYaml(fs.readFileSync(full, "utf8")) as RuleDefinition;
    defs.push(raw);
    files.set(raw?.id ?? f, full);
  }
  return { defs, files };
}

function schemaValidator(): ValidateFunction {
  const schemaPath = path.join(packageRoot(), "schemas", "rule.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(schema);
}

type Cond = Record<string, unknown>;

function resolveTerms(c: Cond, lexicons: Map<string, string[]>, where: string): string[] {
  const out: string[] = [];
  if (typeof c.lexicon === "string") {
    const l = lexicons.get(c.lexicon);
    if (!l) throw new Error(`${where}: léxico desconocido "${c.lexicon}"`);
    out.push(...l);
  }
  if (Array.isArray(c.lexicons)) {
    for (const n of c.lexicons as string[]) {
      const l = lexicons.get(n);
      if (!l) throw new Error(`${where}: léxico desconocido "${n}"`);
      out.push(...l);
    }
  }
  if (Array.isArray(c.terms)) out.push(...(c.terms as unknown[]).map(String));
  if (out.length === 0) throw new Error(`${where}: sin términos (lexicon/terms)`);
  return [...new Set(out)];
}

/** Traduce `conditions` del YAML a `params` del detector con léxicos resueltos. Devuelve también los patrones a auditar. */
export function resolveConditions(
  def: RuleDefinition,
  lexicons: Map<string, string[]>,
): { params: Record<string, unknown>; patterns: string[] } {
  const c = def.conditions as Cond;
  const patterns: string[] = [];
  const auditTerms = (terms: string[]) => {
    for (const t of terms) {
      if (t.startsWith("re:")) patterns.push(t.slice(3));
      else if (t.startsWith("raw:")) patterns.push(t.slice(4));
    }
  };
  switch (def.detector) {
    case "regex": {
      if (!Array.isArray(c.patterns) || c.patterns.length === 0) throw new Error(`${def.id}: regex requiere patterns`);
      const ps = (c.patterns as unknown[]).map(String);
      patterns.push(...ps);
      return { params: { patterns: ps, flags: c.flags ?? "giu", anchor: c.anchor, kinds: c.kinds }, patterns };
    }
    case "lexicon": {
      const terms = resolveTerms(c, lexicons, def.id);
      auditTerms(terms);
      return { params: { terms, kinds: c.kinds }, patterns };
    }
    case "sequence": {
      if (!Array.isArray(c.steps) || c.steps.length < 2) throw new Error(`${def.id}: sequence requiere al menos 2 steps`);
      const steps = (c.steps as Cond[]).map((s, i) => resolveTerms(s, lexicons, `${def.id}.steps[${i}]`));
      steps.forEach(auditTerms);
      return { params: { steps, max_gap: Number(c.max_gap ?? 8) }, patterns };
    }
    case "density": {
      const terms = resolveTerms(c, lexicons, def.id);
      auditTerms(terms);
      if (typeof c.min_count !== "number") throw new Error(`${def.id}: density requiere min_count`);
      return {
        params: {
          terms,
          window: c.window ?? "document",
          unit: c.unit ?? "match",
          min_count: c.min_count,
          per_1000: c.per_1000,
          ratio: c.ratio,
          min_words: c.min_words,
          kinds: c.kinds,
        },
        patterns,
      };
    }
    case "repetition": {
      if (!["sentence_start", "block_start", "ngram"].includes(String(c.unit))) throw new Error(`${def.id}: repetition.unit inválido`);
      return { params: { unit: c.unit, n: Number(c.n ?? 2), min_repeats: Number(c.min_repeats ?? 3), consecutive: c.consecutive }, patterns };
    }
    case "structure": {
      if (typeof c.kind !== "string") throw new Error(`${def.id}: structure requiere kind`);
      return { params: { ...c }, patterns };
    }
    case "cooccurrence": {
      if (!Array.isArray(c.groups) || c.groups.length < 2) throw new Error(`${def.id}: cooccurrence requiere al menos 2 groups`);
      const groups = (c.groups as Cond[]).map((g, i) => resolveTerms(g, lexicons, `${def.id}.groups[${i}]`));
      groups.forEach(auditTerms);
      return { params: { groups, window: c.window ?? "sentence", ordered: c.ordered ?? true, anchor: c.anchor }, patterns };
    }
  }
}

export function compileRules(opts: CompileOptions): CompileResult {
  const issues: CompileIssue[] = [];
  const safety = opts.safety ?? DEFAULT_SAFETY;
  const lexicons = loadLexicons(path.join(opts.rulesDir, "lexicons"));
  const profiles = loadProfiles(path.join(opts.rulesDir, "profiles"));
  const { defs, files } = loadDefinitions(path.join(opts.rulesDir, "definitions"));
  const validate = schemaValidator();
  const seen = new Set<string>();
  const compiled: CompiledRule[] = [];
  const timings: Record<string, number> = {};
  const minPos = opts.minPositive ?? 2;
  const minNeg = opts.minNegative ?? 2;
  const minRev = opts.minReviewers ?? 1;

  for (const def of defs) {
    const id = def?.id ?? files.keys().next().value ?? "?";
    const err = (message: string) => issues.push({ rule: id, severity: "error", message });
    // 1. Schema
    if (!validate(def)) {
      for (const e of validate.errors ?? []) err(`schema ${e.instancePath || "/"}: ${e.message}`);
      continue;
    }
    // 2. IDs
    if (seen.has(def.id)) {
      err("id duplicado");
      continue;
    }
    seen.add(def.id);
    if (!def.id.startsWith(`${def.category}/`)) err(`el id debe empezar por la categoría "${def.category}/"`);
    const expectedFile = def.id.replace("/", "--") + ".yml";
    if (path.basename(files.get(def.id) ?? "") !== expectedFile) err(`el archivo debe llamarse ${expectedFile}`);
    // 3. Léxicos y parámetros
    let params: Record<string, unknown>;
    let patterns: string[];
    try {
      ({ params, patterns } = resolveConditions(def, lexicons));
    } catch (e) {
      err((e as Error).message);
      continue;
    }
    const exceptions: CompiledRule["exceptions"] = {};
    if (def.exceptions?.patterns) {
      exceptions.patterns = (def.exceptions.patterns as string[]).map(String);
      patterns.push(...exceptions.patterns);
    }
    if (def.exceptions?.lexicon) {
      const l = lexicons.get(def.exceptions.lexicon as string);
      if (!l) err(`léxico de excepción desconocido "${def.exceptions.lexicon}"`);
      else {
        exceptions.patterns = [...(exceptions.patterns ?? []), ...l.map((t) => (t.startsWith("re:") ? t.slice(3) : escapeForRe(t)))];
      }
    }
    // 4. Seguridad de patrones
    for (const p of patterns) for (const m of checkPattern(p, safety)) err(`patrón "${p}": ${m}`);
    // Requisitos de estado
    if (def.status === "stable") {
      if (def.examples.positive.length < minPos) err(`stable requiere >= ${minPos} ejemplos positivos`);
      if (def.examples.negative.length < minNeg) err(`stable requiere >= ${minNeg} ejemplos negativos`);
      if (def.provenance.reviewed_by.length < minRev) err(`stable requiere revisión (reviewed_by)`);
      if (def.provenance.known_false_positives.length === 0) err("stable requiere falsos positivos conocidos documentados");
      if (!def.provenance.evidence.trim()) err("stable requiere evidencia");
    } else if (def.examples.positive.length + def.examples.negative.length === 0) {
      err("toda regla necesita fixtures (examples)");
    }
    const prof: Partial<Record<ProfileName, Level>> = { ...(def.profiles ?? {}) };
    for (const [pname, map] of profiles) {
      if (map[def.id] !== undefined) prof[pname] = map[def.id];
      else if (map[`${def.category}/*`] !== undefined && prof[pname] === undefined) prof[pname] = map[`${def.category}/*`];
    }
    const rule: CompiledRule = {
      id: def.id,
      revision: def.revision,
      status: def.status,
      title: def.title,
      summary: def.summary,
      category: def.category,
      scope: def.scope,
      detector: def.detector,
      params,
      exceptions,
      default_level: def.default_level,
      score: def.score,
      message: def.message,
      explanation: def.explanation,
      rewrite_guidance: def.rewrite_guidance,
      profiles: prof,
    };
    if (issues.some((i) => i.rule === id && i.severity === "error")) continue;
    // 5. Fixtures
    const fixtureIssues = runFixtures(rule, def);
    for (const m of fixtureIssues) err(m);
    // Fixtures externas opcionales: rules/fixtures/<id con -->.yml
    const fx = path.join(opts.rulesDir, "fixtures", def.id.replace("/", "--") + ".yml");
    if (fs.existsSync(fx)) {
      const raw = parseYaml(fs.readFileSync(fx, "utf8")) as RuleDefinition["examples"];
      for (const m of runFixtures(rule, { examples: raw })) err(`fixture externa: ${m}`);
    }
    // Texto adversarial: tiempo por regla
    const adv = buildDocument(adversarialText(opts.adversarialBytes ?? 200_000), { format: "text" });
    const t0 = performance.now();
    try {
      runRules(adv, [rule]);
    } catch (e) {
      err(`falla en texto adversarial: ${(e as Error).message}`);
    }
    const ms = performance.now() - t0;
    timings[def.id] = Math.round(ms);
    const budget = opts.maxMsPerRule ?? 250;
    if (ms > budget) err(`demasiado lenta en texto adversarial: ${Math.round(ms)} ms > ${budget} ms`);
    if (!issues.some((i) => i.rule === id && i.severity === "error")) compiled.push(rule);
  }
  // Los perfiles solo pueden nombrar reglas o categorías existentes.
  const allIds = new Set(defs.map((d) => d?.id));
  const allCats = new Set(defs.map((d) => `${d?.category}/*`));
  for (const [pname, map] of profiles) {
    for (const k of Object.keys(map)) {
      if (!allIds.has(k) && !allCats.has(k)) issues.push({ rule: `profiles/${pname}`, severity: "error", message: `regla o categoría desconocida "${k}"` });
    }
  }
  compiled.sort((a, b) => a.id.localeCompare(b.id, "en"));
  const pack: RulePack = {
    schema_version: SCHEMA_VERSION,
    name: "ia-linter-es/oficial",
    version: opts.version,
    generated_at: "build",
    rules: compiled,
  };
  return { pack, issues, definitions: defs, timings };
}

function escapeForRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
}

export function runFixtures(rule: CompiledRule, def: Pick<RuleDefinition, "examples">): string[] {
  const errors: string[] = [];
  const check = (kind: "positive" | "negative", ex: { text: string; expect: number; format?: "text" | "markdown"; note?: string }, i: number) => {
    const doc = buildDocument(ex.text, { format: ex.format ?? "text" });
    // Las fixtures prueban el detector: una regla desactivada por defecto (solo activa en algún perfil) se evalúa igual.
    const levels = rule.default_level === "off" ? { [rule.id]: "info" as const } : undefined;
    const found = runRules(doc, [rule], levels ? { levels } : undefined).length;
    if (kind === "positive" && ex.expect === 0) errors.push(`examples.positive[${i}] debe esperar >= 1`);
    if (kind === "negative" && ex.expect !== 0) errors.push(`examples.negative[${i}] debe esperar 0`);
    if (found !== ex.expect) errors.push(`examples.${kind}[${i}]: esperados ${ex.expect}, encontrados ${found}${ex.note ? ` (${ex.note})` : ""}`);
  };
  def.examples.positive.forEach((ex, i) => check("positive", ex, i));
  def.examples.negative.forEach((ex, i) => check("negative", ex, i));
  return errors;
}

/** Documentación de reglas en Markdown, generada del pack. */
export function renderRulesDoc(defs: RuleDefinition[], pack: RulePack): string {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const lines: string[] = ["# Reglas oficiales", "", `Rule Pack \`${pack.name}\` v${pack.version}. ${pack.rules.length} reglas compiladas.`, ""];
  lines.push("| Regla | Estado | Categoría | Detector | Nivel | Peso |", "|---|---|---|---|---|---|");
  for (const r of pack.rules) lines.push(`| \`${r.id}\` | ${r.status} | ${r.category} | ${r.detector} | ${r.default_level} | ${r.score.weight} (cap ${r.score.cap}) |`);
  lines.push("");
  for (const r of pack.rules) {
    const d = byId.get(r.id);
    lines.push(`## ${r.id}`, "", `**${r.title}** — ${r.summary}`, "", r.explanation, "", `**Cómo reescribir:** ${r.rewrite_guidance}`, "");
    if (d) {
      lines.push(`**Evidencia:** ${d.provenance.evidence}`, "");
      if (d.provenance.known_false_positives.length) {
        lines.push("**Falsos positivos conocidos:**");
        for (const fp of d.provenance.known_false_positives) lines.push(`- ${fp}`);
        lines.push("");
      }
      const ex = d.examples.positive[0];
      if (ex) lines.push("**Ejemplo:**", "", `> ${ex.text.replace(/\n/g, "\n> ")}`, "");
    }
  }
  return lines.join("\n");
}
