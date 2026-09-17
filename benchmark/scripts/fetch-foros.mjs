#!/usr/bin/env node
// Clase humana cotidiana (v1.1): mensajes de foros públicos en español anteriores a la fecha de corte.
// Los textos NO se redistribuyen: se guardan solo en local (corpus/<partición>/h-foro-*.md, ignorados por git).
// En el repositorio queda corpus/manifests/_human_cotidiano.yml con URL, fecha, foro, palabras y sha256.
// Selección determinista: recorrido fijo de identificadores o páginas, un mensaje por hilo, el primero que cumple.
// Uso: node [--use-system-ca] benchmark/scripts/fetch-foros.mjs [--per-forum 12]
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const corpus = path.join(root, "corpus");
const CUTOFF = parse(fs.readFileSync(path.join(corpus, "policy", "sources.yml"), "utf8")).cutoff_date;
const args = process.argv.slice(2);
const PER = args.includes("--per-forum") ? Number(args[args.indexOf("--per-forum") + 1]) : 12;
const MIN = 150, MAX = 400;
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36", "Accept-Language": "es-ES,es" };

async function get(url, enc = "utf-8") {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!r.ok) return null;
      return { url: r.url, html: new TextDecoder(enc).decode(await r.arrayBuffer()) };
    } catch { await new Promise((ok) => setTimeout(ok, 1500)); }
  }
  return null;
}
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", iexcl: "¡", iquest: "¿", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", euro: "€", ordm: "º", ordf: "ª", hellip: "…", laquo: "«", raquo: "»" };
const decode = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-zA-Z]+);/g, (m, n) => NAMED[n] ?? " ");
function toText(html) {
  return decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, ""))
    .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
