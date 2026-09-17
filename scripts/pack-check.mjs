#!/usr/bin/env node
/**
 * Empaquetado instalable: hace `pnpm pack`, instala el tarball en un directorio temporal
 * y ejecuta la CLI desde allí. Comprueba que el paquete lleva lo que necesita para funcionar
 * y que los resultados son los mismos que en el repositorio.
 * Uso: node scripts/pack-check.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = path.join(root, "packages", "linter");
const failures = [];
const fail = (m) => { failures.push(m); console.log(`  ✘ ${m}`); };
const ok = (m) => console.log(`  ✔ ${m}`);
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32", ...opts });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ial-pack-"));
try {
  console.log("Empaquetado");
  const pack = sh("pnpm", ["pack", "--pack-destination", tmp], { cwd: pkgDir });
  if (pack.status !== 0) {
    fail(`pnpm pack falló: ${(pack.stderr || pack.stdout).trim().split("\n").slice(-3).join(" ")}`);
    salir();
  }
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith(".tgz"));
  if (!tgz) { fail("pnpm pack no dejó ningún .tgz"); salir(); }
  ok(`tarball: ${tgz}`);

  // Contenido mínimo: la CLI, la API, el Rule Pack compilado y los perfiles.
  const dentro = listarTar(path.join(tmp, tgz));
  if (dentro.length === 0) fail("el tarball no tiene archivos o no se puede leer");
  else {
    for (const req of ["dist/cli/main.js", "dist/api/index.js", "rulepack/rulepack.json", "package.json", "LICENSE", "README.md"]) {
      if (!dentro.includes(req)) fail(`el tarball no incluye ${req}`);
    }
    if (!dentro.some((f) => f.startsWith("rules/profiles/"))) fail("el tarball no incluye rules/profiles/");
    if (dentro.some((f) => f.startsWith("test/") || f.startsWith("src/"))) fail("el tarball incluye fuentes o tests");
    if (failures.length === 0) ok(`${dentro.length} archivos, con CLI, API, Rule Pack, perfiles y licencia`);
  }

  console.log("Instalación en un directorio limpio");
  const proyecto = path.join(tmp, "proyecto");
  fs.mkdirSync(proyecto, { recursive: true });
  fs.writeFileSync(path.join(proyecto, "package.json"), JSON.stringify({ name: "prueba-instalacion", private: true, version: "1.0.0" }, null, 2), "utf8");
  const install = sh("npm", ["install", "--no-audit", "--no-fund", "--loglevel", "error", path.join(tmp, tgz)], { cwd: proyecto });
  if (install.status !== 0) {
    fail(`npm install falló: ${(install.stderr || install.stdout).trim().split("\n").slice(-3).join(" ")}`);
    salir();
  }
  ok("instalado con npm install desde el tarball");

  console.log("Ejecución desde la instalación");
  const bin = path.join(proyecto, "node_modules", "ia-linter-es", "dist", "cli", "main.js");
  if (!fs.existsSync(bin)) { fail(`no existe ${path.relative(proyecto, bin)}`); salir(); }
  const muestra = path.join(proyecto, "muestra.md");
  fs.copyFileSync(path.join(root, "examples", "muestra-ia.md"), muestra);

  const version = sh(process.execPath, [bin, "--version"], { cwd: proyecto, shell: false });
  if (version.status !== 0 || !/^\d+\.\d+\.\d+/.test(version.stdout.trim())) fail("la CLI instalada no responde a --version");
  else ok(`ia-linter-es ${version.stdout.trim()}`);

  const reglas = sh(process.execPath, [bin, "rules", "list", "--json"], { cwd: proyecto, shell: false });
  if (reglas.status !== 0) fail("rules list falla en la instalación");
  else {
    const n = JSON.parse(reglas.stdout).length;
    const enRepo = JSON.parse(sh(process.execPath, [path.join(pkgDir, "dist", "cli", "main.js"), "rules", "list", "--json"], { shell: false }).stdout).length;
    if (n !== enRepo) fail(`el Rule Pack instalado tiene ${n} reglas y el del repositorio ${enRepo}`);
    else ok(`${n} reglas, las mismas que en el repositorio`);
  }

  const desdeInstalacion = sh(process.execPath, [bin, "lint", "muestra.md", "-f", "json", "--no-cache", "--fail-on", "never"], { cwd: proyecto, shell: false });
  const desdeRepo = sh(process.execPath, [path.join(pkgDir, "dist", "cli", "main.js"), "lint", "muestra.md", "-f", "json", "--no-cache", "--fail-on", "never"], { cwd: proyecto, shell: false });
  if (desdeInstalacion.status === 2) fail(`lint falla en la instalación: ${desdeInstalacion.stderr.trim()}`);
  else if (desdeInstalacion.stdout !== desdeRepo.stdout) fail("la instalación y el repositorio no dan el mismo JSON");
  else ok("mismo JSON byte a byte que en el repositorio");

  // Comprobación floja de que no hay red: con un proxy apuntando a un puerto muerto, el resultado no cambia.
  // La garantía de verdad es el gate de imports de scripts/gates.mjs.
  const sinRed = sh(process.execPath, [bin, "lint", "muestra.md", "-f", "json", "--no-cache", "--fail-on", "never"], {
    cwd: proyecto,
    shell: false,
    env: { ...process.env, HTTP_PROXY: "http://127.0.0.1:9", HTTPS_PROXY: "http://127.0.0.1:9", NO_PROXY: "" },
  });
  if (sinRed.stdout !== desdeRepo.stdout) fail("el resultado cambia con un proxy inválido");
  else ok("mismo resultado con un proxy inválido");
} finally {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* en Windows npm deja archivos abiertos a veces; no es motivo de fallo */
  }
}

salir();

function salir() {
  console.log(failures.length ? `\n${failures.length} fallo(s) de empaquetado` : "\nEmpaquetado en verde");
  process.exit(failures.length ? 1 : 0);
}

/** Lista un .tgz leyendo las cabeceras del tar, sin depender del `tar` del sistema. */
function listarTar(file) {
  const buf = gunzipSync(fs.readFileSync(file));
  const names = [];
  for (let off = 0; off + 512 <= buf.length; ) {
    const header = buf.subarray(off, off + 512);
    if (header.every((b) => b === 0)) break;
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    const size = parseInt(header.subarray(124, 136).toString("ascii").replace(/\0.*$/, "").trim() || "0", 8);
    const type = String.fromCharCode(header[156]);
    if (name && (type === "0" || type === "\0")) names.push(name.replace(/^package\//, ""));
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return names;
}
