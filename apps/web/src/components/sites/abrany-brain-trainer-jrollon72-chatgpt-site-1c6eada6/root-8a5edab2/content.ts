import type { CSSProperties } from "react";

// Todos los textos y datos de la web, en un solo archivo.
// Las cifras salen del repositorio: rulepack/rulepack.json y benchmark/reports/.
// Todo local: imágenes, fuentes y el vídeo. La web no pide nada a la red.

const clean = (base: string) => base.trim().replace(/\/$/, "");

// En GitHub Pages la web cuelga de /<repo>, y las rutas de public llevan ese prefijo delante.
const BASE_PATH = clean(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
const LOCAL_BASE = `${BASE_PATH}/sites/abrany-brain-trainer-jrollon72-chatgpt-site-1c6eada6/root-8a5edab2`;

const ASSET_BASE = clean(process.env.NEXT_PUBLIC_ASSET_BASE ?? LOCAL_BASE);
const VIDEO_BASE = clean(process.env.NEXT_PUBLIC_VIDEO_BASE ?? LOCAL_BASE);

const asset = (path: string) => `${ASSET_BASE}${path}`;
const video = (path: string) => `${VIDEO_BASE}${path}`;

export const IMG = {
  brain: asset("/img/brain-hero.png"),
  glow: asset("/img/glow.png"),
  ringOuter: asset("/img/ring-outer.svg"),
  ringInner: asset("/img/ring-inner.svg"),
  arc: asset("/img/arc.svg"),
  neuralThumb: asset("/img/neural-thumb.png"),
  chartLineA: asset("/img/chart-line-a.svg"),
  chartLineB: asset("/img/chart-line-b.svg"),
  gaugeTrack: asset("/img/gauge-a.png"),
  gaugeFill: asset("/img/gauge-b.png"),
  brainBadge: asset("/img/brain-badge.png"),
  logoMark: asset("/img/logo-mark.png"),
};

export const VIDEO = {
  film: video("/video/brain-film.mp4"),
  poster: asset("/video/brain-film-poster.jpg"),
};

export const AVATARS = [1, 2, 3, 4, 5].map((n) => asset(`/img/avatar-${n}.png`));

/** El nombre del paquete todavía no está renombrado. Los comandos se construyen desde aquí. */
export const PKG = {
  name: "TEXTOneitor",
  npm: "ia-linter-es",
  version: "1.1.0",
  repo: "https://github.com/Josulo72/textoneitor",
  email: "jrollon@gmail.com",
};

/**
 * Lo que hay colgado hoy en la última release, con el nombre literal del archivo.
 * No se construye con PKG.npm a propósito: el paquete se renombra a textoneitor y
 * estos archivos seguirán llamándose como se llaman hasta que haya una release nueva.
 * Derivarlos del nombre del paquete manda a la gente a descargar algo que no existe.
 */
export const RELEASE = {
  tgz: "ia-linter-es-1.1.0.tgz",
  pluginDir: "./ia-linter-es-claude-code",
};

/** La carpeta que crea `git clone`, que es el nombre del repositorio. */
const REPO_DIR = PKG.repo.slice(PKG.repo.lastIndexOf("/") + 1);

export const INSTALL_COMMAND = `npm i -D ${RELEASE.tgz}`;

export const NAV = [
  { id: "home", label: "Inicio" },
  { id: "courses", label: "Reglas" },
  { id: "vivo", label: "Pruébalo" },
  { id: "pricing", label: "Instalar" },
];

export const SECTION_IDS = ["home", "courses", "vivo", "pricing"];

export const HERO = {
  headline: ["Textos", "que no", "huelan", "a IA"],
  /** Índice de la palabra que lleva el degradado. */
  accent: 2,
  lede: "Le das un texto y te dice qué suena a máquina y por qué. Sin IA por dentro y sin salir a internet.",
  cta: "Cómo instalarlo",
  badge: ["Sin", "IA", "dentro"],
  /** La palabra gigante y difuminada del fondo. */
  ghost: "Texto",
  learners: { value: "132 textos", label: "comparados" },
  sessions: { value: "38", label: "reglas" },
  dataPoints: { value: "23", label: "estables" },
  avgScore: { value: "14,5", label: "separación" },
  insight: { kicker: "Análisis", title: "en vivo" },
};

/** La barra fija de arriba. */
export const CHROME = { cta: "Instalar" };

/** El menú que se abre a pantalla completa. */
export const MENU = {
  pie: "Treinta y ocho reglas para textos en español. Corre en tu ordenador, sin IA por dentro y sin salir a la red.",
  enlace: "Contacto",
  enlaceHref: "#contact",
};

export const SECTIONS = {
  courses: {
    index: "01",
    label: "Reglas",
    title: "Seis familias, treinta y ocho reglas",
    lede: "Cada regla tiene su explicación, su ejemplo, sus falsos positivos conocidos y de dónde sale la evidencia. Elige una familia y mira qué busca.",
  },
  vivo: {
    index: "02",
    label: "En vivo",
    title: "Pruébalo con tu texto",
    lede: "Esto de aquí abajo es el revisor de verdad, el mismo que se instala, corriendo dentro de esta página. Elige el perfil de la situación, que no se revisa igual un mensaje que un README.",
  },
  method: {
    index: "03",
    label: "Cómo va",
    title: "Primero la guía, luego el revisor",
    lede: "Una guía para antes de escribir y un revisor para después. Ninguno de los dos toca tu texto. Te dicen qué pasa y dónde, y ya decides.",
  },
  trainers: {
    index: "04",
    label: "Evidencia",
    title: "De dónde salen las reglas",
    lede: "No de una lista de manías. De comparar textos de personas con textos generados sobre los mismos temas, y de publicar también lo que no funcionó.",
  },
  limites: {
    index: "05",
    label: "Límites",
    title: "Lo que no funciona",
    lede: "Las cifras de arriba tienen letra pequeña y está aquí, no escondida en un anexo. Esto es lo que el revisor todavía hace mal y lo que no sabe hacer.",
  },
  pricing: {
    index: "06",
    label: "Instalar",
    title: "Tres formas de tenerlo",
    lede: "Todavía no está en npm. Se instala desde el paquete de la última release, como plugin de Claude Code o desde el código.",
  },
  faq: {
    index: "07",
    label: "Preguntas",
    title: "Respuestas cortas",
  },
};

/** Los ocho perfiles del revisor, con el nombre que se ve en pantalla. */
export const PERFILES = [
  { id: "chat", label: "Chat" },
  { id: "correo", label: "Correo" },
  { id: "readme", label: "README" },
  { id: "redes", label: "Redes" },
  { id: "general", label: "General" },
  { id: "tecnico", label: "Técnico" },
  { id: "academico", label: "Académico" },
  { id: "marketing", label: "Marketing" },
] as const;

export const VIVO = {
  editorLabel: "Tu texto",
  placeholder: "Pega aquí lo que quieras revisar.",
  nota: "El revisor corre en esta página, con las mismas 38 reglas que la orden del terminal. Tu texto no sale de tu navegador. No hay ninguna petición ni queda guardado en ningún sitio.",
  indiceLabel: "Índice",
  deCien: "de 100",
  hallazgosLabel: "Qué ha encontrado",
  botonGenerado: "Un texto con olor",
  botonHumano: "El mismo, escrito a mano",
  botonBorrar: "Borrar",
  cargando: "Cargando el motor...",
  error: "No se ha podido cargar el motor. Recarga la página y vuelve a probar.",
  pocasPalabras: "Para dar índice hacen falta más palabras. Faltan",
  analizadoEn: "Analizado en",
  sinHallazgos: "Nada que señalar con este perfil.",
  sinTexto: "Escribe o pega algo y se analiza solo.",
};

export const EJEMPLOS = {
  generado: `En este artículo exploraremos cómo la digitalización está transformando la gestión de facturas en las pequeñas empresas. Es importante destacar que no se trata únicamente de ahorrar tiempo, sino de repensar por completo la manera en que las organizaciones gestionan su documentación contable.

En la era digital, las herramientas de validación automática se han convertido en un recurso fundamental, innovador e imprescindible para cualquier negocio que aspire a mantenerse competitivo. Además, conviene señalar que estas soluciones permiten detectar errores — como un NIF inválido o un IVA mal calculado — antes de que lleguen a la contabilidad.

Asimismo, la automatización reduce significativamente los tiempos de revisión y mejora notablemente la precisión de los datos. Por otro lado, la implementación de estos sistemas resulta cada vez más accesible para empresas de cualquier tamaño.

En definitiva, adoptar este tipo de tecnología no es un gasto, es una inversión estratégica en el futuro de tu organización.`,
  humano: `Cazafacturas revisa facturas en PDF. Le echas los PDF y te dice cuáles están mal y por qué. Un NIF que no vale. Un IVA que no cuadra. Un total que no suma y que nadie ha mirado porque venía de un proveedor de siempre y esas cosas se firman sin leerlas. No usa IA ni internet, todo pasa en tu ordenador.

Lo he probado con 23 facturas de plantillas distintas. En PDF las lee todas bien. Con escaneados falla, y con fotos hechas con el móvil falla bastante más, así que por ahora eso lo tengo aparcado hasta que encuentre un OCR que no me obligue a mandar los papeles de mis clientes a un servidor que no controlo.

La idea salió una tarde de enero. Estaba revisando facturas de proveedores a mano, que es un trabajo aburridísimo, y se me escapó un IVA del 10 donde tenía que ir el 21. Al principio solo miraba el NIF. Luego le fui metiendo el resto.

Se instala con npm. Tarda un segundo por factura, más o menos.`,
};

export type Course = {
  id: string;
  name: string;
  level: string;
  blurb: string;
  metrics: { value: string; label: string }[];
};

export const COURSES: Course[] = [
  {
    id: "lexico",
    name: "Léxico",
    level: "4 de 7 estables",
    blurb:
      "Las muletillas que casi nadie escribe solo: \"en este artículo exploraremos\", \"es importante destacar\", \"en la era digital\". También la honestidad anunciada, o sea el \"para ser honesto\" que sobra siempre.",
    metrics: [
      { value: "7", label: "reglas en la familia" },
      { value: "4", label: "estables" },
    ],
  },
  {
    id: "estructura",
    name: "Estructura",
    level: "5 de 8 estables",
    blurb:
      "Cómo está montado el texto por fuera: el cierre formulario del último párrafo, los encabezados con dos puntos, el andamio de \"en primer lugar, en segundo lugar\" y el ritmo, que es el que más separa.",
    metrics: [
      { value: "8", label: "reglas en la familia" },
      { value: "5", label: "estables" },
    ],
  },
  {
    id: "retorica",
    name: "Retórica",
    level: "4 de 6 estables",
    blurb:
      "Las figuras que se repiten hasta el cansancio: negar algo que nadie ha dicho para quedar bien, el \"no solo, sino también\", las tríadas de tres adjetivos y la arenga del final.",
    metrics: [
      { value: "6", label: "reglas en la familia" },
      { value: "4", label: "estables" },
    ],
  },
  {
    id: "densidad",
    name: "Densidad",
    level: "6 de 7 estables",
    blurb:
      "Cuánto de lo que hay no aporta nada. Adjetivos grandilocuentes, adverbios en -mente uno detrás de otro, intensificadores, verbos comodín y emojis usados de viñeta.",
    metrics: [
      { value: "7", label: "reglas en la familia" },
      { value: "6", label: "estables" },
    ],
  },
  {
    id: "formato",
    name: "Formato",
    level: "2 de 7 estables",
    blurb:
      "Lo que se ve antes de leer: la raya con espacios a los lados, que es uso inglés, las comillas angulares, las negritas que abren párrafo y las listas con negrita en cada punto.",
    metrics: [
      { value: "7", label: "reglas en la familia" },
      { value: "2", label: "estables" },
    ],
  },
  {
    id: "repeticion",
    name: "Repetición",
    level: "2 de 3 estables",
    blurb:
      "Párrafos que empiezan con la misma palabra, anáforas mecánicas y secuencias de cuatro palabras que vuelven una y otra vez. Cuando la ves ya no la puedes dejar de ver.",
    metrics: [
      { value: "3", label: "reglas en la familia" },
      { value: "2", label: "estables" },
    ],
  },
];

export const STEPS = [
  {
    step: "01",
    title: "La guía, antes de escribir",
    body: "Un archivo de texto que le pegas a cualquier modelo. Si usas Claude Code, el plugin la carga al empezar la sesión. Quita del todo las rayas de inciso, las comillas angulares y las negritas de titular. El ritmo de las frases no lo arregla, y lo probamos de nueve maneras.",
  },
  {
    step: "02",
    title: "El revisor, después",
    body: "Le pasas un archivo, una carpeta o el texto por la entrada estándar. Te devuelve línea, columna, qué regla ha saltado y por qué, y un índice de 0 a 100. Con ocho perfiles, porque no se escribe igual un mensaje que un contrato.",
  },
  {
    step: "03",
    title: "Decides tú",
    body: "No cambia nada por su cuenta. Si una regla se equivoca la callas en esa línea con un comentario, la bajas de nivel en la configuración o creas una baseline y solo te avisa de lo nuevo.",
  },
];

export const STATS = [
  { value: 132, suffix: "", label: "textos comparados" },
  { value: 75, suffix: " %", label: "exactitud equilibrada" },
  { value: 8, suffix: "", label: "perfiles de escritura" },
  { value: 0, suffix: "", label: "peticiones a internet" },
];

export const TRAINERS = [
  {
    name: "36 mensajes de foro",
    role: "Clase humana",
    line: "Hilos de Mediavida, elhacker.net e Infojardín, de 2009 a 2021, para que no se cuele texto generado. En el repositorio están la URL y el hash de cada uno; los textos se bajan en local.",
  },
  {
    name: "96 textos generados",
    role: "Clase IA",
    line: "Los mismos temas y el mismo encargo. Una parte escrita siguiendo la guía, para ver qué sigue notándose cuando el modelo ya sabe lo que buscas.",
  },
  {
    name: "50 hallazgos adjudicados",
    role: "Precisión por regla",
    line: "Revisados uno a uno y a mano. Con un solo adjudicador, así que la cifra es orientativa, y así está publicada.",
  },
  {
    name: "3 informes enteros",
    role: "Lo que salió mal también",
    line: "El primer intento dio resultado negativo y sigue publicado. Los tres están en el repositorio con sus tablas y sus intervalos.",
  },
];

export const LIMITES = [
  {
    title: "Casi todo depende de una regla",
    body: "La separación entre lo generado y lo escrito a mano la sostiene estructura/ritmo-plano, que mira si todas las frases miden lo mismo. Sigue marcada como candidata. Contando solo las 23 reglas estables, el índice no separa en ningún registro.",
  },
  {
    title: "En correo y en README marca más a las personas",
    body: "Un correo de lista técnica y un README llevan frases de largo parecido porque el género lo pide, y ahí la regla del ritmo salta sobre gente que escribe normal. En el perfil correo viene apagada por eso. En README sigue puesta, porque quitarla no evitaba ninguna falsa alarma y sí perdía detecciones.",
  },
  {
    title: "Las pruebas no son independientes",
    body: "Los textos generados del banco los escribió el mismo modelo que escribió las reglas mirando esos textos. Las cifras dicen lo bien que un modelo reconoce su propia manera de escribir. Un banco hecho por otra gente daría otro número, y no sé cuál.",
  },
  {
    title: "Es español de España",
    body: "Los textos humanos del banco son foros, listas de correo y publicaciones de aquí. En el español de México o de Argentina marcará giros que allí son lo normal, y eso no está medido.",
  },
  {
    title: "Por debajo de 150 palabras no hay índice",
    body: "Los hallazgos salen igual, con su línea y su columna. El índice se queda en blanco, porque con menos texto el número no sería de fiar. Se puede bajar en la configuración, y entonces el número es tuyo y sabrás lo que vale.",
  },
  {
    title: "No dice quién ha escrito un texto",
    body: "Mide patrones de escritura. Una persona con prisa puede sacar índice alto y un texto generado con cuidado puede sacar cero. Para señalar a un alumno o a un empleado no vale, y usarlo para eso está mal.",
  },
];

/** Separación del índice por registro. Mediana IA menos mediana humana, en holdout. */
export const REGISTROS = {
  title: "Dónde separa y dónde no",
  nota: "Mediana de los textos generados menos la de los escritos por personas, en la partición que no se tocó al ajustar las reglas. La política pide 10 para dar un registro por bueno. El 75 % y el 14,5 que salen más arriba son del foro, banco v1.1; los otros tres registros son del v1.2.",
  max: 18,
  filas: [
    { id: "redes", name: "Redes", valor: 18, texto: "+18", detalle: "0 frente a 18" },
    { id: "foro", name: "Foro", valor: 14.5, texto: "+14,5", detalle: "0 frente a 14,5" },
    { id: "readme", name: "README", valor: -2, texto: "−2", detalle: "13 frente a 11" },
    { id: "correo", name: "Correo", valor: -9, texto: "−9", detalle: "18 frente a 9" },
  ],
};

export type Plan = {
  id: string;
  name: string;
  how: string;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "paquete",
    name: "El paquete",
    how: INSTALL_COMMAND,
    tagline: "Un .tgz normal de npm, de la pestaña Releases.",
    features: [
      `La orden ${PKG.npm} en tu proyecto`,
      "Los ocho perfiles y la configuración",
      "Node 20 o más",
      "Vale igual con pnpm y con yarn",
    ],
    cta: "Ir a las releases",
    href: `${PKG.repo}/releases`,
    featured: true,
  },
  {
    id: "plugin",
    name: "Plugin de Claude Code",
    how: `claude --plugin-dir ${RELEASE.pluginDir}`,
    tagline: "Carga la guía al empezar cada sesión.",
    features: [
      "Un zip en la misma release",
      "La orden /revisar dentro de Claude",
      "Dos hooks opcionales",
      "Para Codex hay un AGENTS.md",
    ],
    cta: "Ver las integraciones",
    href: `${PKG.repo}/tree/main/integrations`,
    featured: false,
  },
  {
    id: "codigo",
    name: "El código",
    how: `git clone ${PKG.repo} && cd ${REPO_DIR} && pnpm install && pnpm build`,
    tagline: "Si quieres tocarlo o escribir tus propias reglas.",
    features: [
      "Las 38 reglas en un solo JSON",
      "Guía para escribir reglas nuevas",
      "Pre-commit y GitHub Action",
      "BUSL-1.1, y AGPL-3.0 en 2030",
    ],
    cta: "Ver el repositorio",
    href: PKG.repo,
    featured: false,
  },
];