const words = (s) => (s.match(/\S+/g) ?? []).length;
/** Prosa de una persona: longitud, sin citas ni código, sin listas de enlaces, con varias frases. */
function acceptable(html, text) {
  if (/<(div|blockquote|table|pre|code|iframe)\b/i.test(html)) return false;
  const w = words(text);
  if (w < MIN || w > MAX) return false;
  if ((text.match(/https?:\/\//g) ?? []).length > 1) return false;
  if ((text.match(/[.!?](\s|$)/g) ?? []).length < 4) return false;
  if (/\b(Cita de|Cita:|Iniciado por|escribió:)/.test(text)) return false;
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  return letters / text.length > 0.7;
}
const MES = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12 };
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const FOROS = {
  // ForoCoches se probó y se descartó: sus mensajes rara vez llegan a 150 palabras y muchos hilos antiguos no son accesibles.
  mediavida: {
    name: "Mediavida", theme: "general",
    async *threads() {
      for (let p = 300; p <= 1700; p += 70) {
        const l = await get(`https://www.mediavida.com/foro/off-topic/p${p}`);
        if (!l) continue;
        for (const h of [...new Set([...l.html.matchAll(/href="(\/foro\/off-topic\/[a-z0-9-]+-\d+)"/g)].map((m) => m[1]))].slice(0, 12)) yield `https://www.mediavida.com${h}`;
      }
    },
    parse(html) {
      const times = [...html.matchAll(/data-time="(\d+)"/g)].map((m) => new Date(Number(m[1]) * 1000).toISOString().slice(0, 10));
      const posts = [...html.matchAll(/id="post-(\d+)"[\s\S]*?class="post-contents"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => ({ anchor: `#${m[1]}`, html: m[2] }));
      return { date: times.sort().at(-1), posts };
    },
  },
  elhacker: {
    name: "Foro de elhacker.net", theme: "informatica", enc: "latin1",
    async *threads() { for (let id = 250007; id < 500000; id += 1117) yield `https://foro.elhacker.net/index.php?topic=${id}.0`; },
    parse(html) {
      const M = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
      const dates = [...html.matchAll(/en:<\/b>\s*(\d{1,2}) (\p{L}+) (\d{4})/giu)].map((m) => iso(m[3], M[m[2].toLowerCase()] ?? 0, m[1])).filter((d) => !d.includes("-00-"));
      const posts = [...html.matchAll(/#msg(\d+)"[\s\S]*?<div class="post"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => ({ anchor: `#msg${m[1]}`, html: m[2] }));
      return { date: dates.sort().at(-1), posts };
    },
  },
  infojardin: {
    name: "Foro de Infojardín", theme: "aficiones",
    async *threads() {
      const home = await get("https://foro.infojardin.com/");
      const secs = [...new Set([...(home?.html ?? "").matchAll(/href="\/?(forums\/[^"]+\.\d+\/)"/g)].map((m) => m[1]))].slice(0, 14);
      for (const s of secs) for (const p of [3, 9]) {
        const l = await get(`https://foro.infojardin.com/${s}page-${p}`);
        if (!l) continue;
        for (const h of [...new Set([...l.html.matchAll(/href="\/?(threads\/[^"]+\.\d+\/)"/g)].map((m) => m[1]))].slice(2, 8)) yield `https://foro.infojardin.com/${h}`;
      }
    },
    parse(html) {
      const dates = [...html.matchAll(/class="DateTime"[^>]*>(\d{1,2})\/(\d{1,2})\/(\d{2})</g)].map((m) => iso(`20${m[3]}`, m[2], m[1]));
      const posts = [...html.matchAll(/<li id="post-(\d+)"[\s\S]*?<blockquote class="messageText[^"]*">([\s\S]*?)<\/blockquote>/g)].map((m) => ({ anchor: `post-${m[1]}`, html: m[2] }));
      return { date: dates.sort().at(-1), posts };
    },
  },
};

// --from-manifest: rehace los textos del manifiesto existente, sin volver a descubrir hilos.
// Es la forma de reproducir el corpus en otro equipo: el descubrimiento depende de listados que cambian.
if (args.includes("--from-manifest")) {
  const mf = path.join(corpus, "manifests", "_human_cotidiano.yml");
  const samples = parse(fs.readFileSync(mf, "utf8")).samples;
  let ok = 0;
  for (const s of samples) {
    const key = String(s.source).replace("foro:", "");
    const foro = FOROS[key];
    if (!foro) { console.log(`x ${s.id}: foro desconocido (${s.source})`); continue; }
    const [base, anchor] = s.source_url.split("#");
    const page = await get(base, foro.enc);
    if (!page) { console.log(`x ${s.id}: no se pudo descargar`); continue; }
    // Se busca por ancla; si el marcado ha cambiado de sitio, vale cualquier mensaje de la página cuyo hash coincida.
    const posts = foro.parse(page.html).posts;
    const byAnchor = posts.filter((p) => p.anchor.replace(/^#/, "") === (anchor ?? ""));
    const text = [...byAnchor, ...posts].map((p) => toText(p.html)).find((t) => createHash("sha256").update(t).digest("hex") === s.sha256);
    if (!text) { console.log(`x ${s.id}: el mensaje ya no está o ha cambiado desde la descarga original`); continue; }
    fs.mkdirSync(path.dirname(path.join(corpus, s.file)), { recursive: true });
    fs.writeFileSync(path.join(corpus, s.file), text, "utf8");
    ok++;
    console.log(`+ ${s.id} · ${s.date} · ${s.words} palabras`);
  }
  console.log(`\nRecuperados ${ok} de ${samples.length}. El manifiesto no se toca.`);
  process.exit(ok === samples.length ? 0 : 1);
}

const out = [];
const seenUrls = new Set();
for (const [key, foro] of Object.entries(FOROS)) {
  let n = 0, seen = 0;
  for await (const url of foro.threads()) {
    if (n >= PER || seen++ > 600) break;
    const page = await get(url, foro.enc);
    if (!page || /\/noticias\//.test(page.url)) continue; // noticias copiadas de prensa: no son escritura personal
    const { date, posts } = foro.parse(page.html);
    if (!date || !(date < CUTOFF)) continue; // la fecha más reciente de la página debe ser anterior al corte
    const hit = posts.map((p) => ({ ...p, text: toText(p.html) })).find((p) => acceptable(p.html, p.text));
    if (!hit || seenUrls.has(page.url)) continue;
    seenUrls.add(page.url);
    n++;
    out.push({ foro: key, name: foro.name, theme: foro.theme, url: page.url.split("#")[0] + (hit.anchor.startsWith("#") ? hit.anchor : `#${hit.anchor}`), date, text: hit.text });
    console.log(`+ ${key} ${n}/${PER} · ${date} · ${words(hit.text)} palabras · ${page.url.slice(0, 80)}`);
  }
  if (n < PER) console.log(`! ${key}: solo ${n} de ${PER}`);
}

// Reparto determinista: por foro, alternando development y holdout.
const samples = [];
const counters = {};
for (const s of out) {
  const k = (counters[s.foro] = (counters[s.foro] ?? 0) + 1);
  const partition = k % 2 === 1 ? "development" : "holdout";
  const id = `h-foro-${s.foro.slice(0, 2)}${String(k).padStart(2, "0")}`;
  const rel = `${partition}/${id}.md`;
  fs.mkdirSync(path.join(corpus, partition), { recursive: true });
  fs.writeFileSync(path.join(corpus, rel), s.text, "utf8");
  samples.push({ id, class: "human", file: rel, register: "cotidiano", level: "H2", source: `foro:${s.foro}`, source_url: s.url, storage: "local",
    license: "sin redistribución (solo análisis; RDL 24/2021, art. 67)", author: `participante de ${s.name} (seudónimo no registrado)`, date: s.date,
    human_evidence: "Mensaje de foro público anterior a la fecha de corte.", extraction: "mensaje completo, sin citas; ortografía original", theme: s.theme,
    words: words(s.text), sha256: createHash("sha256").update(s.text).digest("hex"), retrieved: new Date().toISOString().slice(0, 10) });
}
fs.writeFileSync(path.join(corpus, "manifests", "_human_cotidiano.yml"),
  "# Generado por benchmark/scripts/fetch-foros.mjs. Los textos están solo en local; aquí quedan URL, fecha y hash.\n" + stringify({ schema_version: 1, samples }, { lineWidth: 0 }), "utf8");
console.log(`\nTotal: ${samples.length}`);
