#!/usr/bin/env node
// Hook SessionStart: carga la guía de escritura (guia/humano.md) como contexto compartido de toda la sesión.
// Convive con cualquier estilo de salida y con cualquier skill: no ocupa ninguno de esos huecos.
// Encendido cuando se carga el plugin, porque es la pieza principal. IA_LINTER_GUIA=0 lo apaga.
import fs from "node:fs";
import path from "node:path";
import { raizPlugin } from "./comun.mjs";

if (/^(0|false|no)$/i.test(process.env.IA_LINTER_GUIA ?? "")) process.exit(0);

let guia;
try {
  guia = fs.readFileSync(path.join(raizPlugin(), "guia", "humano.md"), "utf8");
} catch {
  process.exit(0); // sin guía no hay nada que cargar, pero la sesión arranca igual
}
// Los comentarios de supresión del linter son para el propio repositorio, no para el modelo.
guia = guia.replace(/<!--\s*(?:textoneitor|ia-linter)-[\s\S]*?-->\n*/g, "").trim();

const contexto = [
  "Guía de escritura en español (plugin textoneitor). Vale para todo lo que escribas en esta sesión, en la conversación y en los archivos, uses la skill que uses.",
  "Si los hooks de revisión están encendidos, al terminar te pueden devolver orientación del linter: son señales, no órdenes, y decides tú qué corriges.",
  "",
  guia,
].join("\n");

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: contexto } }) + "\n");
