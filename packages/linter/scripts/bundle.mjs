// Genera un bundle autocontenido de la CLI (un solo archivo + rulepack) para las integraciones.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(root, "dist", "bundle");
fs.rmSync(outdir, { recursive: true, force: true });
await build({
  entryPoints: [path.join(root, "dist", "cli", "main.js")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(outdir, "dist", "cli.mjs"),
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: "warning",
});
// El bundle resuelve packageRoot() como el directorio padre de dist/: copiamos ahí lo que necesita en ejecución.
fs.mkdirSync(path.join(outdir, "rulepack"), { recursive: true });
fs.copyFileSync(path.join(root, "rulepack", "rulepack.json"), path.join(outdir, "rulepack", "rulepack.json"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
fs.writeFileSync(path.join(outdir, "package.json"), JSON.stringify({ name: pkg.name, version: pkg.version, type: "module", private: true }, null, 2) + "\n");
console.log(`Bundle: ${path.relative(process.cwd(), path.join(outdir, "dist", "cli.mjs"))}`);
