#!/usr/bin/env node
// Auditoría del banco de pruebas v1.2 (registros correo, readme y redes).
// Contesta lo mismo que la auditoría de v1.1, pero por registro y con el perfil de cada uno:
//   1. ¿Cuántas reglas disparan en cada registro? ¿Y cuántas de las stable?
//   2. ¿Qué queda de la separación si se quitan las dos reglas de ritmo?
//   3. ¿Y si solo se cuentan las reglas stable?
//   4. ¿Las seis reglas stable que no tenían evidencia de corpus la tienen ya?
// Cada texto se analiza con el perfil que le corresponde por registro, en Markdown.
// Sin red. Uso: node benchmark/scripts/auditoria-banco-v1.2.mjs [--partitions development,challenge] [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const api = await import(pathToFileURL(path.join(root, "packages", "linter", "dist", "api", "index.js")).href);
const corpus = path.join(root, "corpus-v1.2");
const K = 40; // SCORE_K: la escala del índice, en src/scoring/index.ts
const REGISTROS = ["correo", "readme", "redes"];
const args = process.argv.slice(2);
const partesPedidas = (args.includes("--partitions") ? args[args.indexOf("--partitions") + 1] : "development,holdout,challenge").split(",");

// Las seis reglas stable que la auditoría de v1.1 dejó sin evidencia de corpus en ninguna versión.
const SIN_EVIDENCIA_V11 = [
  "densidad/conectores",
  "densidad/intensificadores",
  "densidad/verbos-comodin",
  "lexico/desde-hasta-pasando",
  "lexico/metaforas-comodin",
  "lexico/ya-sea-enumeracion",
];

const pack = api.loadRulePack();
const stable = new Set(pack.rules.filter((r) => r.status === "stable").map((r) => r.id));

/** Recalcula el índice con la fórmula real dejando fuera las reglas que diga `fuera`. */
const indiceSin = (score, fuera) => {
  const sum = score.contributors.filter((c) => !fuera(c.rule)).reduce((a, c) => a + c.contribution, 0);
  const raw = score.eligibleWords > 0 ? (1000 * sum) / score.eligibleWords : 0;
  return Math.round((100 * raw) / (raw + K));
};
const med = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const porRegistro = {};
for (const r of REGISTROS) {
  porRegistro[r] = {
    textos: 0,
    faltan: 0,
    cortos: { development: 0, holdout: 0, challenge: 0 },
    disparadas: new Set(),
    docs: new Map(), // regla -> { human, ai }
    holdout: { todo: { human: [], ai: [] }, sinRitmo: { human: [], ai: [] }, soloStable: { human: [], ai: [] } },
    n: { human: 0, ai: 0 },
  };
}

for (const parte of partesPedidas) {
  const mf = path.join(corpus, "manifests", `${parte}.yml`);
  if (!fs.existsSync(mf)) continue;
  for (const s of parse(fs.readFileSync(mf, "utf8")).samples) {
    const R = porRegistro[s.register];
    if (!R) continue;
    const p = path.join(corpus, s.file);
    if (!fs.existsSync(p)) {
      R.faltan++;
      continue;
    }
    R.textos++;
    const res = api.lintText(fs.readFileSync(p, "utf8"), { config: { profile: s.register }, format: "markdown" });
    const vistas = new Set();
    for (const f of res.findings) {
      if (f.suppressed) continue;
      R.disparadas.add(f.rule);
      if (vistas.has(f.rule)) continue;
      vistas.add(f.rule);
      const d = R.docs.get(f.rule) ?? { human: 0, ai: 0 };
      d[s.class]++;
      R.docs.set(f.rule, d);
    }
    if (parte !== "holdout") continue;
    R.n[s.class]++;
    if (res.score.index === null) {
      R.cortos.holdout++;
      continue;
    }
    R.holdout.todo[s.class].push(res.score.index);
    R.holdout.sinRitmo[s.class].push(indiceSin(res.score, (id) => id.startsWith("estructura/ritmo")));
    R.holdout.soloStable[s.class].push(indiceSin(res.score, (id) => !stable.has(id)));
  }
}

const todasDisparadas = new Set(REGISTROS.flatMap((r) => [...porRegistro[r].disparadas]));
const salida = {
  partitions: partesPedidas,
  reglas: pack.rules.length,
  stable: stable.size,
  disparadas_en_v1_2: [...todasDisparadas].sort(),
  stable_mudas_en_v1_2: [...stable].filter((id) => !todasDisparadas.has(id)).sort(),
  seis_sin_evidencia: Object.fromEntries(
    SIN_EVIDENCIA_V11.map((id) => [
      id,
      Object.fromEntries(REGISTROS.map((r) => [r, porRegistro[r].docs.get(id) ?? { human: 0, ai: 0 }])),
    ]),
  ),
  por_registro: Object.fromEntries(
    REGISTROS.map((r) => {
      const R = porRegistro[r];
      return [
        r,
        {
          textos: R.textos,
          faltan: R.faltan,
          cortos_en_holdout: R.cortos.holdout,
          holdout_n: R.n,
          disparadas: R.disparadas.size,
          disparadas_stable: [...R.disparadas].filter((id) => stable.has(id)).length,
          medianas: Object.fromEntries(
            Object.entries(R.holdout).map(([k, v]) => [
              k,
              { human: med(v.human), ai: med(v.ai), separacion: med(v.ai) !== null && med(v.human) !== null ? med(v.ai) - med(v.human) : null },
            ]),
          ),
        },
      ];
    }),
  ),
};

if (args.includes("--json")) {
  console.log(JSON.stringify(salida, null, 2));
} else {
  console.log(`Corpus v1.2 · particiones: ${partesPedidas.join(", ")}`);
  console.log(`Reglas del pack: ${pack.rules.length} · stable: ${stable.size} · han disparado aquí: ${todasDisparadas.size} (${[...todasDisparadas].filter((id) => stable.has(id)).length} stable)`);
  for (const r of REGISTROS) {
    const R = porRegistro[r];
    console.log(`\n[${r}] ${R.textos} textos${R.faltan ? `, ${R.faltan} sin descargar` : ""} · disparan ${R.disparadas.size} reglas (${[...R.disparadas].filter((id) => stable.has(id)).length} stable)`);
    if (partesPedidas.includes("holdout")) {
      console.log(`  holdout: ${R.n.human} humanos, ${R.n.ai} IA · sin índice por texto corto: ${R.cortos.holdout}`);
      for (const [k, v] of Object.entries(salida.por_registro[r].medianas)) {
        const nombre = { todo: "con todas las reglas", sinRitmo: "sin las dos de ritmo", soloStable: "solo con las stable" }[k];
        console.log(`    ${nombre.padEnd(24)} humano ${String(v.human).padStart(5)} · IA ${String(v.ai).padStart(5)} · separación ${v.separacion}`);
      }
    }
  }
  console.log(`\nLas seis reglas stable sin evidencia de corpus en v1.0 ni v1.1:`);
  for (const [id, porReg] of Object.entries(salida.seis_sin_evidencia)) {
    const tot = REGISTROS.reduce((a, r) => a + porReg[r].human + porReg[r].ai, 0);
    const detalle = REGISTROS.map((r) => `${r} ${porReg[r].ai}IA/${porReg[r].human}H`).join(" · ");
    console.log(`  ${id.padEnd(34)} ${tot ? detalle : "sigue sin disparar"}`);
  }
  const mudas = salida.stable_mudas_en_v1_2;
  console.log(`\nReglas stable que no disparan en v1.2: ${mudas.length}`);
  for (const m of mudas) console.log(`  ${m}`);
}
