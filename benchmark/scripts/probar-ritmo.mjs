#!/usr/bin/env node
// Banco de pruebas de la instrucción de ritmo de la guía.
// Prepara un lote por candidata (en el scratchpad) y, cuando los textos existen, los mide.
// Objetivo: variación de longitud de frase cerca de 0,61 y alternancia cerca de 0,67, que es lo que hacen las personas.
// Sin red. Uso:
//   node benchmark/scripts/probar-ritmo.mjs prepara <dir-lotes>   escribe un lote por candidata
//   node benchmark/scripts/probar-ritmo.mjs mide                  mide lo que haya en corpus/ritmo/<id>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const api = await import(pathToFileURL(path.join(root, "packages", "linter", "dist", "api", "index.js")).href);
const corpus = path.join(root, "corpus");
const prompts = parse(fs.readFileSync(path.join(corpus, "policy", "prompts-v1.1.yml"), "utf8"));

/** Candidatas a instrucción de ritmo. La guía actual es `objetivo`. */
export const CANDIDATAS = {
  combinada: `- Ritmo. Suéltate por los dos lados. Cuando algo se dice en tres o cuatro palabras, déjalo en tres o cuatro, y pon dos o tres de esas seguidas; que casi una de cada tres frases baje de 10 palabras. Y de vez en cuando, no en todos los textos, deja que una frase siga y pase de 40 sin cortarla. El resto, como salga. Lo que no vale es que todas midan parecido ni ir alternando larga y corta.`,
  suave: `- Ritmo. Que casi una de cada tres frases baje de 10 palabras, con dos o tres cortas seguidas alguna vez. Y en dos de cada tres textos, que se te vaya una frase de entre 40 y 60 palabras. Ni todas parecidas ni alternando larga y corta.`,
  ya_reales: `- Ritmo. Estas son las longitudes de frase de mensajes de foro reales, en palabras: 3, 13, 75, 7, 38, 6, 7, 3, 4, 3, 30, 17. Y otro: 18, 21, 23, 111. Tres de cada diez frases bajan de 10 palabras y una de cada diez pasa de 40. Escribe con ese reparto: rachas de frases muy cortas seguidas y alguna larguísima, sin alternar.`,
  ya_extremos: `- Ritmo. Que en cada texto haya por lo menos una frase que pase de 40 palabras y una racha de dos o tres seguidas de menos de 6. El resto, como salga. No alternes larga y corta.`,
  ya_soltar: `- Ritmo. No te cortes: si una frase te pide seguir, sigue aunque pase de 40 palabras, y si algo se dice en tres palabras, déjalo en tres. Lo que no vale es que todas midan parecido ni que vayan alternando larga y corta.`,
  objetivo: `- El ritmo es lo que más se nota, y falla por los dos lados. Si todas las frases te salen del mismo largo suena a máquina, aunque las palabras estén bien. Pero ir alternando una larga y una corta todo el rato suena todavía peor, a metrónomo. Lo natural es irregular: a veces dos largas seguidas, luego tres cortas, luego una media. Escribe lo que quieras decir y verás como sale solo.`,
  ya_rango: `- Ritmo. En cada párrafo, la frase más corta baja de 10 palabras y la más larga pasa de 25. No las alternes: pon dos o tres cortas seguidas y luego una larga.`,
  ya_recuento: `- Ritmo. Al terminar, cuenta las palabras de cada frase. Si ninguna baja de 10, o si ninguna pasa de 25, reescribe. Si te sale largo, corto, largo, corto, junta dos cortas en una.`,
  ya_ejemploViejo: `- Ritmo. Un mensaje de foro real tiene frases de estas longitudes: 26, 21, 14, 9, 17, 5, 4, 21. Fíjate en que no hay patrón y en que dos seguidas pueden parecerse. Escribe así: sin buscar equilibrio y sin alternar largo y corto.`,
};

