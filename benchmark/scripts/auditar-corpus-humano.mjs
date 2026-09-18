#!/usr/bin/env node
/**
 * Revisa la clase humana ya descargada con los filtros vigentes y dice qué textos no deberían estar.
 *
 * Existe porque el filtro de español de España con el que se montó el corpus v1.2 no filtraba lo que
 * decía filtrar: aceptaba un texto con una sola marca peninsular, y en README esa marca era justo la
 * palabra que la consulta de GitHub ya garantizaba («ordenador», «fichero»). El resultado es que hay
 * textos no peninsulares y textos que no son prosa dentro de la clase humana.
 *
 * Los textos humanos no están en el repositorio, así que esto solo da resultado en el equipo que los
 * tiene bajados. Lo que no encuentra, lo dice; no lo da por bueno.
 *
 * No toca nada: solo lee e informa. Para sacar del corpus lo que aquí sale marcado:
 *   node benchmark/scripts/fetch-registros.mjs --source <registro> --append
 *
 * Uso: node benchmark/scripts/auditar-corpus-humano.mjs [--registro correo|readme|redes] [--ver]
 *      --ver  imprime además las tres primeras líneas de cada texto marcado
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { deEspana, pareceLetra, INSTANCIA_VETADA, words } from "./registros-comun.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const corpus = path.join(root, "corpus-v1.2");
const args = process.argv.slice(2);
const soloRegistro = args.includes("--registro") ? args[args.indexOf("--registro") + 1] : null;
const VER = args.includes("--ver");
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

// Mismo filtro de habla que fetch-registros aplica a Reddit, repetido aquí para no exportar medio script.
const HABLA_ES = [
  /\b(vosotros|vuestr[oa]s?|habéis|tenéis|podéis|queréis|sabéis|estáis|hacéis|venís|sois|íbamos|coj[oa]|cogí|coges|coger)\b/i,
  /\b(curro|currar|chaval(es)?|gilipollas|cutre|guay|majo|movida|follón|chungo|mogollón|tío|tía|joder|hostia|vale ya)\b/i,
  /\b(euros?|€|iva|nif|dni|renfe|movistar|mercadona|hacienda|seguridad social|ayuntamiento|comunidad autónoma|erasmus|uned)\b/i,
];
const FORASTERO = [
  /\b(soy (un )?extranjer[oa]|no soy español|nací y crecí|toda mi vida la he vivido|soy de (méxico|mexico|colombia|argentina|chile|perú|peru|venezuela|ecuador|uruguay|bolivia|paraguay|cuba|república dominicana)|vivo en (méxico|mexico|colombia|argentina|chile|perú|peru|venezuela|ecuador))\b/i,
  /\b(emigrar a españa|mudarme a españa|irme a vivir a españa|voy a vivir en españa|pasar un año en españa|venirme a españa|llevo viviendo en españa|mi país|mi pais)\b/i,
];
const habladeEspana = (t) => HABLA_ES.some((r) => r.test(t)) && !FORASTERO.some((r) => r.test(t));

/** Por qué un texto no debería seguir en la clase humana, o null si está bien. */
function motivoDeSalida(texto, muestra) {
  if (pareceLetra(texto)) return "no es prosa: letra de canción, poema o lista de versos";
  if (deEspana(texto, { estricto: true }) === null) {
    const laxo = deEspana(texto) !== null;
    return laxo
      ? "pasaba el filtro viejo por una sola marca, no pasa el estricto"
      : "no pasa el filtro de español de España (marca americana, o ninguna peninsular)";
  }
  const fuente = String(muestra.source ?? "");
  if (fuente.startsWith("mastodon:") && INSTANCIA_VETADA(fuente.slice(9))) {
    return "instancia no peninsular, o que no es de texto";
  }
  if (fuente.startsWith("reddit:") && !habladeEspana(texto)) return "no pasa el filtro de habla peninsular";
  return null;
}

let totalMarcados = 0;
let totalRevisados = 0;
let totalAusentes = 0;

for (const registro of ["correo", "readme", "redes"]) {
  if (soloRegistro && soloRegistro !== registro) continue;
  const mf = path.join(corpus, "manifests", `_human_${registro}.yml`);
  if (!fs.existsSync(mf)) {
    console.log(`\n${registro}: falta ${path.relative(root, mf)}`);
    continue;
  }
  const samples = parse(fs.readFileSync(mf, "utf8")).samples ?? [];
  const marcados = [];
  let ausentes = 0;
  let hashMal = 0;

  for (const s of samples) {
    const f = path.join(corpus, s.file);
    if (!fs.existsSync(f)) {
      ausentes++;
      continue;
    }
    const texto = fs.readFileSync(f, "utf8");
    totalRevisados++;
    if (sha256(texto) !== s.sha256) hashMal++;
    const motivo = motivoDeSalida(texto, s);
    if (motivo) marcados.push({ s, motivo, texto });
  }

  totalAusentes += ausentes;
  totalMarcados += marcados.length;
  const revisados = samples.length - ausentes;
  console.log(`\n## ${registro}: ${revisados} de ${samples.length} textos revisados, ${marcados.length} marcados`);
  if (ausentes) console.log(`   ${ausentes} no están en local; bájalos con --from-manifest antes de fiarte de este recuento`);
  if (hashMal) console.log(`   ${hashMal} no coinciden con su hash del manifiesto`);

  for (const { s, motivo, texto } of marcados) {
    console.log(`   - ${s.id} (${s.file}, ${words(texto)} palabras): ${motivo}`);
    console.log(`     ${s.source_url}`);
    if (VER) {
      for (const l of texto.split("\n").filter((x) => x.trim()).slice(0, 3)) console.log(`     | ${l.slice(0, 110)}`);
    }
  }
}

console.log(`\n${totalRevisados} textos revisados, ${totalMarcados} marcados, ${totalAusentes} no están en local.`);
if (totalAusentes && !totalRevisados) {
  console.log("Sin textos en local no hay auditoría: esto no significa que el corpus esté bien.");
}
if (totalMarcados) {
  console.log("Un texto marcado invalida las cifras de la partición donde esté. Rehaz el registro con --append y vuelve a medir.");
}
process.exit(totalMarcados ? 1 : 0);
