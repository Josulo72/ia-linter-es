#!/usr/bin/env node
// Traduce las respuestas de un adjudicador ciego (id opaco -> correct | incorrect | dudoso) a un archivo de adjudicación
// que lee `benchmark run --annotations`, usando el mapa que escribió `dump-findings.mjs --ciego`.
//
// Uso:
//   node benchmark/scripts/aplicar-adjudicacion.mjs --register correo --respuestas benchmark/annotations/v1.2/respuestas/correo.yml \
//     --mapa benchmark/annotations/v1.2/paquetes/mapa-correo.json --adjudicador "<proveedor>/<modelo>" \
//     --salida benchmark/annotations/v1.2/correo.yml
//
// Los ids de las respuestas tienen que ser los del mapa (c-, m-, s-). Cualquier id desconocido, repetido o que falte
// es un error: no se escribe nada a medias.
//
// --revision <archivo>: lo que decide una persona sobre los `dudoso` (mismo formato, id: correct | incorrect). Solo puede
// resolver ids que el adjudicador dejó en `dudoso`; las respuestas originales no se tocan y el archivo final dice cuáles
// se resolvieron así.
//
// Los `dudoso` no se adjudican: quedan en la lista `dudosos` del archivo hasta que los resuelva el propietario.
// El archivo no lleva fragmentos de texto, solo claves, porque la clase humana no se redistribuye.
import fs from "node:fs";
import { parse, stringify } from "yaml";

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const need = (n) => opt(n) ?? fail(`falta --${n}`);
function fail(msg) {
  console.error(`aplicar-adjudicacion: ${msg}`);
  process.exit(2);
}

const register = need("register");
function leer(archivo) {
  try {
    return parse(fs.readFileSync(archivo, "utf8")) ?? {};
  } catch (e) {
    fail(`no se puede leer ${archivo} (¿un id repetido?): ${e.message.split("\n")[0]}`);
  }
}
const respuestas = leer(need("respuestas"));
const revision = opt("revision") ? leer(opt("revision")) : {};
const mapa = JSON.parse(fs.readFileSync(need("mapa"), "utf8"));
const adjudicador = need("adjudicador");
const salida = need("salida");

if (mapa.register !== register) fail(`el mapa es de ${mapa.register}, no de ${register}`);
const ids = Object.keys(mapa.items);

// Un id repetido ya falla al leer: el parser de YAML no admite claves duplicadas.
const adjudications = {};
const dudosos = [];
const vistos = new Set();
for (const [id, valor] of Object.entries(respuestas)) {
  const key = mapa.items[id];
  if (!key) fail(`${id} no está en el mapa de ${register}`);
  vistos.add(id);
  if (valor === "correct" || valor === "incorrect") adjudications[key] = valor;
  else if (valor === "dudoso") dudosos.push(key);
  else fail(`${id}: valor "${valor}", tiene que ser correct, incorrect o dudoso`);
}
const faltan = ids.filter((id) => !vistos.has(id));
if (faltan.length) fail(`faltan respuestas para ${faltan.join(", ")}`);

const revisados = [];
for (const [id, valor] of Object.entries(revision)) {
  const key = mapa.items[id];
  if (!key) fail(`revisión: ${id} no está en el mapa de ${register}`);
  if (respuestas[id] !== "dudoso") fail(`revisión: ${id} no era dudoso (el adjudicador dijo ${respuestas[id]}); solo se revisan los dudosos`);
  if (valor !== "correct" && valor !== "incorrect") fail(`revisión: ${id}: valor "${valor}", tiene que ser correct o incorrect`);
  adjudications[key] = valor;
  dudosos.splice(dudosos.indexOf(key), 1);
  revisados.push(key);
}

const doc = {
  schema_version: 1,
  corpus: mapa.corpus,
  partition: mapa.partition,
  register,
  profile: mapa.profile,
  reviewers: 1,
  adjudicador,
  metodo: "ciego: sin id de muestra, sin clase humano/IA y sin estado de la regla; ver docs/benchmark.md",
  no_adjudicadas: mapa.excluidas,
  dudosos: [...dudosos].sort(),
  ...(revisados.length ? { revisados_por_el_propietario: revisados.sort() } : {}),
  adjudications: Object.fromEntries(Object.entries(adjudications).sort(([a], [b]) => a.localeCompare(b))),
};
fs.writeFileSync(salida, stringify(doc, { lineWidth: 0 }), "utf8");
const n = Object.values(adjudications);
console.log(`${register}: ${n.filter((v) => v === "correct").length} correct, ${n.filter((v) => v === "incorrect").length} incorrect, ${dudosos.length} dudoso -> ${salida}`);
