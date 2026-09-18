// Piezas comunes del descargador de la clase humana v1.2 (perfiles correo, readme y redes).
// Sin dependencias fuera del espacio de trabajo. Pausa entre peticiones y user-agent identificable.
export const UA = {
  "User-Agent": "ia-linter-es-corpus/1.2 (banco de pruebas del linter; contacto: jrollon@gmail.com)",
  "Accept-Language": "es-ES,es;q=0.9",
};
export const CUTOFF = "2022-01-01"; // nada publicado el 31/12/2021 o después queda fuera
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function get(url, { enc = "utf-8", json = false, headers = {}, pause = 1200 } = {}) {
  await sleep(pause);
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { headers: { ...UA, ...headers }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) return { status: r.status, url: r.url, body: null };
      const buf = await r.arrayBuffer();
      const text = new TextDecoder(enc).decode(buf);
      return { status: r.status, url: r.url, body: json ? JSON.parse(text) : text };
    } catch (e) {
      if (i) return { status: 0, url, body: null, error: String(e && e.message) };
      await sleep(2500);
    }
  }
  return { status: 0, url, body: null };
}

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", iexcl: "¡", iquest: "¿", hellip: "…", laquo: "«", raquo: "»",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", euro: "€", ordm: "º", ordf: "ª", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”" };
export const decodeEntities = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-zA-Z]+);/g, (m, n) => NAMED[n] ?? m);

