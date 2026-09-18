import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { PathOverride, ProfileName } from "../contracts/index.js";
import { rulesDir } from "../paths.js";
import { matchesAny } from "./glob.js";
import { PROFILES } from "./index.js";

/** Una situación de escritura: su perfil, su viñeta en la guía y los archivos de texto que le corresponden. */
export interface Situacion {
  id: string;
  perfil: ProfileName;
  guia: string;
  archivos: string[];
}

/** Lee `rules/situaciones.yml` del paquete (o el archivo indicado) y lo valida. */
export function loadSituaciones(file = path.join(rulesDir(), "situaciones.yml")): Situacion[] {
  if (!fs.existsSync(file)) throw new Error(`no existe ${file}`);
  const raw = parseYaml(fs.readFileSync(file, "utf8")) as { schema_version?: number; situaciones?: unknown };
  if (raw?.schema_version !== 1 || !Array.isArray(raw.situaciones)) throw new Error(`${file}: hace falta schema_version: 1 y una lista situaciones`);
  const vistos = new Set<string>();
  return raw.situaciones.map((s: Record<string, unknown>, i: number) => {
    const donde = `${file}: situaciones[${i}]`;
    if (typeof s.id !== "string" || !s.id) throw new Error(`${donde}: falta id`);
    if (vistos.has(s.id)) throw new Error(`${donde}: id repetido ${s.id}`);
    vistos.add(s.id);
    if (!PROFILES.includes(s.perfil as ProfileName)) throw new Error(`${donde}: perfil desconocido ${String(s.perfil)}`);
    if (typeof s.guia !== "string" || !s.guia) throw new Error(`${donde}: falta guia`);
    const archivos = s.archivos ?? [];
    if (!Array.isArray(archivos) || archivos.some((a) => typeof a !== "string")) throw new Error(`${donde}: archivos tiene que ser una lista de globs`);
    return { id: s.id, perfil: s.perfil as ProfileName, guia: s.guia, archivos: archivos as string[] };
  });
}

/** La primera situación cuyos archivos coinciden con la ruta, o null. */
export function situacionDe(relPath: string, situaciones: Situacion[]): Situacion | null {
  const p = relPath.replace(/\\/g, "/").replace(/^\.\//, "");
  return situaciones.find((s) => s.archivos.length && matchesAny(p, s.archivos)) ?? null;
}

/**
 * `--profile auto` como overrides de perfil por ruta, en orden inverso para que gane la primera situación que coincide
 * (en los overrides gana el último). Van delante de los del proyecto, que así siguen mandando.
 */
export function overridesDeSituaciones(situaciones: Situacion[]): PathOverride[] {
  return situaciones.filter((s) => s.archivos.length).map((s) => ({ files: s.archivos, profile: s.perfil })).reverse();
}
