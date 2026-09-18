#!/usr/bin/env node
// Clase IA del corpus v1.3. La genera el propietario a mano en ChatGPT con GPT-5.6 Sol (D3); aquí no se genera nada
// y no hay ninguna clave.
//
//   node benchmark/scripts/generacion-v1.3.mjs encargos
//       Escribe corpus-v1.3/ENCARGOS.md: las instrucciones y el texto exacto de los 36 lotes, listo para pegar.
//
//   node benchmark/scripts/generacion-v1.3.mjs importar <archivo o carpeta> --fecha AAAA-MM-DD [--reemplazar]
//       Lee las respuestas pegadas tal cual (cada texto precedido de su línea «=== ai-xxx ===»), escribe cada texto en
//       corpus-v1.3/<partición>/<id>.md y apunta en corpus-v1.3/manifests/_ai_generacion.yml el lote, la fecha, las
//       palabras y cualquier edición. La única edición admitida es quitar un bloque de código que envuelva el texto
//       entero; se registra. Después hay que ejecutar build-manifests-v1.3.mjs.
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";
import { CORPUS, idMuestra, leerPrompts, lotes, particion, root, textoLote, words } from "./corpus-v1.3-comun.mjs";

const args = process.argv.slice(2);
const orden = args[0];
const die = (m) => {
  console.error(`ERROR: ${m}`);
  process.exit(1);
};
const prompts = leerPrompts();
const todos = lotes(prompts);

if (orden === "encargos") encargos();
else if (orden === "importar") importar();
else die("uso: generacion-v1.3.mjs encargos | importar <archivo o carpeta> --fecha AAAA-MM-DD [--reemplazar]");

function encargos() {
  const n = (cond, reg) => todos.filter((l) => l.cond === cond && l.register === reg).reduce((a, l) => a + l.prompts.length, 0);
  const out = [
    "# Encargos del corpus v1.3 para GPT-5.6 Sol",
    "",
    "Generado por `benchmark/scripts/generacion-v1.3.mjs encargos` a partir de `corpus/policy/prompts-v1.3.yml`. No se edita a mano.",
    "",
    "## Cómo generarlos",
    "",
    "1. En ChatGPT, elige GPT-5.6 Sol y abre una conversación temporal: sin memoria y sin instrucciones personalizadas, para que no se cuele nada tuyo.",
    "2. Cada lote en una conversación nueva. Pega el bloque del lote tal cual, sin cambiar nada.",
    "3. Copia la respuesta entera, con sus líneas `=== ai-... ===`.",
    "4. Si una respuesta sale cortada o le falta algún texto, vuelve a generar ese lote entero en otra conversación nueva y quédate con la respuesta completa.",
    "",
    "## Cuántos",
    "",
    "| Registro | Base (development y holdout) | Guiada (challenge) |",
    "|---|---|---|",
    ...["correo", "readme", "redes"].map((r) => `| ${r} | ${n("base", r)} | ${n("guiada", r)} |`),
    "",
    `En total ${todos.reduce((a, l) => a + l.prompts.length, 0)} textos en ${todos.length} lotes de ${prompts.lote}.`,
    "",
    "## Cómo devolverlos",
    "",
    "Las respuestas tal cual, una detrás de otra, en uno o varios archivos de texto: cada texto precedido de su línea `=== ai-... ===` y nada más, igual que las devuelve GPT-5.6 Sol. Se importan con:",
    "",
    "```",
    "node benchmark/scripts/generacion-v1.3.mjs importar <archivo o carpeta> --fecha AAAA-MM-DD",
    "```",
    "",
    "## Lotes",
    "",
  ];
  for (const l of todos) {
    const ids = l.prompts.map((p) => idMuestra(p, l.cond));
    out.push(`### ${l.id}: ${l.register}, ${l.cond}, ${l.origin} (${ids[0]} a ${ids.at(-1)})`, "", "````text", textoLote(prompts, l).trimEnd(), "````", "");
  }
  fs.mkdirSync(CORPUS, { recursive: true });
  fs.writeFileSync(path.join(CORPUS, "ENCARGOS.md"), out.join("\n"), "utf8");
  console.log(`corpus-v1.3/ENCARGOS.md: ${todos.length} lotes`);
}

