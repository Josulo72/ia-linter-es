#!/usr/bin/env node
// Descarga la clase humana del corpus desde la allowlist corpus/policy/sources.yml.
// Verifica por registro licencia, fecha y autoría; extrae 350–600 palabras en párrafos completos;
// escribe corpus/<partición>/<id>.md y los metadatos en corpus/manifests/_human.yml.
// Lo rechazado se anota (sin texto) en corpus/quarantine/human-rejected.yml con su motivo.
// Único script del proyecto que usa red. Uso: node [--use-system-ca] benchmark/scripts/fetch-human.mjs [--only id,id] [--refresh]
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const corpus = path.join(root, "corpus");
const policy = parse(fs.readFileSync(path.join(corpus, "policy", "sources.yml"), "utf8"));
const licenses = parse(fs.readFileSync(path.join(corpus, "policy", "licenses.yml"), "utf8"));
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const refresh = args.includes("--refresh");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; ia-linter-es-corpus/1.0; research corpus)" };
const { min: MIN, max: MAX } = policy.words;
const CUTOFF = policy.cutoff_date;

async function get(url) {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { headers: UA, redirect: "follow" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      if (i >= 2) throw new Error(`${url}: ${e.cause?.code ?? e.message}`);
      await new Promise((ok) => setTimeout(ok, 1500 * (i + 1)));
    }
  }
}

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  ndash: "–", mdash: "—", hellip: "…", iexcl: "¡", iquest: "¿", ordf: "ª", ordm: "º", deg: "°", euro: "€", middot: "·", times: "×", minus: "−",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", ccedil: "ç", Ccedil: "Ç", agrave: "à", egrave: "è", ograve: "ò", iuml: "ï", ouml: "ö", auml: "ä",
  acirc: "â", ecirc: "ê", ocirc: "ô", atilde: "ã", otilde: "õ", szlig: "ß", sect: "§", copy: "©", plusmn: "±", frac12: "½", micro: "µ", shy: "" };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-zA-Z0-9]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
