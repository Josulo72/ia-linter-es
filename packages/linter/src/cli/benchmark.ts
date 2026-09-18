import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parse as parseYaml } from "yaml";
import { lintDocumentText, type RunnerContext } from "../runner/index.js";
import { buildDocument } from "../document/index.js";
import { runRules } from "../rules/runtime/index.js";

export interface CorpusSample {
  id: string;
  class: "human" | "ai";
  file: string;
  register: string;
  sha256: string;
  [k: string]: unknown;
}

interface Manifest {
  schema_version: number;
  partition: string;
  samples: CorpusSample[];
}

interface Annotations {
  /** clave: `${sampleId}|${rule}|${fingerprint}` -> correct | incorrect */
  adjudications?: Record<string, "correct" | "incorrect">;
}

export interface BenchmarkReport {
  schema_version: 1;
  partition: string;
  tool: { version: string; rulepack: string };
  config: { threshold: number; min_words_for_index: number; profile: string; register?: string; annotations?: string };
  corpus: { samples: number; human: number; ai: number; human_words: number; ai_words: number; manifest_sha256: string };
  per_rule: Record<
    string,
    {
      status: string;
      findings_human: number;
      findings_ai: number;
      docs_human: number;
      docs_ai: number;
      fp_per_1000_human_words: number;
      per_1000_ai_words: number;
      adjudicated: { correct: number; incorrect: number; precision: number | null };
      by_register: Record<string, { human: number; ai: number }>;
      ms: number;
    }
  >;
  aggregate: {
    threshold: number;
    confusion: { tp: number; fp: number; tn: number; fn: number; skipped_short: number };
    tpr: number | null;
    fpr: number | null;
    precision: number | null;
    balanced_accuracy: number | null;
    ci95: { tpr: [number, number] | null; fpr: [number, number] | null };
    index_median_human: number;
    index_median_ai: number;
    by_register: Record<string, { n_human: number; n_ai: number; median_human: number | null; median_ai: number | null }>;
  };
  notes: string[];
}

function wilson(k: number, n: number): [number, number] | null {
  if (n === 0) return null;
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [round3((c - m) / d), round3((c + m) / d)];
}
const round3 = (x: number) => Math.round(x * 1000) / 1000;
const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? (s[m] as number) : ((s[m - 1] as number) + (s[m] as number)) / 2;
};

/** Contexto con el que se evalúa un corpus: reglas a su nivel por defecto en el perfil pedido, sin overrides ni caché. Lo usa también dump-findings. */
export function benchmarkContext(ctx: RunnerContext): RunnerContext {
  return { ...ctx, config: { ...ctx.config, rules: {}, overrides: [], cache: { ...ctx.config.cache, enabled: false } } };
}

/**
 * `annotations`: archivo de adjudicaciones. Sin él se busca `benchmark/annotations/<partición>.yml` junto al corpus, que es lo que
 * reproducen los informes publicados. Ese nombre no lleva versión y lo comparten corpus distintos con la misma partición, así que
 * para adjudicar un corpus concreto hay que pasar el archivo.
 */