function importar() {
  const entrada = args[1];
  const i = args.indexOf("--fecha");
  const fecha = i >= 0 ? args[i + 1] : undefined;
  const reemplazar = args.includes("--reemplazar");
  if (!entrada || !fs.existsSync(entrada)) die("falta el archivo o la carpeta con las respuestas");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "")) die("falta --fecha AAAA-MM-DD (el día en que se generaron)");

  const muestras = new Map();
  for (const l of todos) for (const p of l.prompts) muestras.set(idMuestra(p, l.cond), { lote: l.id, part: particion(p, l.cond), p });

  const archivos = fs.statSync(entrada).isDirectory()
    ? fs.readdirSync(entrada).filter((f) => /\.(txt|md)$/.test(f)).sort().map((f) => path.join(entrada, f))
    : [entrada];
  const registroFile = path.join(CORPUS, "manifests", "_ai_generacion.yml");
  const registro = fs.existsSync(registroFile) ? parse(fs.readFileSync(registroFile, "utf8")) : { schema_version: 1, samples: {} };
  const nuevos = [];
  const fueraDeBanda = [];
  for (const a of archivos) {
    const texto = fs.readFileSync(a, "utf8").replace(/\r\n?/g, "\n");
    const trozos = texto.split(/^===\s*(ai-[a-z0-9-]+)\s*===\s*$/m);
    if (trozos[0].trim()) die(`${a}: hay texto antes del primer «=== ai-... ===»`);
    for (let k = 1; k < trozos.length; k += 2) {
      const id = trozos[k];
      const m = muestras.get(id);
      if (!m) die(`${a}: ${id} no es ninguna muestra del corpus v1.3`);
      if (nuevos.some((x) => x.id === id)) die(`${id} aparece dos veces en la entrada`);
      let cuerpo = trozos[k + 1].trim();
      let edits = "ninguna (solo finales de línea)";
      const bloque = cuerpo.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
      if (bloque) {
        cuerpo = bloque[1].trim();
        edits = "quitado el bloque de código que envolvía el texto entero";
      }
      if (!cuerpo) die(`${id}: texto vacío`);
      const rel = `${m.part}/${id}.md`;
      const abs = path.join(CORPUS, rel);
      if (fs.existsSync(abs) && !reemplazar) die(`${rel} ya existe; para sustituirlo, --reemplazar`);
      nuevos.push({ id, rel, abs, texto: cuerpo + "\n", lote: m.lote, edits, reg: m.p.register });
    }
  }
  if (!nuevos.length) die("no hay ningún texto con su línea «=== ai-... ===»");
  const banda = { correo: [150, 400], readme: [200, 500], redes: [150, 350] };
  for (const x of nuevos) {
    fs.mkdirSync(path.dirname(x.abs), { recursive: true });
    fs.writeFileSync(x.abs, x.texto, "utf8");
    const w = words(x.texto);
    const [min, max] = banda[x.reg];
    if (w < min || w > max) fueraDeBanda.push(`${x.id} (${w} palabras; pedidas ${min}-${max})`);
    registro.samples[x.id] = { lote: x.lote, generated: fecha, words: w, edits: x.edits };
  }
  registro.samples = Object.fromEntries(Object.entries(registro.samples).sort(([a], [b]) => a.localeCompare(b)));
  fs.mkdirSync(path.dirname(registroFile), { recursive: true });
  fs.writeFileSync(registroFile, "# Generado por benchmark/scripts/generacion-v1.3.mjs importar. No editar a mano.\n" + stringify(registro, { lineWidth: 0 }), "utf8");
  const faltan = [...muestras.keys()].filter((id) => !registro.samples[id]);
  console.log(`importados ${nuevos.length} textos; en total ${Object.keys(registro.samples).length} de ${muestras.size}` + (faltan.length ? `; faltan ${faltan.length}` : ""));
  if (fueraDeBanda.length) console.log(`fuera de la banda de palabras del encargo (se conservan; decide si se regeneran):\n  ${fueraDeBanda.join("\n  ")}`);
  console.log(`siguiente paso: node ${path.relative(root, path.join(root, "benchmark", "scripts", "build-manifests-v1.3.mjs"))}`);
}
