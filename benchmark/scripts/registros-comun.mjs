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

// Español de España: al menos una marca peninsular y ninguna americana. Ante la duda, fuera.
const ES_ES = [
  /\b(vosotros|vuestr[oa]s?|habéis|tenéis|podéis|queréis|sabéis|estáis|hacéis|venís|sois)\b/i,
  /\b(ordenador(es)?|fichero(s)?|móvil(es)?|coche(s)?|piso(s)?|curro|chaval(es)?|gilipollas|cutre|guay|majo|vale)\b/i,
  /\b(a por|en plan|hostia|joder|tío|tía|flipar|flipa|mola|chorrada|cabreo|cabread[oa])\b/i,
  /\b(españa|español(a|es)?|madrid|barcelona|valencia|sevilla|zaragoza|bilbao|málaga|galicia|andalucía|cataluña)\b/i,
  /\b(euros?|€|iva|nif|dni|renfe|movistar|telefónica|mercadona|hacienda|seguridad social|ayuntamiento|comunidad autónoma)\b/i,
];
const ES_AM = [
  /\b(computadora|computador|celular(es)?|acá|allá mismo|recién|jugo|plata|lindo|linda|manejar el auto|auto(s)? nuevo|carro(s)?|boleto|cuadra|checar|platicar|ahorita|ustedes son|porotos|frijoles|papas fritas)\b/i,
  /\b(vos |sos |tenés|querés|podés|mirá|tomá|andá|che )/i,
  /\b(méxico|mexicano|argentin[oa]|chilen[oa]|colombian[oa]|peruan[oa]|venezolan[oa]|ecuatorian[oa]|uruguay|bolivi[ao]|paraguay|guatemal|cubano|dominican[oa]|bogotá|lima|cdmx|ciudad de méxico|buenos aires|santiago de chile|monterrey|guadalajara|medellín|caracas)\b/i,
  /\b(rut|sunat|cfdi|afip|dian|imss|sii|anses|pesos?|mxn|cop|ars|clp|pen|bs\.)\b/i,
];
// Segundo nivel: rasgos peninsulares más flojos. Hacen falta dos para aceptar un texto sin marca de primer nivel.
const ES_ES2 = [
  /\b(cog(er|es|e|í|ió|ido|iendo)|aparcar|aparcado|portátil(es)?|ratón|pantallazo)\b/i,
  /\b(vale|venga|o sea|en fin|qué tal|de todas formas|por cierto|encima de eso|menudo|menuda)\b/i,
  /\b(movida|cacharro|follón|chungo|currar|mogollón|liarse|se lía|dar de sí|tela)\b/i,
  /\b(ahora mismo|sin más|un rollo|una chapuza|apañar|apaño|trastear)\b/i,
];
/** Devuelve el número de marcas peninsulares si el texto pasa el filtro, o null si hay duda. */
export function deEspana(text) {
  if (ES_AM.some((r) => r.test(text))) return null;
  const fuertes = ES_ES.filter((r) => r.test(text)).length;
  if (fuertes) return fuertes;
  const flojas = ES_ES2.filter((r) => r.test(text)).length;
  return flojas >= 2 ? flojas : null;
}
