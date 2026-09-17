#!/usr/bin/env node
// Compara la clase IA sin guía (development + holdout) con las dos versiones de la guía:
//   challenge/ai-g-*     guía v1 («si una frase sale larga, pártela»)
//   challenge-v2/ai-g2-* guía v2 («cambia la longitud de las frases»)
//   challenge-v3/ai-g3-* guía v3 (regla numérica: una frase de menos de 8 palabras y otra de más de 25 por párrafo)
//   challenge-v4/ai-g4-* guía v4 (el objetivo sin receta: ni plano ni metrónomo)
// Mide lo que el linter marca y, aparte, la variación de longitud de frase, que es lo que la guía v2 quiere corregir.
// Sin red. Uso: node benchmark/scripts/compare-guia.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const api = await import(pathToFileURL(path.join(root, "packages", "linter", "dist", "api", "index.js")).href);
const corpus = path.join(root, "corpus");

const read = (dir, pre) => {
  const abs = path.join(corpus, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.startsWith(pre)).sort().map((f) => ({ id: f.replace(/\.md$/, ""), text: fs.readFileSync(path.join(abs, f), "utf8") }));
};
const cv = (text) => {
  const doc = api.buildDocument(text, { format: "text" });
  const lens = doc.sentences
    .filter((s) => doc.blocks[s.blockIndex].kind !== "heading")
    .map((s) => (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length)
    .filter((n) => n >= 3);
  if (lens.length < 8) return null;
  const m = lens.reduce((a, b) => a + b, 0) / lens.length;
  return Math.sqrt(lens.reduce((a, b) => a + (b - m) ** 2, 0) / lens.length) / m;
};
const alternation = (text) => {
  const doc = api.buildDocument(text, { format: "text" });
  const lens = doc.sentences.filter((s) => doc.blocks[s.blockIndex].kind !== "heading").map((s) => (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length).filter((n) => n >= 3);
  let changes = 0, pairs = 0;
  for (let i = 1; i < lens.length - 1; i++) { const a = Math.sign(lens[i] - lens[i - 1]), b = Math.sign(lens[i + 1] - lens[i]); if (!a || !b) continue; pairs++; if (a !== b) changes++; }
  return pairs ? changes / pairs : null;
};
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

const RULES = ["estructura/ritmo-plano", "estructura/ritmo-metronomo", "retorica/no-es-x-es-y", "formato/sentencia-dos-puntos", "formato/raya", "formato/comillas-angulares", "formato/negrita-abre-parrafo", "lexico/honestidad-anunciada"];
const sets = {
  "sin guía": [...read("development", "ai-"), ...read("holdout", "ai-")],
  "guía v1": read("challenge", "ai-g-"),
  "guía v2": read("challenge-v2", "ai-g2-"),
  "guía v3 (números)": read("challenge-v3", "ai-g3-"),
  "guía v4 (objetivo)": read("challenge-v4", "ai-g4-"),
};

const rows = {};
for (const [label, docs] of Object.entries(sets)) {
  if (!docs.length) { console.log(`(${label}: sin textos)`); continue; }
  const cvs = docs.map((d) => cv(d.text)).filter((x) => x !== null);
  const marked = {};
  let indices = [];
  for (const d of docs) {
    const r = api.lintText(d.text, { path: `${d.id}.md`, config: { profile: "chat" } });
    indices.push(r.score.index ?? 0);
    for (const rule of new Set(r.findings.map((f) => f.rule))) if (RULES.includes(rule)) marked[rule] = (marked[rule] ?? 0) + 1;
  }
  const alts = docs.map((d) => alternation(d.text)).filter((x) => x !== null);
  rows[label] = { alt: median(alts), n: docs.length, cv: median(cvs), sinCv: docs.length - cvs.length, idx: median(indices), marked };
}

const labels = Object.keys(rows);
const col = (s) => String(s).padStart(16);
console.log("\n".padEnd(1) + "medida".padEnd(40) + labels.map(col).join(""));
console.log("variación de longitud de frase".padEnd(40) + labels.map((l) => col(rows[l].cv.toFixed(2))).join(""));
console.log("alternancia larga-corta (humanos: 0,67)".padEnd(40) + labels.map((l) => col(rows[l].alt.toFixed(2))).join(""));
console.log("índice mediano (perfil chat)".padEnd(40) + labels.map((l) => col(rows[l].idx)).join(""));
console.log("documentos".padEnd(40) + labels.map((l) => col(rows[l].n)).join(""));
console.log("");
for (const rule of RULES) {
  if (!labels.some((l) => rows[l].marked[rule])) continue;
  console.log(rule.padEnd(40) + labels.map((l) => col(`${rows[l].marked[rule] ?? 0}/${rows[l].n}`)).join(""));
}
console.log("\nLa variación de longitud de frase sube cuando el texto se parece más a uno humano (mediana de los mensajes de foro: 0,61).");
