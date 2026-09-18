#!/usr/bin/env node
// Construye corpus-v1.3/manifests/{development,holdout,challenge}.yml del corpus v1.3 (registros correo, readme y redes).
// - Clase humana: la de v1.2, reutilizada con la misma partición (development con development, holdout con holdout).
//   Cada muestra lo dice en `reused_from`. Los textos no se redistribuyen: se copian en local desde corpus-v1.2 si están
//   descargados en este equipo (corpus-v1.3/<partición>/h-*.md, ignorados por git).
// - Clase IA: GPT-5.6 Sol (D3), base en development y holdout, guiada en challenge, según corpus/policy/prompts-v1.3.yml.
//   Los textos que aún no se han generado quedan en `pendientes`, con su encargo, hasta que se importan.
// - Deduplica (hash exacto y solapamiento de 8-gramas) entre todo lo que haya.
// - Holdout en dos fases (benchmark/configs/holdout-v1.3.lock):
//     preregistro: antes de generar nada se fija qué muestras humanas y qué encargos componen el holdout;
//     congelado:   cuando no queda ningún pendiente, se añade el hash del manifiesto. Desde ahí no puede cambiar.
// Sin red. Salida determinista: los manifiestos no llevan marcas de tiempo de ejecución.
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";
import { CORPUS, PARTITIONS, REGISTROS, composicionHoldout, idMuestra, leerPrompts, particion, root, sha, words } from "./corpus-v1.3-comun.mjs";

const V12 = path.join(root, "corpus-v1.2");
const LOCK = path.join(root, "benchmark", "configs", "holdout-v1.3.lock");
const die = (m) => {
  console.error(`ERROR: ${m}`);
  process.exit(1);
};

const prompts = leerPrompts();
const genFile = path.join(CORPUS, "manifests", "_ai_generacion.yml");
const gen = fs.existsSync(genFile) ? parse(fs.readFileSync(genFile, "utf8")).samples ?? {} : {};
const samples = Object.fromEntries(PARTITIONS.map((p) => [p, []]));
const pendientes = Object.fromEntries(PARTITIONS.map((p) => [p, []]));
for (const p of PARTITIONS) fs.mkdirSync(path.join(CORPUS, p), { recursive: true });
fs.mkdirSync(path.join(CORPUS, "manifests"), { recursive: true });

// ---- Clase humana: reutilizada de v1.2.
let copiados = 0;
for (const part of ["development", "holdout"]) {
  const m12 = parse(fs.readFileSync(path.join(V12, "manifests", `${part}.yml`), "utf8"));
  for (const h of m12.samples.filter((s) => s.class === "human")) {
    const origen = path.join(V12, h.file);
    const destino = path.join(CORPUS, h.file);
    if (fs.existsSync(origen) && !fs.existsSync(destino)) {
      const t = fs.readFileSync(origen, "utf8");
      if (sha(t) !== h.sha256) die(`${h.id}: el texto local de v1.2 no coincide con su hash`);
      fs.writeFileSync(destino, t, "utf8");
      copiados++;
    }
    samples[part].push({
      ...h,
      reused_from: `corpus-v1.2/${h.file}`,
      reuse_note:
        part === "holdout"
          ? "Reutilizado de holdout v1.2, que ya se ejecutó: la parte humana de holdout v1.3 no es independiente; solo la clase IA es nueva."
          : "Reutilizado de development v1.2, que se usó para ajustar reglas (D1, B9).",
    });
  }
}

// ---- Clase IA: GPT-5.6 Sol, lo generado y lo pendiente.
for (const p of prompts.prompts) {
  for (const cond of ["base", "guiada"]) {
    const id = idMuestra(p, cond);
    const part = particion(p, cond);
    const rel = `${part}/${id}.md`;
    const abs = path.join(CORPUS, rel);
    const base = { id, class: "ai", file: rel, register: p.register, theme: p.theme, prompt_id: p.id, condition: cond, origin_partition: p.partition };
    if (!fs.existsSync(abs)) {
      if (gen[id]) die(`${id}: está en _ai_generacion.yml pero falta ${rel}`);
      pendientes[part].push(base);
      continue;
    }
    const g = gen[id];
    if (!g) die(`${id}: hay texto en ${rel} pero no está en _ai_generacion.yml; se importa con generacion-v1.3.mjs importar`);
    const text = fs.readFileSync(abs, "utf8");
    if (text.includes("\r")) die(`${rel}: finales de línea CRLF`);
    samples[part].push({
      ...base,
      provider: prompts.provider,
      model: prompts.model,
      interface: prompts.interface,
      lote: g.lote,
      generated: g.generated,
      system_prompt: prompts.system_prompt,
      parameters: prompts.parameters,
      ...(cond === "guiada" ? { guide_sha256: prompts.guide_sha256 } : {}),
      edits: g.edits,
      words: words(text),
      sha256: sha(text),
    });
  }
}

