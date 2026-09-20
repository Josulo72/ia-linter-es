// Genera el motor para el navegador: un solo archivo ESM, sin dependencias de Node.
// El Rule Pack no va dentro; se carga desde fuera (ver src/web/index.ts).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outfile = path.join(root, "dist", "web", "engine.mjs");

const result = await build({
  entryPoints: [path.join(root, "dist", "web", "index.js")],
  bundle: true,
  // "neutral" y no "browser": con browser, esbuild aplica el campo `browser` de los
  // paquetes y decode-named-character-reference pasa a decodificar entidades con el DOM.
  // Queremos el mismo código en el navegador y en el test de paridad, que corre en Node.
  platform: "neutral",
  target: "es2022",
  format: "esm",
  outfile,
  alias: { "node:crypto": path.join(root, "dist", "web", "node-crypto-shim.js") },
  // Sin el campo "browser" de los paquetes: decode-named-character-reference trae una
  // variante que decodifica entidades con el DOM, y queremos el mismo código en el
  // navegador y en el test de paridad, que corre en Node.
  mainFields: ["module", "main"],
  conditions: ["import", "default"],
  legalComments: "none",
  metafile: true,
  logLevel: "warning",
});

// Si algo del motor arrastrase el sistema de archivos, el bundle dejaría de ser ejecutable
// en el navegador sin avisar. Mejor que reviente aquí.
const code = fs.readFileSync(outfile, "utf8");
for (const mod of ["node:fs", "node:path", "node:crypto", "node:url", "node:os", "fast-glob"]) {
  if (code.includes(`"${mod}"`) || code.includes(`'${mod}'`)) {
    throw new Error(`El bundle web referencia ${mod}. Revisa qué módulo lo arrastra.`);
  }
}

const kb = (fs.statSync(outfile).size / 1024).toFixed(1);
const packKb = (fs.statSync(path.join(root, "rulepack", "rulepack.json")).size / 1024).toFixed(1);
console.log(`Motor web: ${path.relative(process.cwd(), outfile)} (${kb} kB) + rulepack ${packKb} kB`);
fs.writeFileSync(path.join(root, "dist", "web", "engine.meta.json"), JSON.stringify(result.metafile), "utf8");