export function htmlToText(html) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, ""))
    .split("\n").map((l) => l.replace(/[ \t\u00a0]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
export const words = (s) => (s.match(/\S+/g) ?? []).length;
export const normalize = (s) => s.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";

/** Prosa en español: acentos y palabras funcionales propias del idioma. */
export function esSpanish(text) {
  const t = text.toLowerCase();
  const fn = [/\bque\b/, /\bde\b/, /\bla\b/, /\bel\b/, /\blos\b/, /\blas\b/, /\bpara\b/, /\bcon\b/, /\bpor\b/, /\buna\b/, /\bcomo\b/, /\bpero\b/, /\bporque\b/, /\bcuando\b/];
  const hits = fn.filter((r) => r.test(t)).length;
  const acentos = (t.match(/[áéíóúñ¿¡]/g) ?? []).length;
  return hits >= 6 && acentos >= 2;
}

// Español de España. Dos niveles de exigencia, porque una sola marca no basta:
//
//   - ES_ES_FUERTE: rasgos que casi nadie escribe fuera de España (conjugación de vosotros, léxico
//     coloquial peninsular, topónimos e instituciones). Una sola ya es señal buena.
//   - ES_ES_TECNICO: palabras peninsulares pero de uso técnico corriente («ordenador», «fichero»).
//     Valen como apoyo y NO bastan solas. Motivo: las consultas de GitHub buscan justo estas palabras,
//     así que si contasen como marca suficiente el filtro aprobaría por construcción todo lo que la
//     consulta devuelve, viniera de donde viniera. Ese fallo metió textos no peninsulares en v1.2.
//   - ES_ES2: rasgos flojos. Hacen falta dos.
//
// «vale» estaba entre las fuertes y se ha quitado: es el verbo valer («no vale la pena», «¿cuánto
// vale?»), que escribe cualquier hispanohablante. Queda solo entre las flojas.
const ES_ES_FUERTE = [
  /\b(vosotros|vuestr[oa]s?|habéis|tenéis|podéis|queréis|sabéis|estáis|hacéis|venís|sois)\b/i,
  /\b(curro|chaval(es)?|gilipollas|cutre|guay|majo|chulo|petado|movidas)\b/i,
  /\b(a por|en plan|hostia|joder|tío|tía|flipar|flipa|mola|chorrada|cabreo|cabread[oa]|vaya tela)\b/i,
  /\b(españa|español(a|es)?|madrid|barcelona|valencia|sevilla|zaragoza|bilbao|málaga|galicia|andalucía|cataluña|castilla|asturias|euskadi)\b/i,
  /\b(iva|nif|dni|renfe|movistar|telefónica|mercadona|hacienda|seguridad social|ayuntamiento|comunidad autónoma|erasmus|uned|selectividad|grado superior)\b/i,
];
// Peninsulares, pero corrientes en documentación técnica y presentes en las consultas de búsqueda.
// Apoyan; nunca deciden solas.
const ES_ES_TECNICO = [
  /\b(ordenador(es)?|fichero(s)?|móvil(es)?|coche(s)?|piso(s)?|euros?|€)\b/i,
];
const ES_AM = [
  /\b(computadora|computador|celular(es)?|acá|allá mismo|recién|jugo|plata|lindo|linda|manejar el auto|auto(s)? nuevo|carro(s)?|boleto|cuadra|checar|platicar|ahorita|ustedes son|porotos|frijoles|papas fritas)\b/i,
  /\b(vos |sos |tenés|querés|podés|mirá|tomá|andá|che )/i,
  /\b(méxico|mexicano|argentin[oa]|chilen[oa]|colombian[oa]|peruan[oa]|venezolan[oa]|ecuatorian[oa]|uruguay|bolivi[ao]|paraguay|guatemal|cubano|dominican[oa]|bogotá|lima|cdmx|ciudad de méxico|buenos aires|santiago de chile|monterrey|guadalajara|medellín|caracas|quito|montevideo|san josé)\b/i,
  /\b(rut|sunat|cfdi|afip|dian|imss|sii|anses|pesos?|mxn|cop|ars|clp|pen|bs\.)\b/i,
  // Mexicanismos que faltaban y que dejaban pasar texto de México en la primera vuelta del filtro.
  // Solo los inequívocos: fuera quedan «lana», «fresa», «pinche» y «colonia», que en España
  // significan otra cosa y expulsarían textos peninsulares buenos.
  /\b(güey|wey|órale|no manches|chido|padrísimo|padrisimo|neta que|chamba|chambear|antier|banqueta|alberca|elote|popote|cajuela|refri|tianguis|ándale|híjole|apapachar|sale pues|ahorita mismo)\b/i,
  /\b(rentar|rento|rentas|rentado|jalar el|le echamos ganas|platicamos)\b/i,
  // Rasgos andinos, caribeños y rioplatenses inequívocos. Fuera «pana», «vaina», «carnet» y
  // «guagua», que son corrientes en España o en Canarias.
  /\b(chévere|bacán|cachai|weon|hueón|huevón|parce|bacano|chamo|listo pues|de una vez pues)\b/i,
];
// Segundo nivel: rasgos peninsulares más flojos. Hacen falta dos para aceptar un texto sin marca de primer nivel.
const ES_ES2 = [
  /\b(cog(er|es|e|í|ió|ido|iendo)|aparcar|aparcado|portátil(es)?|ratón|pantallazo)\b/i,
  /\b(vale|venga|o sea|en fin|qué tal|de todas formas|por cierto|encima de eso|menudo|menuda)\b/i,
  /\b(movida|cacharro|follón|chungo|currar|mogollón|liarse|se lía|dar de sí|tela)\b/i,
  /\b(ahora mismo|sin más|un rollo|una chapuza|apañar|apaño|trastear)\b/i,
];

/**
 * Devuelve el número de marcas peninsulares si el texto pasa el filtro, o null si hay duda.
 * Con `{ estricto: true }` una marca técnica ya no basta por sí sola: hace falta una marca fuerte,
 * o una técnica acompañada de dos flojas. Es el modo que deben usar los tres registros de v1.2.
 */
export function deEspana(text, { estricto = false } = {}) {
  if (ES_AM.some((r) => r.test(text))) return null;
  const fuertes = ES_ES_FUERTE.filter((r) => r.test(text)).length;
  const tecnicas = ES_ES_TECNICO.filter((r) => r.test(text)).length;
  const flojas = ES_ES2.filter((r) => r.test(text)).length;
  if (fuertes) return fuertes + tecnicas + flojas;
  if (!estricto) return tecnicas || flojas >= 2 ? tecnicas + flojas : null;
  // Estricto: una técnica sola no decide. Vale con técnica más dos flojas, o con tres flojas
  // independientes, que en un texto de 150 a 900 palabras ya es un patrón y no una casualidad.
  if (tecnicas && flojas >= 2) return tecnicas + flojas;
  return flojas >= 3 ? flojas : null;
}

/**
 * Texto que no es prosa de una persona a otra: letra de canción, poema, lista de versos.
 * Se mira la forma, no el tema: hablar de música no descalifica, reproducir una letra sí.
 * Señales: muchas líneas cortas seguidas sin puntuación final, líneas repetidas literalmente,
 * o una cabecera que lo anuncia.
 */
export function pareceLetra(text) {
  if (/^\s*(letra|lyrics|estribillo|coro)\s*[:\-]/im.test(text)) return true;
  if (/[♪♫𝄞]/.test(text)) return true;
  const lineas = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lineas.length < 6) return false;
  // Verso: línea corta que no termina en signo de puntuación y no es encabezado, viñeta ni código.
  const esVerso = (l) => {
    const w = words(l);
    return w >= 2 && w <= 9 && !/[.:;!?)\]}>`]$/.test(l) && !/^([#>*\-+|]|\d+[.)]|```)/.test(l);
  };
  const versos = lineas.filter(esVerso).length;
  if (versos / lineas.length >= 0.6) return true;
  // Estribillo: una misma línea de cierta longitud repetida tres veces o más.
  const cuenta = new Map();
  for (const l of lineas) if (words(l) >= 3) cuenta.set(l.toLowerCase(), (cuenta.get(l.toLowerCase()) ?? 0) + 1);
  return [...cuenta.values()].some((n) => n >= 3);
}

/** Instancias del fediverso que no sirven para este corpus: no peninsulares, o que no son de texto. */
export const INSTANCIA_VETADA = (dom) =>
  /(^|\.)(mastodon\.la|masto\.donte\.com\.br|mastodon\.uy|mastodon\.mx|masto\.ar)$/i.test(dom) || /pixelfed/i.test(dom);
