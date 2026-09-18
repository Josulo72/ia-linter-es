#!/usr/bin/env node
// Hook PostToolUse para Write y Edit: cuando cualquier skill o la propia IA escribe un archivo de texto, lo pasa por el
// linter con el perfil de su situación y, si ve señales de texto generado, le devuelve orientación a la misma IA.
// No reescribe nada. Solo mira los tipos de archivo declarados en situaciones.yml (`--profile auto`): el resto se deja.
// Desactivado por defecto: solo actúa si IA_LINTER_REVISAR_ARCHIVOS vale 1, true o sí.
//
// Entrada (stdin, JSON del hook): session_id, cwd, tool_name, tool_input.file_path.
// Salida: exit 0 deja seguir; exit 2 y el texto de stderr llega al modelo como resultado de la herramienta.
// Tope: como mucho MAX_INTENTOS devoluciones por archivo con el mismo contenido, para no dejar la sesión dando vueltas.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { MAX_INTENTOS, MIN_PALABRAS, encendido, guardarIntentos, intentos, leerEntrada, mensaje, nivel, palabras, resolverCli, revisar } from "./comun.mjs";

if (!encendido("IA_LINTER_REVISAR_ARCHIVOS")) process.exit(0);
const payload = leerEntrada();
if (!payload) process.exit(0);

const archivo = payload.tool_input?.file_path ?? payload.tool_input?.path;
if (typeof archivo !== "string" || !archivo) process.exit(0);
const cwd = payload.cwd && fs.existsSync(payload.cwd) ? payload.cwd : process.cwd();
const abs = path.resolve(cwd, archivo);
// Solo archivos del proyecto: la ruta relativa es la que decide la situación y la que ven los overrides de ia-linter.yml.
const rel = path.relative(cwd, abs).replace(/\\/g, "/");
if (!rel || rel.startsWith("../") || path.isAbsolute(rel)) process.exit(0);

let texto;
try {
  texto = fs.readFileSync(abs, "utf8");
} catch {
  process.exit(0);
}
if (palabras(texto) < MIN_PALABRAS) process.exit(0);

// La clave es el archivo y su contenido, no el turno (el evento de PostToolUse no siempre trae prompt_id): con el mismo
// contenido no insiste más del tope; si el archivo cambia, se revisa otra vez.
const clave = `archivo:${rel}:${createHash("sha256").update(texto).digest("hex").slice(0, 16)}`;
const n = intentos(payload, clave);
if (n >= MAX_INTENTOS) process.exit(0);

const cli = resolverCli(cwd);
if (!cli) process.exit(0);

// `--profile auto`: si la ruta no corresponde a ninguna situación, la CLI no analiza nada y aquí no se dice nada.
const r = revisar({ cli, texto, nombre: rel, args: ["--profile", "auto"], cwd, cortan: nivel().cortan });
if (!r) process.exit(0);
if (!r.hallazgos.length) {
  guardarIntentos(payload, clave, 0);
  process.exit(0);
}

guardarIntentos(payload, clave, n + 1);
process.stderr.write(mensaje(`El linter ha visto señales de texto generado en ${rel}, que acabas de escribir:`, r.cuerpo));
process.exit(2);
