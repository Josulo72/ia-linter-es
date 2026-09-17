import fs from "node:fs";
import path from "node:path";
import type { BaselineEntry, BaselineFile, FileResult } from "../contracts/index.js";
import { SCHEMA_VERSION } from "../contracts/index.js";

export function readBaseline(file: string): BaselineFile {
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as BaselineFile;
  if (raw.schema_version !== SCHEMA_VERSION) throw new Error(`baseline: schema_version ${raw.schema_version} no soportada`);
  if (!Array.isArray(raw.entries)) throw new Error("baseline: falta entries");
  return raw;
}

export function writeBaseline(file: string, data: BaselineFile): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** Construye entradas de baseline a partir de resultados (solo hallazgos no suprimidos inline). */
export function entriesFromResults(files: FileResult[], reason?: string): BaselineEntry[] {
  const entries: BaselineEntry[] = [];
  for (const f of files) {
    for (const x of f.findings) {
      if (x.suppressed?.by === "inline") continue;
      const e: BaselineEntry = { rule: x.rule, path: f.path.replace(/\\/g, "/"), fingerprint: x.fingerprint };
      if (reason) e.reason = reason;
      entries.push(e);
    }
  }
  entries.sort((a, b) => a.path.localeCompare(b.path) || a.rule.localeCompare(b.rule) || a.fingerprint.localeCompare(b.fingerprint));
  return entries;
}

export function createBaseline(files: FileResult[], reason?: string, now = new Date()): BaselineFile {
  return { schema_version: SCHEMA_VERSION, created: now.toISOString(), entries: entriesFromResults(files, reason) };
}

/**
 * Marca como suprimidos por baseline los hallazgos cuya huella está en la baseline.
 * Devuelve estadísticas: coincidencias y entradas obsoletas (ya no aparecen).
 */
export function applyBaseline(files: FileResult[], baseline: BaselineFile): { matched: number; stale: BaselineEntry[] } {
  const index = new Map<string, BaselineEntry>();
  for (const e of baseline.entries) index.set(`${e.path}\0${e.fingerprint}`, e);
  const seen = new Set<string>();
  let matched = 0;
  for (const f of files) {
    const p = f.path.replace(/\\/g, "/");
    for (const x of f.findings) {
      if (x.suppressed) continue;
      const key = `${p}\0${x.fingerprint}`;
      const e = index.get(key);
      if (e) {
        x.suppressed = { by: "baseline", reason: e.reason };
        seen.add(key);
        matched++;
      }
    }
  }
  const scanned = new Set(files.map((f) => f.path.replace(/\\/g, "/")));
  const stale = baseline.entries.filter((e) => scanned.has(e.path) && !seen.has(`${e.path}\0${e.fingerprint}`));
  return { matched, stale };
}

/** Actualiza una baseline: elimina obsoletas de los archivos escaneados y conserva el resto; no añade hallazgos nuevos salvo que se indique. */
export function updateBaseline(
  existing: BaselineFile,
  files: FileResult[],
  opts: { addNew: boolean; reason?: string; now?: Date },
): BaselineFile {
  const scanned = new Set(files.map((f) => f.path.replace(/\\/g, "/")));
  const current = new Set(entriesFromResults(files).map((e) => `${e.path}\0${e.fingerprint}`));
  const kept = existing.entries.filter((e) => !scanned.has(e.path) || current.has(`${e.path}\0${e.fingerprint}`));
  const entries = [...kept];
  if (opts.addNew) {
    const have = new Set(kept.map((e) => `${e.path}\0${e.fingerprint}`));
    for (const e of entriesFromResults(files, opts.reason)) {
      const k = `${e.path}\0${e.fingerprint}`;
      if (!have.has(k)) {
        entries.push(e);
        have.add(k);
      }
    }
  }
  entries.sort((a, b) => a.path.localeCompare(b.path) || a.rule.localeCompare(b.rule) || a.fingerprint.localeCompare(b.fingerprint));
  return { schema_version: SCHEMA_VERSION, created: (opts.now ?? new Date()).toISOString(), entries };
}
