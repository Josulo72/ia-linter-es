/**
 * Paridad entre el motor del navegador y el de siempre.
 *
 * La web enseña hallazgos reales, así que si estos dos caminos se separan, la web miente.
 * Se comprueban los tres eslabones: el sha256 propio contra el de Node, el motor web
 * contra la API, y el bundle ya compilado contra la API.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as api from "../src/api/index.js";
import { PROFILES } from "../src/config/core.js";
import { createWebContext, lintText } from "../src/web/index.js";
import { sha256Hex } from "../src/web/sha256.js";
import { AI_TEXT, HUMAN_TEXT, PKG_ROOT } from "./helpers.js";

const pack = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "rulepack", "rulepack.json"), "utf8"));
const ENGINE = path.join(PKG_ROOT, "dist", "web", "engine.mjs");

/** Lo que tiene que coincidir: todo menos el tiempo que tardó. */
const comparable = (r: { path: string; format: string; findings: unknown[]; score: unknown }) => ({
  path: r.path,
  format: r.format,
  findings: r.findings,
  score: r.score,
});

describe("motor web", () => {
  it("el sha256 propio da lo mismo que node:crypto", () => {
    const casos = [
      "",
      "a",
      "retorica/triada\u0000README.md\u0000rápido, sencillo y eficaz\u00000",
      "ñandú ñoño ÁÉÍÓÚ üö · em—dash «angulares»",
      "🧠 emoji fuera del plano básico",
      AI_TEXT,
      "x".repeat(55),
      "x".repeat(56),
      "x".repeat(64),
      "x".repeat(1000),
    ];
    for (const c of casos) {
      expect(sha256Hex(c)).toBe(createHash("sha256").update(c).digest("hex"));
    }
  });

  it("da los mismos hallazgos y el mismo índice que la API, en los ocho perfiles", () => {
    for (const profile of PROFILES) {
      for (const [nombre, texto] of [["ia", AI_TEXT], ["humano", HUMAN_TEXT]] as const) {
        const web = lintText(texto, createWebContext({ pack, profile }), { relPath: "texto.md" });
        const nodo = api.lintText(texto, { config: { profile }, path: "texto.md" });
        expect(comparable(web), `${profile} · ${nombre}`).toEqual(comparable(nodo));
      }
    }
  });

  it("respeta la configuración igual que la API", () => {
    const config = { rules: { "lexico/*": "off" as const }, privacy: { snippets: false } };
    const web = lintText(AI_TEXT, createWebContext({ pack, profile: "readme", config }), { relPath: "README.md" });
    const nodo = api.lintText(AI_TEXT, { config: { profile: "readme", ...config }, path: "README.md" });
    expect(comparable(web)).toEqual(comparable(nodo));
    expect(web.findings.some((f) => f.rule.startsWith("lexico/"))).toBe(false);
  });

  it("el bundle compilado no arrastra Node y coincide con la API", async () => {
    expect(fs.existsSync(ENGINE), "falta dist/web/engine.mjs: ejecuta pnpm build").toBe(true);
    const code = fs.readFileSync(ENGINE, "utf8");
    for (const mod of ["node:fs", "node:path", "node:crypto", "fast-glob"]) {
      expect(code.includes(`"${mod}"`), mod).toBe(false);
    }
    const engine = (await import(pathToFileURL(ENGINE).href)) as typeof import("../src/web/index.js");
    const web = engine.lintText(AI_TEXT, engine.createWebContext({ pack, profile: "readme" }), { relPath: "README.md" });
    const nodo = api.lintText(AI_TEXT, { config: { profile: "readme" }, path: "README.md" });
    expect(comparable(web)).toEqual(comparable(nodo));
  });
});