export function runBenchmark(ctx: RunnerContext, corpusDir: string, partition: string, opts: { register?: string; annotations?: string } = {}): BenchmarkReport {
  const manifestPath = path.join(corpusDir, "manifests", `${partition}.yml`);
  if (!fs.existsSync(manifestPath)) throw new Error(`no existe el manifiesto ${manifestPath}`);
  const manifestRaw = fs.readFileSync(manifestPath, "utf8");
  const manifest = parseYaml(manifestRaw) as Manifest;
  // Filtro por registro: un corpus con varios registros se evalúa con el perfil de cada uno por separado.
  const selected = opts.register ? manifest.samples.filter((s) => s.register === opts.register) : manifest.samples;
  if (opts.register && !selected.length) throw new Error(`el manifiesto ${partition} no tiene muestras del registro ${opts.register}`);
  const benchRoot = path.resolve(corpusDir, "..", "benchmark");
  const thrFile = path.join(benchRoot, "configs", "threshold.yml");
  const threshold = fs.existsSync(thrFile) ? Number((parseYaml(fs.readFileSync(thrFile, "utf8")) as { index_threshold: number }).index_threshold) : 20;
  if (opts.annotations && !fs.existsSync(opts.annotations)) throw new Error(`no existe el archivo de adjudicaciones ${opts.annotations}`);
  const annFile = opts.annotations ?? path.join(benchRoot, "annotations", `${partition}.yml`);
  const ann: Annotations = fs.existsSync(annFile) ? (parseYaml(fs.readFileSync(annFile, "utf8")) as Annotations) ?? {} : {};
  const usedKeys = new Set<string>();
  // El benchmark siempre se ejecuta con todas las reglas activas a su nivel por defecto y sin caché.
  const bctx = benchmarkContext(ctx);
  const perRule: BenchmarkReport["per_rule"] = {};
  for (const r of ctx.pack.rules) {
    perRule[r.id] = {
      status: r.status, findings_human: 0, findings_ai: 0, docs_human: 0, docs_ai: 0, fp_per_1000_human_words: 0,
      per_1000_ai_words: 0, adjudicated: { correct: 0, incorrect: 0, precision: null }, by_register: {}, ms: 0,
    };
  }
  let humanWords = 0;
  let aiWords = 0;
  const idx: { cls: "human" | "ai"; register: string; index: number | null }[] = [];
  const notes: string[] = [];
  for (const s of selected) {
    const abs = path.join(corpusDir, s.file);
    const text = fs.readFileSync(abs, "utf8");
    const sha = createHash("sha256").update(text).digest("hex");
    if (sha !== s.sha256) throw new Error(`hash distinto para ${s.id}: el corpus no coincide con el manifiesto`);
    const res = lintDocumentText(text, bctx, { relPath: s.file });
    const tdoc = buildDocument(text, { path: s.file });
    for (const r of ctx.pack.rules) {
      const t0 = performance.now();
      runRules(tdoc, [r]);
      (perRule[r.id] as { ms: number }).ms += performance.now() - t0;
    }
    if (s.class === "human") humanWords += res.score.eligibleWords;
    else aiWords += res.score.eligibleWords;
    idx.push({ cls: s.class, register: s.register, index: res.score.index });
    const seen = new Set<string>();
    for (const f of res.findings) {
      const pr = perRule[f.rule];
      if (!pr) continue;
      if (s.class === "human") pr.findings_human++;
      else pr.findings_ai++;
      const br = (pr.by_register[s.register] ??= { human: 0, ai: 0 });
      br[s.class]++;
      if (!seen.has(f.rule)) {
        seen.add(f.rule);
        if (s.class === "human") pr.docs_human++;
        else pr.docs_ai++;
      }
      const key = `${s.id}|${f.rule}|${f.fingerprint}`;
      const a = ann.adjudications?.[key];
      if (a) usedKeys.add(key);
      if (a === "correct") pr.adjudicated.correct++;
      else if (a === "incorrect") pr.adjudicated.incorrect++;
    }
  }
  for (const pr of Object.values(perRule)) {
    pr.ms = Math.round(pr.ms * 10) / 10;
    pr.fp_per_1000_human_words = humanWords ? round3((pr.findings_human * 1000) / humanWords) : 0;
    pr.per_1000_ai_words = aiWords ? round3((pr.findings_ai * 1000) / aiWords) : 0;
    const n = pr.adjudicated.correct + pr.adjudicated.incorrect;
    pr.adjudicated.precision = n ? round3(pr.adjudicated.correct / n) : null;
  }
  let tp = 0, fp = 0, tn = 0, fn = 0, skipped = 0;
  for (const d of idx) {
    if (d.index === null) {
      skipped++;
      continue;
    }
    const flagged = d.index >= threshold;
    if (d.cls === "ai") flagged ? tp++ : fn++;
    else flagged ? fp++ : tn++;
  }
  const tpr = tp + fn ? round3(tp / (tp + fn)) : null;
  const fpr = fp + tn ? round3(fp / (fp + tn)) : null;
  const registers = [...new Set(idx.map((d) => d.register))].sort();
  const byReg: BenchmarkReport["aggregate"]["by_register"] = {};
  for (const r of registers) {
    const h = idx.filter((d) => d.register === r && d.cls === "human" && d.index !== null).map((d) => d.index as number);
    const a = idx.filter((d) => d.register === r && d.cls === "ai" && d.index !== null).map((d) => d.index as number);
    byReg[r] = { n_human: h.length, n_ai: a.length, median_human: h.length ? median(h) : null, median_ai: a.length ? median(a) : null };
  }
  if (!ann.adjudications) notes.push("Sin adjudicaciones para esta partición: la precisión adjudicada por regla es null.");
  else if (opts.annotations) {
    // Una adjudicación que no casa con ningún hallazgo suele ser una huella vieja: el texto o la regla cambiaron después de adjudicar.
    const huerfanas = Object.keys(ann.adjudications).filter((k) => !usedKeys.has(k)).length;
    if (huerfanas) notes.push(`${huerfanas} adjudicaciones no corresponden a ningún hallazgo de esta ejecución.`);
  }
  notes.push("No se publica recall por regla: el corpus no está anotado exhaustivamente.");
  notes.push("El índice mide densidad de patrones editoriales; el umbral solo se usa para evaluar separación, no como veredicto de autoría.");
  return {
    schema_version: 1,
    partition,
    tool: { version: ctx.toolVersion, rulepack: ctx.pack.version },
    config: {
      threshold,
      min_words_for_index: bctx.config.min_words_for_index,
      profile: bctx.config.profile,
      ...(opts.register ? { register: opts.register } : {}),
      // Relativa a la carpeta que contiene el corpus, para que el informe no lleve rutas del equipo.
      ...(opts.annotations ? { annotations: path.relative(path.resolve(corpusDir, ".."), path.resolve(opts.annotations)).replace(/\\/g, "/") } : {}),
    },
    corpus: {
      samples: selected.length,
      human: selected.filter((s) => s.class === "human").length,
      ai: selected.filter((s) => s.class === "ai").length,
      human_words: humanWords,
      ai_words: aiWords,
      manifest_sha256: createHash("sha256").update(manifestRaw).digest("hex"),
    },
    per_rule: perRule,
    aggregate: {
      threshold,
      confusion: { tp, fp, tn, fn, skipped_short: skipped },
      tpr,
      fpr,
      precision: tp + fp ? round3(tp / (tp + fp)) : null,
      balanced_accuracy: tpr !== null && fpr !== null ? round3((tpr + (1 - fpr)) / 2) : null,
      ci95: { tpr: wilson(tp, tp + fn), fpr: wilson(fp, fp + tn) },
      index_median_human: median(idx.filter((d) => d.cls === "human" && d.index !== null).map((d) => d.index as number)),
      index_median_ai: median(idx.filter((d) => d.cls === "ai" && d.index !== null).map((d) => d.index as number)),
      by_register: byReg,
    },
    notes,
  };
}
