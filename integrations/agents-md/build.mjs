#!/usr/bin/env node
// Genera escribir-en-espanol.md: la guía (integrations/claude-code/guia/humano.md) más la instrucción transversal de
// revisión, para pegarla en el AGENTS.md de un proyecto (Codex y cualquier asistente que lo lea). No es una skill:
// vale para todo lo que el asistente escriba, haga la tarea que haga.
//
// Uso: node integrations/agents-md/build.mjs          escribe el archivo
//      node integrations/agents-md/build.mjs --check  sale con 1 si el archivo del repositorio no está al día
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const SALIDA = path.join(aqui, "escribir-en-espanol.md");
const GUIA = path.join(aqui, "..", "claude-code", "guia", "humano.md");

export function generar() {
  const guia = fs.readFileSync(GUIA, "utf8").replace(/\r\n/g, "\n").trim();
  return [
    "<!-- Generado por integrations/agents-md/build.mjs a partir de integrations/claude-code/guia/humano.md. No se edita a mano. -->",
    "",
    "# Escribir en español",
    "",
    "Esto vale para todo lo que escribas en este proyecto, hagas la tarea que hagas y uses la herramienta que uses.",
    "",
    guia,
    "",
    "## Después de escribir",
    "",
    "Cuando escribas un archivo de texto para que lo lea una persona (un README, un correo, una publicación), pásale el linter:",
    "",
    "```",
    "npx textoneitor lint <archivo> --profile auto --format revision",
    "```",
    "",
    "`--profile auto` elige el perfil por la ruta. Para un texto sin archivo, como una respuesta, pásalo por la entrada estándar con el perfil de la situación:",
    "",
    "```",
    "npx textoneitor lint --stdin --stdin-filename respuesta.md --profile chat --format revision",
    "```",
    "",
    "Lo que devuelve es orientación, no órdenes. Decide tú qué corriges, qué mantienes y cómo lo adaptas al contexto, y si un hallazgo no aplica, déjalo. Si reescribes, cambia la frase entera en vez de darle la vuelta a las palabras, y no alternes frases largas y cortas por sistema, que es el defecto contrario.",
    "",
  ].join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const nuevo = generar();
  if (process.argv.includes("--check")) {
    const actual = fs.existsSync(SALIDA) ? fs.readFileSync(SALIDA, "utf8").replace(/\r\n/g, "\n") : "";
    if (actual !== nuevo) {
      console.error("integrations/agents-md/escribir-en-espanol.md no está al día con la guía: node integrations/agents-md/build.mjs");
      process.exit(1);
    }
    console.log("escribir-en-espanol.md al día");
  } else {
    fs.writeFileSync(SALIDA, nuevo, "utf8");
    console.log(`Escrito ${path.relative(process.cwd(), SALIDA)}`);
  }
}