export const FAQ = [
  {
    q: "¿Esto dice si un texto lo ha escrito una IA?",
    a: "No, y no sirve para eso. Mide patrones de escritura. Un texto escrito por una persona con prisa puede sacar un índice alto y uno generado con cuidado puede sacar cero. Usarlo para acusar a alguien está mal.",
  },
  {
    q: "¿Mi texto sale de mi ordenador?",
    a: "No. No hay IA por dentro y no hay llamadas a ninguna API: el análisis entero pasa en tu ordenador. La misma orden se ejecuta igual en tu portátil, en el pre-commit y en la GitHub Action, y da exactamente los mismos hallazgos.",
  },
  {
    q: "¿Y si una regla marca algo que está bien?",
    a: "Pasa, y por eso cada regla trae escritos sus falsos positivos conocidos. La puedes callar en esa línea con un comentario, bajarla de nivel para unas rutas concretas o apagarla del todo. Con una baseline, además, solo te avisa de lo que escribas a partir de ahora.",
  },
  {
    q: "¿Puedo pararlo en el pre-commit o en la CI?",
    a: "Sí. Con --fail-on eliges desde qué nivel corta, o never para que solo avise, y con --max-index cortas por índice. Saca JSON y SARIF, así que los hallazgos salen en la pestaña de seguridad de GitHub como los de cualquier otro análisis del código.",
  },
];