const clean = (html) => decode(html.replace(/<sup>[\s\S]*?<\/sup>/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").replace(/ ([,.;:)»”])/g, "$1").replace(/([(«“]) /g, "$1").trim();
const words = (s) => (s.match(/\S+/g) ?? []).length;

/** Párrafos completos hasta quedar entre MIN y MAX palabras. Devuelve null si no es posible. */
function window(paragraphs) {
  const out = [];
  let n = 0;
  for (const p of paragraphs) {
    const w = words(p);
    if (n + w > MAX) {
      if (n >= MIN) break;
      if (out.length === 0) continue; // párrafo inicial desmesurado: se salta
      return null;
    }
    out.push(p);
    n += w;
    if (n >= 450) break;
  }
  return n >= MIN ? { text: out.join("\n\n") + "\n", words: n } : null;
}

const RANGOS = /^(Ley|Ley Orgánica|Real Decreto-ley|Real Decreto Legislativo|Real Decreto|Orden)$/;
async function boe(rec) {
  const url = `https://www.boe.es/diario_boe/xml.php?id=${rec.ref}`;
  const xml = await get(url);
  const tag = (t) => decode((xml.match(new RegExp(`<${t}[^>]*>([^<]*)`)) ?? [])[1] ?? "").trim();
  const f = tag("fecha_publicacion");
  const date = `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}`;
  const rango = tag("rango");
  if (!RANGOS.test(rango)) return { reject: `rango no cubierto por el art. 13 TRLPI: «${rango}»` };
  const ps = [...xml.slice(xml.lastIndexOf("<texto")).matchAll(/<p\b[^>]*\bclass="([^"]*)"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => ({ cls: m[1], text: clean(m[2]) }));
  let start = ps.findIndex((p) => /^centro/.test(p.cls) && /^(I|PREÁMBULO|EXPOSICIÓN DE MOTIVOS)$/i.test(p.text));
  if (start < 0) start = ps.findIndex((p) => /^(Sabed|A todos los que)/.test(p.text));
  if (start < 0) return { reject: "no se localiza el preámbulo" };
  const body = [];
  for (const p of ps.slice(start + 1)) {
    if (/^(articulo|titulo|capitulo|seccion)/.test(p.cls)) break;
    if (/^parrafo/.test(p.cls) && !/^(Sabed|A todos los que)/.test(p.text)) body.push(p.text);
  }
  return { url, date, title: tag("titulo"), author: tag("departamento"), body,
    evidence: "Disposición oficial publicada en el BOE antes de la fecha de corte; autoría institucional.", extraction: "primeros párrafos del preámbulo; sin encabezados" };
}

async function sinc(rec) {
  const url = `https://www.agenciasinc.es${rec.ref}`;
  const html = await get(url);
  const fuente = clean((html.match(/Fuente:\s*<strong>([^<]*)/) ?? [])[1] ?? "");
  const derechos = clean((html.match(/Derechos:\s*<strong>([^<]*)/) ?? [])[1] ?? "");
  if (fuente !== "SINC") return { reject: `fuente distinta de SINC: «${fuente}»` };
  if (!/Creative Commons/.test(derechos)) return { reject: `derechos: «${derechos}»` };
  const date = ((html.match(/"datePublished"\s*:\s*"([^"]+)/) ?? [])[1] ?? "").slice(0, 10);
  const author = decode((html.match(/"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)/) ?? [])[1] ?? "SINC");
  const title = clean((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? "");
  const region = html.slice(html.indexOf('class="lead"'), html.indexOf("bm-article_fuente_block"));
  const body = [...region.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => clean(m[1])).filter((p) => words(p) >= 8);
  return { url, date, title, author: author === "SINC" ? "Redacción SINC (FECYT)" : `${author} (SINC, FECYT)`, body,
    evidence: "Noticia de redacción propia de la agencia SINC anterior a la fecha de corte.", extraction: "entradilla y primeros párrafos; sin destacados ni pies de foto" };
}

async function redc(rec) {
  const url = `https://redc.revistas.csic.es/index.php/redc/article/view/${rec.ref}`;
  const page = await get(url);
  const meta = (n) => [...page.matchAll(new RegExp(`name="${n}" content="([^"]*)"`, "g"))].map((m) => decode(m[1]));
  if (!/creativecommons\.org\/licenses\/by\/4\.0/.test(page)) return { reject: "la página no declara CC BY 4.0" };
  if (meta("citation_language")[0] !== "es") return { reject: `idioma: ${meta("citation_language")[0]}` };
  const date = (meta("citation_date")[0] ?? "").replace(/\//g, "-");
  const galley = (page.match(new RegExp(`article/view/${rec.ref}/(\\d+)"[^>]*>\\s*HTML`)) ?? [])[1];
  if (!galley) return { reject: "sin galerada HTML" };
  const html = await get(`https://redc.revistas.csic.es/index.php/redc/article/download/${rec.ref}/${galley}?inline=1`);
  // Las citas llevan la referencia completa en un <span> emergente: se elimina para conservar solo el año.
  const flat = html.replace(/(<a\s+class="tooltip">[^<]*)<span>[\s\S]*?<\/span>\s*<\/a>/g, "$1</a>");
  const ps = [...flat.matchAll(/<(?:p|h\d)[^>]*>([\s\S]*?)<\/(?:p|h\d)>/g)].map((m) => clean(m[1]));
  const start = ps.findIndex((p) => /^(\d+\.?\s*)?INTRODUCCI[ÓO]N\b/i.test(p) && words(p) <= 6);
  if (start < 0) return { reject: "no se localiza la introducción" };
  const body = [];
  for (const p of ps.slice(start + 1)) {
    if (/^\d+\.?\s+[A-ZÁÉÍÓÚÑ ]{4,}$/.test(p)) break; // siguiente sección
    if (words(p) >= 25 && !/^(Tabla|Figura|Table|Figure|Gráfico)\b/.test(p)) body.push(p);
  }
  return { url, date, title: clean(meta("citation_title")[0] ?? ""), author: meta("citation_author").join("; "), body,
    evidence: "Artículo con autores identificados, revisado por pares y publicado en 2019.", extraction: "primeros párrafos de la introducción; sin encabezados, tablas ni figuras" };
}

async function gutenberg(rec) {
  const rdf = await get(`https://www.gutenberg.org/ebooks/${rec.ref}.rdf`);
  const lang = (rdf.match(/<rdf:value[^>]*>([a-z]{2})<\/rdf:value>/) ?? [])[1];
  if (lang !== "es") return { reject: `idioma: ${lang}` };
  if (/marcrel:trl/.test(rdf)) return { reject: "traducción: derechos del traductor sin verificar" };
  const deaths = [...rdf.matchAll(/<pgterms:deathdate[^>]*>(-?\d+)</g)].map((m) => Number(m[1]));
  if (!deaths.length || Math.max(...deaths) >= 1946) return { reject: `año de fallecimiento no verificable o posterior a 1945: ${deaths.join(",")}` };
  const author = decode((rdf.match(/<pgterms:name>([^<]+)/) ?? [])[1] ?? "");
  const title = decode((rdf.match(/<dcterms:title>([^<]+)/) ?? [])[1] ?? "").replace(/\s+/g, " ");
  const url = `https://www.gutenberg.org/cache/epub/${rec.ref}/pg${rec.ref}.txt`;
  let txt = (await get(url)).replace(/\r/g, "");
  const s = txt.search(/\*\*\* ?START OF/), e = txt.search(/\*\*\* ?END OF/);
  if (s < 0 || e < 0) return { reject: "sin marcadores de Project Gutenberg" };
  txt = txt.slice(txt.indexOf("\n", s) + 1, e);
  const ps = txt.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").replace(/_/g, "").replace(/--/g, "—").trim()).filter(Boolean);
  // Determinista: desde el 30 % de la obra, primer párrafo de prosa (>= 40 palabras, acaba en punto).
  let i = Math.floor(ps.length * 0.3);
  while (i < ps.length && !(words(ps[i]) >= 40 && /[.»”]$/.test(ps[i]))) i++;
  const body = ps.slice(i).filter((p) => !/^[^a-záéíóúñ]*$/.test(p) && !/^\[/.test(p));
  return { url, date: String(Math.max(...deaths)), date_kind: "año de fallecimiento del autor (cota superior)", title, author, body,
    evidence: "Autor fallecido antes de 1946; texto anterior a cualquier sistema generativo.", extraction: "párrafos consecutivos desde el 30 % de la obra; sin cabecera ni pie de Project Gutenberg; «--» restituido a raya y marcas de cursiva «_» eliminadas" };
}

const FETCHERS = { boe, sinc, redc, gutenberg };
const humanFile = path.join(corpus, "manifests", "_human.yml");
const rejectedFile = path.join(corpus, "quarantine", "human-rejected.yml");
const accepted = new Map((fs.existsSync(humanFile) ? parse(fs.readFileSync(humanFile, "utf8")).samples : []).map((s) => [s.id, s]));
const rejected = new Map((fs.existsSync(rejectedFile) ? parse(fs.readFileSync(rejectedFile, "utf8")).rejected : []).map((s) => [s.id, s]));
const allowIds = new Set(policy.records.map((r) => r.id));
for (const id of [...accepted.keys()]) if (!allowIds.has(id)) accepted.delete(id);
for (const id of [...rejected.keys()]) if (!allowIds.has(id)) rejected.delete(id);

for (const rec of policy.records) {
  if (only && !only.includes(rec.id)) continue;
  const rel = `${rec.partition}/${rec.id}.md`;
  const prev = accepted.get(rec.id);
  if (prev && !refresh && prev.file === rel && fs.existsSync(path.join(corpus, rel))) { console.log(`= ${rec.id} (ya descargado)`); continue; }
  let r;
  try { r = await FETCHERS[rec.source](rec); } catch (e) { r = { reject: `error de descarga: ${e.message}` }; }
  if (!r.reject && !(r.date && r.date < CUTOFF)) r = { ...r, reject: `fecha no anterior a ${CUTOFF}: «${r.date}»` };
  const license = licenses.sources[rec.source].license;
  if (!r.reject && !licenses.allowed.includes(license)) r = { ...r, reject: `licencia no admitida: ${license}` };
  const win = r.reject ? null : window(r.body);
  if (!r.reject && !win) r = { ...r, reject: `no se obtienen ${MIN}–${MAX} palabras en párrafos completos` };
  if (r.reject) {
    accepted.delete(rec.id);
    rejected.set(rec.id, { id: rec.id, source: rec.source, ref: rec.ref, level: "HX", reason: r.reject, checked: new Date().toISOString().slice(0, 10) });
    console.log(`x ${rec.id}: ${r.reject}`);
    continue;
  }
  fs.mkdirSync(path.join(corpus, rec.partition), { recursive: true });
  fs.writeFileSync(path.join(corpus, rel), win.text, "utf8");
  rejected.delete(rec.id);
  accepted.set(rec.id, {
    id: rec.id, class: "human", file: rel, register: rec.register, level: rec.level, source: rec.source, source_url: r.url, license,
    author: r.author, date: r.date, ...(r.date_kind ? { date_kind: r.date_kind } : {}), title: r.title, human_evidence: r.evidence,
    extraction: r.extraction, words: win.words, sha256: createHash("sha256").update(win.text).digest("hex"), retrieved: new Date().toISOString().slice(0, 10),
  });
  console.log(`+ ${rec.id}: ${win.words} palabras · ${r.date} · ${r.title.slice(0, 70)}`);
}

const order = (m) => policy.records.map((r) => m.get(r.id)).filter(Boolean);
fs.mkdirSync(path.dirname(humanFile), { recursive: true });
fs.writeFileSync(humanFile, "# Generado por benchmark/scripts/fetch-human.mjs. No editar a mano.\n" + stringify({ schema_version: 1, samples: order(accepted) }, { lineWidth: 0 }), "utf8");
fs.writeFileSync(rejectedFile, "# Registros de la allowlist rechazados (HX). Generado por fetch-human.mjs; no se conserva el texto.\n" + stringify({ schema_version: 1, rejected: order(rejected) }, { lineWidth: 0 }), "utf8");
console.log(`\nAceptados: ${accepted.size} · Rechazados: ${rejected.size}`);
