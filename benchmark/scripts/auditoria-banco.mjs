#!/usr/bin/env node
// Auditoría del banco de pruebas: qué se ha ejercitado de verdad y qué sostiene la separación.
// Responde a tres preguntas que el informe agregado no contesta:
//   1. ¿Cuántas reglas han disparado alguna vez en el corpus? ¿Y las stable?
//   2. Si se quitan las reglas de ritmo, ¿cuánta separación queda?
//   3. ¿Y si solo se cuentan las reglas stable?
// Analiza en Markdown y con el perfil `chat`, igual que `benchmark run`.
// Sin red. Uso: node benchmark/scripts/auditoria-banco.mjs [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const api = await import(pathToFileURL(path.join(root, "packages", "linter", "dist", "api", "index.js")).href);
const corpus = path.join(root, "corpus");
const K = 40; // SCORE_K: la escala del índice, en src/scoring/index.ts

const read = (f) => parse(fs.readFileSync(path.join(corpus, "manifests", f), "utf8")).samples;
const partes = { development: read("development.yml"), holdout: read("holdout.yml"), challenge: read("challenge.yml") };
const pack = api.loadRulePack();
const stable = new Set(pack.rules.filter((r) => r.status === "stable").map((r) => r.id));

/** Recalcula el índice con la fórmula real dejando fuera las reglas que diga `fuera`. */
const indiceSin = (score, fuera) => {
  const sum = score.contributors.filter((c) => !fuera(c.rule)).reduce((a, c) => a + c.contribution, 0);
  const raw = score.eligibleWords > 0 ? (1000 * sum) / score.eligibleWords : 0;
  return Math.round((100 * raw) / (raw + K));
};

const disparadas = new Set();
const focos = { todo: { human: [], ai: [] }, sinRitmo: { human: [], ai: [] }, soloStable: { human: [], ai: [] } };
let textos = 0;
let cortos = 0;
let faltan = 0;

for (const [parte, samples] of Object.entries(partes)) {
  for (const s of samples) {
    const p = path.join(corpus, s.file);
    if (!fs.existsSync(p)) { faltan++; continue; }
    textos++;
    const r = api.lintText(fs.readFileSync(p, "utf8"), { profile: "chat", format: "markdown" });
    for (const f of r.findings) if (!f.suppressed) disparadas.add(f.rule);
    if (parte !== "holdout") continue;
    if (r.score.index === null) { cortos++; continue; }
    focos.todo[s.class].push(r.score.index);
    focos.sinRitmo[s.class].push(indiceSin(r.score, (id) => id.startsWith("estructura/ritmo")));
    focos.soloStable[s.class].push(indiceSin(r.score, (id) => !stable.has(id)));
  }
}

const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mudas = [...stable].filter((id) => !disparadas.has(id)).sort();

/** Reglas mudas en v1.1 que sí dispararon en el corpus v1.0 (prosa formal), y con cuánto. */
const enV10 = new Map(mudas.map((m) => [m, { docs_ai: 0, docs_human: 0 }]));
for (const f of ["development-v1.0.json", "holdout-v1.0.json", "challenge-v1.0.json"]) {
  const abs = path.join(root, "benchmark", "reports", f);
  if (!fs.existsSync(abs)) continue;
  const r = JSON.parse(fs.readFileSync(abs, "utf8"));
  for (const m of mudas) {
    const v = r.per_rule?.[m];
    if (!v) continue;
    const a = enV10.get(m);
    a.docs_ai += v.docs_ai;
    a.docs_human += v.docs_human;
  }
}
const sinEvidencia = mudas.filter((m) => enV10.get(m).docs_ai + enV10.get(m).docs_human === 0);
const alReves = mudas.filter((m) => { const a = enV10.get(m); return a.docs_human > a.docs_ai; });

const salida = {
  textos,
  faltan,
  cortos_en_holdout: cortos,
  reglas: pack.rules.length,
  stable: stable.size,
  disparadas: disparadas.size,
  stable_mudas: mudas,
  stable_sin_evidencia_en_ningun_corpus: sinEvidencia,
  stable_con_mas_documentos_humanos_que_ia_en_v1_0: alReves,
  medianas: Object.fromEntries(Object.entries(focos).map(([k, v]) => [k, { human: med(v.human), ai: med(v.ai), separacion: med(v.ai) - med(v.human) }])),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(salida, null, 2));
} else {
  console.log(`Corpus v1.1: ${textos} textos analizados${faltan ? `, ${faltan} sin descargar` : ""}.`);
  console.log(`Reglas del pack: ${pack.rules.length} · stable: ${stable.size} · han disparado alguna vez: ${disparadas.size}`);
  console.log(`\nReglas stable que no disparan en v1.1: ${mudas.length}`);
  for (const m of mudas) {
    const a = enV10.get(m);
    const nota = a.docs_ai + a.docs_human === 0 ? "sin evidencia tampoco en v1.0" : `v1.0: ${a.docs_ai} docs IA, ${a.docs_human} humanos${a.docs_human > a.docs_ai ? "  ← marca más a humanos" : ""}`;
    console.log(`  ${m.padEnd(42)} ${nota}`);
  }
  console.log(`\nHoldout (18 humanos, 24 IA), sin índice por texto corto: ${cortos}`);
  for (const [k, v] of Object.entries(salida.medianas)) {
    const nombre = { todo: "con todas las reglas", sinRitmo: "sin las dos de ritmo", soloStable: "solo con las stable" }[k];
    console.log(`  ${nombre.padEnd(24)} humano ${String(v.human).padStart(5)} · IA ${String(v.ai).padStart(5)} · separación ${v.separacion}`);
  }
}