export const FOOTER = {
  cta: "Cómo instalarlo",
  installLabel: "Instalar",
  installIdle: "Copia la orden y pégala en tu proyecto.",
  installDone: "Copiado.",
  disclaimer: "TEXTOneitor mide patrones de escritura. No dice quién ha escrito un texto, y para eso no sirve.",
  rights: "BUSL-1.1. Pasa sola a AGPL-3.0 el 17 de septiembre de 2030.",
};

export const FOOTER_COLUMNS = [
  {
    title: "Documentación",
    links: ["Las 38 reglas", "Configuración", "Banco de pruebas", "Decisiones"],
  },
  { title: "Integraciones", links: ["Claude Code", "Pre-commit", "GitHub Action", "AGENTS.md"] },
  { title: "Licencia", links: ["BUSL-1.1", "Uso comercial", "AGPL-3.0 en 2030", "Contacto"] },
];

export const MARQUEE_DOMAINS = ["Léxico", "Estructura", "Retórica", "Densidad", "Formato", "Repetición"];
export const MARQUEE_VALUES = ["Local", "Determinista", "Explicado", "Tuyo"];

// ---- Hero stage geometry (Figma units; 1 unit = var(--u)) ----

export const u = (n: number) => `calc(${n} * var(--u))`;

export type StageSize = { w: number; h: number };
export const STAGE_DESKTOP: StageSize = { w: 1440, h: 810 };
export const STAGE_MOBILE: StageSize = { w: 440, h: 956 };

