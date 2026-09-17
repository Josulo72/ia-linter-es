import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPO_ROOT = path.resolve(PKG_ROOT, "..", "..");
export const CLI = path.join(PKG_ROOT, "dist", "cli", "main.js");
export const BUNDLE = path.join(PKG_ROOT, "dist", "bundle", "dist", "cli.mjs");

export const AI_TEXT = fs.readFileSync(path.join(REPO_ROOT, "examples", "muestra-ia.md"), "utf8");
export const HUMAN_TEXT = fs.readFileSync(path.join(REPO_ROOT, "examples", "muestra-editada.md"), "utf8");

export function tmpProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ial-e2e-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return dir;
}

export function run(entry: string, args: string[], opts: { cwd?: string; input?: string; env?: Record<string, string> } = {}) {
  const r = spawnSync(process.execPath, [entry, ...args], {
    cwd: opts.cwd,
    input: opts.input,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", ...(opts.env ?? {}) },
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

export const cli = (args: string[], opts: { cwd?: string; input?: string } = {}) => run(CLI, args, opts);
