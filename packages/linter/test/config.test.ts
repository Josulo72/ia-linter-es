import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defaultConfig, loadConfig, resolveEffectiveRules, validateConfigObject } from "../src/config/index.js";
import { globToRegExp, matchesAny } from "../src/config/glob.js";
import type { CompiledRule } from "../src/contracts/index.js";

function rule(id: string, category: CompiledRule["category"], profiles: CompiledRule["profiles"] = {}): CompiledRule {
  return {
    id, revision: 1, status: "stable", title: id, summary: "", category, scope: "sentence", detector: "regex",
    params: {}, exceptions: {}, default_level: "warning", score: { weight: 1, cap: 5 }, message: "", explanation: "",
    rewrite_guidance: "", profiles,
  };
}

describe("glob", () => {
  it("convierte patrones habituales", () => {
    expect(globToRegExp("**/*.md").test("a/b/c.md")).toBe(true);
    expect(globToRegExp("**/*.md").test("c.md")).toBe(true);
    expect(globToRegExp("docs/*.md").test("docs/x.md")).toBe(true);
    expect(globToRegExp("docs/*.md").test("docs/sub/x.md")).toBe(false);
    expect(globToRegExp("*.{md,txt}").test("deep/x.txt")).toBe(true);
    expect(matchesAny("docs\\a.md", ["docs/**"])).toBe(true);
  });
});

describe("validateConfigObject", () => {
  it("acepta configuración válida", () => {
    expect(validateConfigObject({ profile: "tecnico", rules: { "lexico/x": "off" }, fail_on: "warning" })).toEqual([]);
  });
  it("detecta errores", () => {
    const issues = validateConfigObject({ profile: "otro", rules: { a: "alto" }, extra: 1, max_index: 200 });
    expect(issues.map((i) => i.path).sort()).toEqual(["extra", "max_index", "profile", "rules.a"]);
  });
});

describe("loadConfig", () => {
  it("busca el archivo hacia arriba y fusiona sobre los internos", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ial-cfg-"));
    fs.writeFileSync(path.join(dir, "ia-linter.yml"), "profile: academico\nfail_on: warning\nrules:\n  lexico/a: off\n");
    fs.mkdirSync(path.join(dir, "sub"));
    const loaded = loadConfig({ cwd: path.join(dir, "sub") });
    expect(loaded.file).toBe(path.join(dir, "ia-linter.yml"));
    expect(loaded.root).toBe(dir);
    expect(loaded.config.profile).toBe("academico");
    expect(loaded.config.fail_on).toBe("warning");
    expect(loaded.config.include).toEqual(defaultConfig().include);
    expect(loaded.issues).toEqual([]);
  });
  it("sin archivo devuelve internos", () => {
    const loaded = loadConfig({ cwd: os.tmpdir(), file: null });
    expect(loaded.file).toBeNull();
    expect(loaded.config).toEqual(defaultConfig());
  });
});

describe("resolveEffectiveRules precedencia", () => {
  const rules = [rule("lexico/a", "lexico", { tecnico: "error" }), rule("estructura/b", "estructura"), rule("repeticion/anafora", "repeticion")];
  it("internos < perfil < registro < proyecto < override < regla en override", () => {
    const c = defaultConfig();
    c.profile = "tecnico";
    c.register = "literario";
    c.rules = { "estructura/*": "info" };
    c.overrides = [{ files: ["docs/**"], rules: { "estructura/*": "error", "estructura/b": "off" } }];
    const eff = Object.fromEntries(resolveEffectiveRules(c, rules, "docs/x.md").map((e) => [e.rule, e]));
    expect(eff["lexico/a"]).toMatchObject({ level: "error", source: "profile" });
    expect(eff["repeticion/anafora"]).toMatchObject({ level: "off", source: "register" });
    expect(eff["estructura/b"]).toMatchObject({ level: "off", source: "rule" });
    const eff2 = Object.fromEntries(resolveEffectiveRules(c, rules, "otro/x.md").map((e) => [e.rule, e]));
    expect(eff2["estructura/b"]).toMatchObject({ level: "info", source: "project" });
  });
});
