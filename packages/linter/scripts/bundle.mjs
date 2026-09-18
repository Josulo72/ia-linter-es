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
// El bundle resuelve packageRoot() como el directorio padre de dist/: copiamos ahí lo que necesita en ejecución
// (el Rule Pack y situaciones.yml, que usa --profile auto).
fs.mkdirSync(path.join(outdir, "rulepack"), { recursive: true });
fs.copyFileSync(path.join(root, "rulepack", "rulepack.json"), path.join(outdir, "rulepack", "rulepack.json"));
fs.mkdirSync(path.join(outdir, "rules"), { recursive: true });
fs.copyFileSync(path.join(root, "rules", "situaciones.yml"), path.join(outdir, "rules", "situaciones.yml"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
fs.writeFileSync(path.join(outdir, "package.json"), JSON.stringify({ name: pkg.name, version: pkg.version, type: "module", private: true }, null, 2) + "\n");
console.log(`Bundle: ${path.relative(process.cwd(), path.join(outdir, "dist", "cli.mjs"))}`);

// Las integraciones que se distribuyen sueltas (Action, plugin de Claude Code) llevan su copia del bundle.
// Es un artefacto generado: no se commitea, se incluye al publicar.
const repo = path.resolve(root, "..", "..");
// Copia recursiva a mano: fs.cpSync aborta el proceso sin error en este Windows.
const copiar = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copiar(a, b);
    else fs.copyFileSync(a, b);
  }
};
for (const dest of [path.join(repo, "integrations", "github-action", "bundle"), path.join(repo, "integrations", "claude-code", "bundle")]) {
  if (!fs.existsSync(path.dirname(dest))) continue;
  fs.rmSync(dest, { recursive: true, force: true });
  copiar(outdir, dest);
  console.log(`Bundle copiado: ${path.relative(repo, dest)}`);
}
