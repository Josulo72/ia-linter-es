#!/usr/bin/env node
// Hook Stop: pasa el linter a la última respuesta y, si ve señales de texto generado, le devuelve orientación a la IA
// para que decida qué corrige. No reescribe nada. Da igual qué skill o qué estilo de salida se esté usando.
// Desactivado por defecto: solo actúa si IA_LINTER_REVISAR vale 1, true o sí.
//
// Entrada (stdin, JSON del hook): session_id, prompt_id, cwd, last_assistant_message, hook_event_name.
// Salida: exit 0 deja pasar; exit 2 bloquea y el texto de stderr es lo que lee el modelo.
// Tope: como mucho MAX_INTENTOS devoluciones por cada prompt_id, para no dejar la sesión dando vueltas.
import { MAX_INTENTOS, MIN_PALABRAS, encendido, guardarIntentos, intentos, leerEntrada, mensaje, nivel, palabras, resolverCli, revisar } from "./comun.mjs";

const PERFIL = process.env.IA_LINTER_REVISAR_PERFIL ?? "chat";

if (!encendido("IA_LINTER_REVISAR")) process.exit(0);
const payload = leerEntrada();
if (!payload) process.exit(0);

const texto = String(payload.last_assistant_message ?? "").trim();
// Respuestas muy cortas no tienen ritmo que medir y el índice no se calcula.
if (!texto || palabras(texto) < MIN_PALABRAS) process.exit(0);

const clave = `respuesta:${payload.prompt_id ?? payload.session_id ?? ""}`;
const n = intentos(payload, clave);
if (n >= MAX_INTENTOS) process.exit(0);

const cli = resolverCli(payload.cwd);
if (!cli) process.exit(0); // sin CLI no se revisa nada, pero tampoco se estorba

// El nombre lógico hace que se analice como Markdown: así los bloques de código quedan fuera
// del recuento de frases y los guiones de las opciones no se toman por rayas de inciso.
const r = revisar({ cli, texto, nombre: "respuesta.md", args: ["--profile", PERFIL], cwd: payload.cwd, cortan: nivel().cortan });
if (!r) process.exit(0);
if (!r.hallazgos.length) {
  guardarIntentos(payload, clave, 0);
  process.exit(0);
}

guardarIntentos(payload, clave, n + 1);
process.stderr.write(mensaje(`El linter ha visto señales de texto generado en la respuesta que acabas de dar (perfil ${PERFIL}):`, r.cuerpo));
process.exit(2);
