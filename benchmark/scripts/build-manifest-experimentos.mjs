#!/usr/bin/env node
// Construye corpus/manifests/experimentos.yml a partir de corpus/policy/experimentos.yml.
// Las tandas de experimento quedan registradas como la clase IA del benchmark (modelo, prompt, arnés, hash),
// pero en su propio manifiesto: no entran en development, holdout ni challenge.
// Sin red. Salida determinista.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const corpus = path.join(root, "corpus");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const words = (s) => (s.match(/\S+/g) ?? []).length;
const die = (m) => { console.error(`ERROR: ${m}`); process.exit(1); };

const exp = parse(fs.readFileSync(path.join(corpus, "policy", "experimentos.yml"), "utf8"));
const prompts = parse(fs.readFileSync(path.join(corpus, "policy", "prompts-v1.1.yml"), "utf8"));
const byId = new Map(prompts.prompts.map((p) => [p.id, p]));

const samples = [];
for (const t of exp.tandas) {
  const targets = t.subdirs ? t.subdirs.map((s) => ({ sub: s, rel: `${t.dir}/${s}` })) : [{ sub: null, rel: t.dir }];
  for (const { sub, rel } of targets) {
    for (const pid of t.prompts) {
      const p = byId.get(pid);
      if (!p) die(`${t.id}: prompt ${pid} sin registrar en prompts-v1.1.yml`);
      const name = `${t.prefix ?? ""}${pid}.md`;
      const file = `${rel}/${name}`;
      const abs = path.join(corpus, file);
      if (!fs.existsSync(abs)) die(`${t.id}: falta ${file}`);
      // Normaliza finales de línea y espacio final; es la única edición sobre el texto bruto.
      const raw = fs.readFileSync(abs, "utf8");
      const text = raw.replace(/\r\n?/g, "\n").trimEnd() + "\n";
      if (text !== raw) fs.writeFileSync(abs, text, "utf8");
      samples.push({
        id: sub ? `${t.id}-${sub}-${pid}` : `${t.id}-${pid}`,
        class: "ai", tanda: t.id, variant: sub ?? null, file, register: "cotidiano", theme: p.theme,
        prompt_id: pid, condition: "guiada", origin_partition: p.partition,
        provider: exp.provider, model: p.model, generated: exp.generated, harness: exp.harness,
        system_prompt: "el del arnés; no visible", parameters: "los del arnés; no controlables",
        edits: "ninguna (solo finales de línea)", words: words(text), sha256: sha(text),
      });
    }
    const listed = new Set(t.prompts.map((pid) => `${t.prefix ?? ""}${pid}.md`));
    for (const f of fs.readdirSync(path.join(corpus, rel), { withFileTypes: true })) {
      if (f.isDirectory()) continue;
      if (!listed.has(f.name)) die(`${rel}/${f.name}: archivo sin entrada en experimentos.yml`);
    }
  }
}

const body = stringify({ schema_version: 1, corpus_version: "1.1", partition: "experimentos", samples }, { lineWidth: 0 });
fs.writeFileSync(path.join(corpus, "manifests", "experimentos.yml"), `# Generado por benchmark/scripts/build-manifest-experimentos.mjs. No editar a mano.\n${body}`, "utf8");
const porTanda = exp.tandas.map((t) => `${t.id}: ${samples.filter((s) => s.tanda === t.id).length}`).join(", ");
console.log(`experimentos: ${samples.length} muestras (${porTanda})`);