// ---- Duplicados entre todo lo que hay en disco.
const all = PARTITIONS.flatMap((p) => samples[p]).filter((s) => fs.existsSync(path.join(CORPUS, s.file)));
const shingles = new Map();
const ids = new Set();
const hashes = new Map();
for (const s of all) {
  const text = fs.readFileSync(path.join(CORPUS, s.file), "utf8");
  if (sha(text) !== s.sha256) die(`${s.id}: el archivo no coincide con el hash registrado`);
  if (ids.has(s.id)) die(`id duplicado: ${s.id}`);
  ids.add(s.id);
  if (hashes.has(s.sha256)) die(`texto duplicado: ${s.id} = ${hashes.get(s.sha256)}`);
  hashes.set(s.sha256, s.id);
  const toks = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const set = new Set();
  for (let i = 0; i + 8 <= toks.length; i++) set.add(toks.slice(i, i + 8).join(" "));
  shingles.set(s.id, set);
}
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = shingles.get(all[i].id);
    const b = shingles.get(all[j].id);
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    const overlap = inter / Math.max(1, Math.min(a.size, b.size));
    if (overlap > 0.2) die(`casi duplicados (${(overlap * 100).toFixed(0)} % de 8-gramas): ${all[i].id} y ${all[j].id}`);
  }
}

// ---- Manifiestos.
for (const p of PARTITIONS) {
  const doc = { schema_version: 1, corpus_version: "1.3", partition: p, samples: samples[p], ...(pendientes[p].length ? { pendientes: pendientes[p] } : {}) };
  fs.writeFileSync(path.join(CORPUS, "manifests", `${p}.yml`), `# Generado por benchmark/scripts/build-manifests-v1.3.mjs. No editar a mano.\n${stringify(doc, { lineWidth: 0 })}`, "utf8");
  const h = samples[p].filter((s) => s.class === "human").length;
  const porReg = REGISTROS.map((r) => `${r} ${samples[p].filter((s) => s.register === r).length}`).join(", ");
  console.log(`${p}: ${samples[p].length} muestras (${h} humanas, ${samples[p].length - h} IA)${pendientes[p].length ? `, ${pendientes[p].length} IA pendientes` : ""} · ${porReg}`);
}
if (copiados) console.log(`${copiados} textos humanos copiados en local desde corpus-v1.2`);

// ---- Holdout: preregistro y congelación.
const holdoutRaw = fs.readFileSync(path.join(CORPUS, "manifests", "holdout.yml"), "utf8");
const composicion = composicionHoldout(parse(holdoutRaw), prompts);
const hoy = new Date().toISOString().slice(0, 10);
const completo = pendientes.holdout.length === 0;
if (!fs.existsSync(LOCK)) {
  fs.writeFileSync(
    LOCK,
    stringify({
      schema_version: 1,
      manifest: "corpus-v1.3/manifests/holdout.yml",
      estado: "preregistro",
      composicion_sha256: composicion,
      preregistrado: hoy,
      samples: samples.holdout.length + pendientes.holdout.length,
      nota: "Composición fijada antes de generar la clase IA. Se completa con manifest_sha256 cuando no quede ningún texto pendiente. El holdout no se ejecuta hasta que haya una versión de reglas cerrada.",
    }),
    "utf8",
  );
  console.log(`holdout preregistrado: ${composicion}`);
} else {
  const lock = parse(fs.readFileSync(LOCK, "utf8"));
  if (lock.composicion_sha256 !== composicion) die("la composición del holdout ha cambiado desde el preregistro (benchmark/configs/holdout-v1.3.lock)");
  if (lock.estado === "congelado") {
    if (lock.manifest_sha256 !== sha(holdoutRaw)) die("el manifiesto de holdout ha cambiado tras su congelación (benchmark/configs/holdout-v1.3.lock)");
    console.log("holdout: coincide con holdout-v1.3.lock");
  } else if (completo) {
    fs.writeFileSync(LOCK, stringify({ ...lock, estado: "congelado", manifest_sha256: sha(holdoutRaw), congelado: hoy }), "utf8");
    console.log(`holdout congelado: ${sha(holdoutRaw)}`);
  } else {
    console.log(`holdout: preregistrado el ${lock.preregistrado}; faltan ${pendientes.holdout.length} textos IA para congelarlo`);
  }
}
