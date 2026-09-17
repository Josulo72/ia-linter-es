import { describe, expect, it } from "vitest";
import path from "node:path";
import * as api from "../src/api/index.js";
import { REGISTER_ADJUSTMENTS } from "../src/config/index.js";
import { AI_TEXT, HUMAN_TEXT, cli, tmpProject } from "./helpers.js";

describe("API programática", () => {
  it("lintText analiza texto y Markdown", () => {
    const r = api.lintText(AI_TEXT, { format: "markdown", config: {} });
    expect(r.findings.length).toBeGreaterThan(15);
    expect(r.score.index).toBeGreaterThan(30);
    const h = api.lintText(HUMAN_TEXT, { format: "markdown", config: {} });
    expect(h.findings.filter((f) => f.level !== "info")).toHaveLength(0);
  });

  it("lintText con configuración en línea", () => {
    const r = api.lintText(AI_TEXT, { format: "markdown", config: { rules: { "lexico/*": "off" } } });
    expect(r.findings.some((f) => f.rule.startsWith("lexico/"))).toBe(false);
    expect(() => api.lintText("x", { config: { profile: "nope" as never } })).toThrow(/inválida/);
  });

  it("lintFile y lintProject coinciden con la CLI (paridad)", () => {
    const dir = tmpProject({ "a.md": AI_TEXT, "b.txt": HUMAN_TEXT, "ia-linter.yml": "fail_on: never\n" });
    const project = api.lintProject({ cwd: dir, noCache: true });
    const viaCli = JSON.parse(cli(["lint", "-f", "json", "--no-cache"], { cwd: dir }).stdout);
    expect(JSON.parse(api.reportJson(project))).toEqual(viaCli);
    const file = api.lintFile(path.join(dir, "a.md"), { cwd: dir });
    expect(file.findings).toEqual(project.files[0]!.findings);
  });

  it("explainRule, listRules y loadConfig", () => {
    expect(api.explainRule("retorica/triada")?.detector).toBe("structure");
    expect(api.explainRule("x/y")).toBeNull();
    expect(api.listRules().length).toBeGreaterThanOrEqual(24);
    const dir = tmpProject({ "ia-linter.yml": "profile: marketing\n" });
    expect(api.loadConfig({ cwd: dir }).config.profile).toBe("marketing");
  });

  it("documentos cortos: hallazgos sí, índice no", () => {
    const r = api.lintText("Hoy en día, cabe destacar que es importante señalar esto.", { config: {} });
    expect(r.findings.length).toBeGreaterThan(0);
    expect(r.score.index).toBeNull();
  });

  it("los ajustes por registro y los perfiles solo nombran reglas existentes", () => {
    const ids = new Set(api.listRules().map((r) => r.id));
    for (const adj of Object.values(REGISTER_ADJUSTMENTS)) for (const id of Object.keys(adj ?? {})) expect(ids.has(id), id).toBe(true);
  });
});