const lens = (text) => {
  const doc = api.buildDocument(text, { format: "text" });
  return doc.sentences
    .filter((s) => doc.blocks[s.blockIndex].kind !== "heading")
    .map((s) => (s.text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length)
    .filter((n) => n >= 3);
};
const cv = (l) => {
  if (l.length < 8) return null;
  const m = l.reduce((a, b) => a + b, 0) / l.length;
  return Math.sqrt(l.reduce((a, b) => a + (b - m) ** 2, 0) / l.length) / m;
};
const alternancia = (l) => {
  let changes = 0, pairs = 0;
  for (let i = 1; i < l.length - 1; i++) {
    const a = Math.sign(l[i] - l[i - 1]), b = Math.sign(l[i + 1] - l[i]);
    if (!a || !b) continue;
    pairs++;
    if (a !== b) changes++;
  }
  return pairs ? changes / pairs : null;
};
const median = (a) => { const s = a.filter((x) => x !== null).sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

const [modo, arg] = process.argv.slice(2);

if (modo === "prepara") {
  if (!arg) throw new Error("falta el directorio de lotes");
  const guiaBase = fs.readFileSync(path.join(root, prompts.guide), "utf8").replace(/^---[\s\S]*?---\s*/, "").replace(/<!-- ia-linter-[^>]*-->\n?/g, "");
  const actual = CANDIDATAS.objetivo;
  if (!guiaBase.includes(actual)) throw new Error("la guía ya no contiene la instrucción de ritmo actual: revisa CANDIDATAS.objetivo");
  fs.mkdirSync(arg, { recursive: true });
  // Mismos 8 encargos para todas las candidatas: solo cambia la instrucción de ritmo.
  const items = prompts.prompts.filter((p) => p.model === "claude-sonnet-5").slice(0, 8);
  for (const [id, instruccion] of Object.entries(CANDIDATAS)) {
    if (id === "objetivo" || id.startsWith("ya_")) continue; // ya medidas
    const guia = guiaBase.replace(actual, instruccion);
    let s = `Tienes ${items.length} encargos independientes. Para cada uno, escribe el texto que se pide y guárdalo con la herramienta Write en la ruta indicada: solo el texto, sin título, sin comentarios y sin comillas alrededor. Escribe cada archivo en cuanto lo tengas y pasa al siguiente; no repases lo ya guardado. No leas ningún otro archivo. Cuando estén los ocho, responde únicamente: hecho.\n\nAntes de escribir, lee esta guía de estilo y aplícala a todos los textos:\n\n<guia>\n${guia}\n</guia>\n\n`;
    items.forEach((p, i) => {
      s += `Encargo ${i + 1}\nRuta: ${path.join(corpus, "ritmo", id, `${p.id}.md`)}\n${prompts.template.replace("{tema}", p.tema)}\n\n`;
    });
    fs.mkdirSync(path.join(corpus, "ritmo", id), { recursive: true });
    fs.writeFileSync(path.join(arg, `ritmo-${id}.md`), s, "utf8");
    console.log(`${arg}/ritmo-${id}.md (${items.length} encargos)`);
  }
} else {
  const ref = { humano: [], sinGuia: [] };
  for (const dir of ["development", "holdout"]) {
    for (const f of fs.readdirSync(path.join(corpus, dir))) {
      const t = fs.readFileSync(path.join(corpus, dir, f), "utf8");
      if (f.startsWith("h-")) ref.humano.push(t);
      else if (f.startsWith("ai-")) ref.sinGuia.push(t);
    }
  }
  const sets = { "humano (objetivo)": ref.humano, "IA sin guía": ref.sinGuia, "guía actual": fs.existsSync(path.join(corpus, "challenge-v4")) ? fs.readdirSync(path.join(corpus, "challenge-v4")).map((f) => fs.readFileSync(path.join(corpus, "challenge-v4", f), "utf8")) : [] };
  const ritmoDir = path.join(corpus, "ritmo");
  if (fs.existsSync(ritmoDir)) for (const id of fs.readdirSync(ritmoDir)) {
    const files = fs.readdirSync(path.join(ritmoDir, id));
    if (files.length) sets[`candidata: ${id}`] = files.map((f) => fs.readFileSync(path.join(ritmoDir, id, f), "utf8"));
  }
  console.log("conjunto".padEnd(22) + "n".padStart(4) + "variación".padStart(12) + "alternancia".padStart(13) + "   distancia al humano");
  const H = { cv: 0.61, alt: 0.67 };
  for (const [label, docs] of Object.entries(sets)) {
    if (!docs.length) continue;
    const L = docs.map(lens);
    const c = median(L.map(cv)), a = median(L.map(alternancia));
    const d = Math.abs(c - H.cv) + Math.abs(a - H.alt);
    console.log(label.padEnd(22) + String(docs.length).padStart(4) + c.toFixed(2).padStart(12) + a.toFixed(2).padStart(13) + `   ${d.toFixed(2)}${label.startsWith("humano") ? "" : d < 0.12 ? "  ✔" : ""}`);
  }
  console.log("\nGana la distancia más pequeña. El humano marca 0,61 de variación y 0,67 de alternancia.");
}
