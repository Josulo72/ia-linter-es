// Piezas comunes del corpus v1.3: lotes de encargos, texto exacto de cada lote y composición del holdout.
// Lo usan generacion-v1.3.mjs, build-manifests-v1.3.mjs y scripts/corpus-check.mjs, para que las tres cosas
// se calculen de una sola manera.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CORPUS = path.join(root, "corpus-v1.3");
export const PROMPTS_FILE = path.join(root, "corpus", "policy", "prompts-v1.3.yml");
export const PARTITIONS = ["development", "holdout", "challenge"];
export const REGISTROS = ["correo", "readme", "redes"];
export const sha = (s) => createHash("sha256").update(s).digest("hex");
export const words = (s) => (s.match(/\S+/g) ?? []).length;

export const leerPrompts = () => parse(fs.readFileSync(PROMPTS_FILE, "utf8"));

/** Id de la muestra IA y partición donde va, según la condición. */
export const idMuestra = (p, cond) => (cond === "base" ? `ai-${p.id}` : `ai-g-${p.id}`);
export const particion = (p, cond) => (cond === "base" ? p.partition : "challenge");

/** El encargo de un tema, con la plantilla de su registro. */
export const encargo = (prompts, p) => prompts.templates[p.register].replace("{tema}", p.tema);

/** La guía tal como se le pasa al modelo: sin los comentarios de supresión del linter, que son del repositorio. */
export function guiaParaModelo(prompts) {
  const g = fs.readFileSync(path.join(root, prompts.guide), "utf8").replace(/\r\n/g, "\n");
  return g.replace(/<!--\s*ia-linter-[\s\S]*?-->\n*/g, "").trim();
}

/**
 * Lotes deterministas: condición (base, guiada) × registro × partición de origen, en el orden del archivo, de `lote` en `lote`.
 * Con 90 temas y lotes de 5 salen 36 lotes, L01 a L36.
 */
export function lotes(prompts) {
  const out = [];
  for (const cond of ["base", "guiada"]) {
    for (const reg of REGISTROS) {
      for (const part of ["development", "holdout"]) {
        const ps = prompts.prompts.filter((p) => p.register === reg && p.partition === part);
        for (let i = 0; i < ps.length; i += prompts.lote) {
          out.push({ id: `L${String(out.length + 1).padStart(2, "0")}`, cond, register: reg, origin: part, prompts: ps.slice(i, i + prompts.lote) });
        }
      }
    }
  }
  return out;
}

/** El texto exacto que se pega en ChatGPT para un lote. */
export function textoLote(prompts, lote) {
  const ids = lote.prompts.map((p) => idMuestra(p, lote.cond));
  const partes = [];
  if (lote.cond === "guiada") partes.push(prompts.guided_prefix, "", guiaParaModelo(prompts), "", "---", "");
  partes.push(prompts.batch_intro.replace("{n}", String(ids.length)).replace("{ejemplo}", ids[0]), "", "Encargos:", "");
  lote.prompts.forEach((p, i) => partes.push(`[${ids[i]}] ${encargo(prompts, p)}`, ""));
  return partes.join("\n").trimEnd() + "\n";
}

/**
 * Composición del holdout: qué muestras humanas (id y hash) y qué encargos (id y hash del encargo) lo forman.
 * Se congela antes de generar los textos IA (preregistro), para que después no se pueda cambiar qué entra.
 */
export function composicionHoldout(manifest, prompts) {
  const porId = new Map(prompts.prompts.map((p) => [p.id, p]));
  const humanos = manifest.samples.filter((s) => s.class === "human").map((s) => `${s.id}:${s.sha256}`);
  const ia = [...manifest.samples.filter((s) => s.class === "ai"), ...(manifest.pendientes ?? [])].map((s) => {
    const p = porId.get(s.prompt_id);
    return `${s.id}:${p ? sha(encargo(prompts, p)) : "sin-encargo"}`;
  });
  return sha([...humanos.sort(), ...ia.sort()].join("\n"));
}