export const stageVars = (s: StageSize) =>
  ({ "--stage-ar": `${s.w / s.h}`, "--stage-cols": `${s.w}` }) as CSSProperties;

export const box = (x: number, y: number, w: number, h: number = w): CSSProperties => ({
  position: "absolute",
  left: u(x - w / 2),
  top: u(y - h / 2),
  width: u(w),
  height: u(h),
});

const LINE = 1.23;
const ASCENT = 0.28;
/** Top offset that aligns a text box to its Figma baseline. */
export const textTop = (y: number, size: number, lineHeight = 1) => u(y - size * ((lineHeight - LINE) / 2 + ASCENT));

export type HeroLayout = {
  center: { x: number; y: number };
  ringOuter: number;
  ringInner: number;
  glow: { x: number; y: number; w: number; h: number; blur: number };
  brain: { x: number; y: number; w: number; h: number };
  sound: { x: number; y: number; size: number };
  arc?: { x: number; y: number; w: number; h: number };
};

export const LAYOUT_DESKTOP: HeroLayout = {
  center: { x: 851.18, y: 414.13 },
  ringOuter: 974.937,
  ringInner: 787.663,
  glow: { x: 851.18, y: 426.69, w: 768, h: 585, blur: 115 },
  brain: { x: 851.18, y: 394.17, w: 1136.91, h: 619.502 },
  sound: { x: 210, y: 748, size: 32 },
  arc: { x: 720, y: 765.01, w: 1616.883, h: 602 },
};

export const LAYOUT_MOBILE: HeroLayout = {
  center: { x: 220, y: 732.37 },
  ringOuter: 736.937,
  ringInner: 595.38,
  glow: { x: 220, y: 739.44, w: 524.36, h: 399.415, blur: 78.517 },
  brain: { x: 220, y: 748.58, w: 776.237, h: 422.971 },
  sound: { x: 376, y: 560, size: 36 },
};
