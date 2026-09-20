import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parse as parseYaml } from "yaml";
import { AI_TEXT, HUMAN_TEXT, REPO_ROOT, cli, tmpProject } from "./helpers.js";

describe("CLI E2E: lint", () => {
  it("falla con texto de patrones densos y pasa con texto editado", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "ok.md": HUMAN_TEXT });
    const bad = cli(["lint", "ia.md", "--no-cache"], { cwd: dir });
    expect(bad.status).toBe(1);
    expect(bad.stdout).toContain("lexico/muletillas-ia");
    expect(bad.stdout).toContain("FALLO");
    const ok = cli(["lint", "ok.md", "--no-cache"], { cwd: dir });
    expect(ok.status).toBe(0);
    expect(ok.stdout).toContain("OK");
  });

  it("JSON determinista byte a byte, con y sin caché", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "sub/ok.txt": HUMAN_TEXT });
    const a = cli(["lint", "-f", "json", "--no-cache"], { cwd: dir });
    const b = cli(["lint", "-f", "json"], { cwd: dir }); // escribe caché
    const c = cli(["lint", "-f", "json"], { cwd: dir }); // lee caché
    expect(a.stdout).toBe(b.stdout);
    expect(b.stdout).toBe(c.stdout);
    const json = JSON.parse(a.stdout);
    expect(json.schema_version).toBe(1);
    expect(json.files.map((f: { path: string }) => f.path)).toEqual(["ia.md", "sub/ok.txt"]);
    expect(fs.existsSync(path.join(dir, ".textoneitor-cache"))).toBe(true);
    expect(json.files[0].score.index).toBeGreaterThan(30);
    expect(a.stdout).not.toMatch(/probabilidad/i);
  });

  it("respeta .gitignore, exclude y overrides por ruta", () => {
    const dir = tmpProject({
      ".gitignore": "ignorado/\n",
      "ignorado/x.md": AI_TEXT,
      "docs/x.md": AI_TEXT,
      "blog/x.md": AI_TEXT,
      "textoneitor.yml": "fail_on: never\nexclude: ['blog/**']\noverrides:\n  - files: ['docs/**']\n    rules:\n      'lexico/*': off\n",
    });
    const r = cli(["lint", "-f", "json", "--no-cache"], { cwd: dir });
    expect(r.status).toBe(0);
    const json = JSON.parse(r.stdout);
    expect(json.files.map((f: { path: string }) => f.path)).toEqual(["docs/x.md"]);
    expect(json.files[0].findings.some((f: { rule: string }) => f.rule.startsWith("lexico/"))).toBe(false);
    expect(json.files[0].findings.length).toBeGreaterThan(0);
  });

  it("stdin con nombre lógico, CRLF y BOM: mismos hallazgos y posiciones de línea", () => {
    const lf = cli(["lint", "--stdin", "--stdin-filename", "a.md", "-f", "json", "--fail-on", "never"], { input: AI_TEXT });
    const crlf = cli(["lint", "--stdin", "--stdin-filename", "a.md", "-f", "json", "--fail-on", "never"], { input: "﻿" + AI_TEXT.replace(/\n/g, "\r\n") });
    const a = JSON.parse(lf.stdout).files[0].findings;
    const b = JSON.parse(crlf.stdout).files[0].findings;
    expect(b.map((f: { rule: string; range: { start: { line: number } } }) => [f.rule, f.range.start.line])).toEqual(
      a.map((f: { rule: string; range: { start: { line: number } } }) => [f.rule, f.range.start.line]),
    );
    expect(b.map((f: { fingerprint: string }) => f.fingerprint)).toEqual(a.map((f: { fingerprint: string }) => f.fingerprint));
  });

  it("supresiones inline en Markdown", () => {
    const dir = tmpProject({ "a.md": "<!-- textoneitor-disable-file -->\n" + AI_TEXT });
    const r = cli(["lint", "a.md", "-f", "json", "--no-cache"], { cwd: dir });
    expect(r.status).toBe(0);
    const json = JSON.parse(r.stdout);
    expect(json.policy.counts.suppressed).toBeGreaterThan(10);
    expect(json.files[0].score.index).toBe(0);
  });

  it("SARIF estructuralmente válido", () => {
    const dir = tmpProject({ "sub/ia.md": AI_TEXT });
    const r = cli(["lint", "-f", "sarif", "--no-cache", "-o", "out.sarif"], { cwd: dir });
    expect(r.status).toBe(1);
    const s = JSON.parse(fs.readFileSync(path.join(dir, "out.sarif"), "utf8"));
    expect(s.version).toBe("2.1.0");
    const runObj = s.runs[0];
    expect(runObj.tool.driver.name).toBe("textoneitor");
    expect(runObj.originalUriBaseIds.PROJECTROOT.uri).toMatch(/^file:\/\/\/.*\/$/);
    expect(runObj.results.length).toBeGreaterThan(10);
    for (const res of runObj.results) {
      expect(["error", "warning", "note"]).toContain(res.level);
      const loc = res.locations[0].physicalLocation;
      expect(loc.artifactLocation.uri).toBe("sub/ia.md");
      expect(loc.artifactLocation.uriBaseId).toBe("PROJECTROOT");
      expect(loc.region.startLine).toBeGreaterThanOrEqual(1);
      expect(loc.region.startColumn).toBeGreaterThanOrEqual(1);
      expect(runObj.tool.driver.rules[res.ruleIndex].id).toBe(res.ruleId);
      expect(res.partialFingerprints["textoneitor/v1"]).toMatch(/^[0-9a-f]{24}$/);
    }
  });

  it("--format revision: orientación por regla, determinista y sin color", () => {
    const args = ["lint", "--stdin", "--stdin-filename", "respuesta.md", "--profile", "chat", "--fail-on", "never"];
    const a = cli([...args, "-f", "revision"], { input: AI_TEXT });
    const b = cli([...args, "-f", "revision"], { input: AI_TEXT });
    expect(a.status).toBe(0);
    expect(a.stdout).toBe(b.stdout);
    expect(a.stdout).not.toMatch(/\x1b\[/);
    // Es orientación: lo dice al principio, y la guía de cada regla sale como «Orientación», no como una orden.
    expect(a.stdout).toMatch(/^Orientación para revisar el texto\. Cada hallazgo es una señal, no una orden/);
    expect(a.stdout).toMatch(/\nrespuesta\.md \(índice \d+\/100\)\n/);
    expect(a.stdout).toContain("lexico/muletillas-ia: Muletilla de redacción generada");
    expect(a.stdout).toContain("Orientación: Elimina la fórmula");
    expect(a.stdout).not.toContain("Cómo reescribir");
    expect(a.stdout).toContain('Fragmento: "En el vertiginoso mundo"');

    // Cada regla sale una vez aunque tenga varios hallazgos, y solo las de nivel error o warning salvo con --verbose.
    const json = JSON.parse(cli([...args, "-f", "json"], { input: AI_TEXT }).stdout);
    const findings: { rule: string; level: string; suppressed?: unknown }[] = json.files[0].findings.filter((f: { suppressed?: unknown }) => !f.suppressed);
    const aArreglar = new Set(findings.filter((f) => f.level !== "info").map((f) => f.rule));
    const soloInfo = [...new Set(findings.map((f) => f.rule))].filter((r) => !aArreglar.has(r));
    const cabeceras = (s: string) => s.split("\n").filter((l) => /^[a-z]+\/[a-z-]+:/.test(l)).map((l) => l.split(":")[0]);
    expect(cabeceras(a.stdout).sort()).toEqual([...aArreglar].sort());
    const v = cli([...args, "-f", "revision", "-v"], { input: AI_TEXT });
    expect(cabeceras(v.stdout).sort()).toEqual([...aArreglar, ...soloInfo].sort());
  });

  it("--format revision sin nada que arreglar lo dice, y el reporter se puede fijar en textoneitor.yml", () => {
    const vacio = cli(["lint", "--stdin", "-f", "revision"], { input: "Hola." });
    expect(vacio.stdout).toBe("Nada que revisar.\n");
    const dir = tmpProject({ "ia.md": AI_TEXT, "textoneitor.yml": "reporter: revision\nfail_on: never\n" });
    const r = cli(["lint", "--no-cache"], { cwd: dir });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Orientación:");
    expect(cli(["lint", "-f", "otro"], { cwd: dir }).status).toBe(2);
  });

  it("--profile auto: la ruta decide el perfil según situaciones.yml, y sin situación no se analiza", () => {
    const PLANO =
      "Este es un texto de prueba con una frase normal. Esta es otra frase de longitud parecida aqui. Y otra mas con el mismo numero de palabras. Seguimos con otra frase de longitud similar. Cada frase se parece mucho a la anterior. Nada cambia el ritmo de este parrafo. Las frases siguen con la misma medida siempre. Ninguna es corta y ninguna es larga aqui. Esto ocupa mas de cuarenta palabras ya seguro.";
    const reglas = (nombre: string, cwd?: string) => {
      const r = cli(["lint", "--stdin", "--stdin-filename", nombre, "--profile", "auto", "-f", "json", "--fail-on", "never"], { input: PLANO, cwd });
      return { status: r.status, stderr: r.stderr, files: JSON.parse(r.stdout).files as { findings: { rule: string }[] }[] };
    };
    // readme y redes tienen ritmo-plano activa; correo no (D1).
    expect(reglas("README.md").files[0].findings.map((f) => f.rule)).toContain("estructura/ritmo-plano");
    expect(reglas("docs/guia.md").files[0].findings.map((f) => f.rule)).toContain("estructura/ritmo-plano");
    expect(reglas("correos/respuesta.md").files[0].findings.map((f) => f.rule)).not.toContain("estructura/ritmo-plano");
    const nada = reglas("notas.md");
    expect(nada.status).toBe(0);
    expect(nada.files).toEqual([]);
    expect(nada.stderr).toContain("no corresponde a ninguna situación");
    // Los overrides del proyecto mandan sobre la situación.
    const dir = tmpProject({ "textoneitor.yml": "overrides:\n  - files: ['README.md']\n    profile: correo\n" });
    expect(reglas("README.md", dir).files[0].findings.map((f) => f.rule)).not.toContain("estructura/ritmo-plano");
    // Con --stdin hace falta la ruta: es lo que decide.
    expect(cli(["lint", "--stdin", "--profile", "auto"], { input: PLANO }).status).toBe(2);
  });

  it("--profile auto sobre un proyecto: cada archivo con el perfil de su situación", () => {
    const PLANO =
      "Este es un texto de prueba con una frase normal. Esta es otra frase de longitud parecida aqui. Y otra mas con el mismo numero de palabras. Seguimos con otra frase de longitud similar. Cada frase se parece mucho a la anterior. Nada cambia el ritmo de este parrafo. Las frases siguen con la misma medida siempre. Ninguna es corta y ninguna es larga aqui. Esto ocupa mas de cuarenta palabras ya seguro.";
    const dir = tmpProject({ "README.md": PLANO, "correos/a.md": PLANO, "notas.md": PLANO });
    const r = cli(["lint", "--profile", "auto", "-f", "json", "--no-cache", "--fail-on", "never"], { cwd: dir });
    const json = JSON.parse(r.stdout);
    const de = (p: string) => json.files.find((f: { path: string }) => f.path === p).findings.map((f: { rule: string }) => f.rule);
    expect(de("README.md")).toContain("estructura/ritmo-plano");
    expect(de("correos/a.md")).not.toContain("estructura/ritmo-plano");
    // Igual que con --stdin: lo que no tiene situación no se analiza, y se dice.
    expect(json.files.map((f: { path: string }) => f.path).sort()).toEqual(["README.md", "correos/a.md"]);
    expect(r.stderr).toContain("1 archivo(s) sin situación");
    expect(r.stderr).toContain("notas.md");
    // Y con un archivo concreto, que es como lo pide la instrucción de AGENTS.md.
    const solo = cli(["lint", "notas.md", "--profile", "auto", "-f", "json", "--no-cache"], { cwd: dir });
    expect(solo.status).toBe(0);
    expect(JSON.parse(solo.stdout).files).toEqual([]);
  });

  it("privacidad: sin snippets no aparece texto del documento", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "textoneitor.yml": "privacy:\n  snippets: false\nfail_on: never\n" });
    const r = cli(["lint", "-f", "json", "--no-cache"], { cwd: dir });
    const json = JSON.parse(r.stdout);
    expect(json.files[0].findings.every((f: { snippet: string }) => f.snippet === "")).toBe(true);
  });

  it("errores de uso devuelven 2", () => {
    const dir = tmpProject({ "textoneitor.yml": "profile: inventado\n", "a.md": "hola" });
    expect(cli(["lint"], { cwd: dir }).status).toBe(2);
    const dir2 = tmpProject({ "a.md": "hola" });
    expect(cli(["lint", "--fail-on", "x"], { cwd: dir2 }).status).toBe(2);
    expect(cli(["lint", "noexiste.md"], { cwd: dir2 }).status).toBe(2);
    expect(cli(["benchmark", "run", "--corpus", ".", "--partition", "development", "--profile", "inventado"], { cwd: dir2 }).status).toBe(2);
  });
});

describe("CLI E2E: rules, config, baseline", () => {
  it("rules list y rules explain", () => {
    const l = cli(["rules", "list", "--json"]);
    const rules = JSON.parse(l.stdout);
    const stable = rules.filter((r: { status: string }) => r.status === "stable").length;
    // Los límites salen de la política, no se copian aquí: cambiarlos exige una entrada en docs/decisions.md.
    const policy = parseYaml(fs.readFileSync(path.join(REPO_ROOT, "quality-policy.yml"), "utf8"));
    expect(stable).toBeGreaterThanOrEqual(policy.rules.stable_min);
    expect(stable).toBeLessThanOrEqual(policy.rules.stable_max);
    const e = cli(["rules", "explain", "lexico/muletillas-ia"]);
    expect(e.status).toBe(0);
    expect(e.stdout).toContain("Orientación:");
    expect(cli(["rules", "explain", "no/existe"]).status).toBe(2);
  });

  it("config validate y config explain muestran origen", () => {
    const dir = tmpProject({
      "textoneitor.yml": "profile: academico\nrules:\n  retorica/triada: off\noverrides:\n  - files: ['docs/**']\n    rules:\n      retorica/triada: error\n",
      "docs/a.md": "hola",
    });
    expect(cli(["config", "validate"], { cwd: dir }).status).toBe(0);
    const ex = cli(["config", "explain", "docs/a.md"], { cwd: dir });
    expect(ex.stdout).toMatch(/retorica\/triada\s+error\s+← rule/);
    expect(ex.stdout).toMatch(/densidad\/conectores\s+info\s+← profile/);
    const ex2 = cli(["config", "explain", "otro.md"], { cwd: dir });
    expect(ex2.stdout).toMatch(/retorica\/triada\s+off\s+← project/);
    const bad = tmpProject({ "textoneitor.yml": "rules:\n  no/existe: off\n" });
    expect(cli(["config", "validate"], { cwd: bad }).status).toBe(2);
  });

  it("baseline create impide solo hallazgos nuevos; update elimina obsoletas", () => {
    const dir = tmpProject({ "a.md": AI_TEXT, "textoneitor.yml": "baseline:\n  path: bl.json\n" });
    expect(cli(["lint", "--no-cache"], { cwd: dir }).status).toBe(1);
    expect(cli(["baseline", "create", "--reason", "legado"], { cwd: dir }).status).toBe(0);
    const bl = fs.readFileSync(path.join(dir, "bl.json"), "utf8");
    expect(bl).not.toContain("vertiginoso"); // no almacena texto
    expect(cli(["lint", "--no-cache"], { cwd: dir }).status).toBe(0);
    // Hallazgo nuevo
    fs.writeFileSync(path.join(dir, "a.md"), AI_TEXT + "\n\nCabe señalar que esto es nuevo.\n");
    const r = cli(["lint", "--no-cache", "-f", "json"], { cwd: dir });
    expect(r.status).toBe(1);
    const active = JSON.parse(r.stdout).files[0].findings.filter((f: { suppressed?: unknown }) => !f.suppressed);
    expect(active.map((f: { rule: string }) => f.rule)).toContain("lexico/es-importante-destacar");
    // Obsoletas
    fs.writeFileSync(path.join(dir, "a.md"), "Texto corto sin nada.\n");
    const r2 = JSON.parse(cli(["lint", "--no-cache", "-f", "json"], { cwd: dir }).stdout);
    expect(r2.baseline.stale).toBeGreaterThan(10);
    expect(cli(["baseline", "update"], { cwd: dir }).status).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(dir, "bl.json"), "utf8")).entries).toHaveLength(0);
  });
});

describe("CLI E2E: benchmark run --annotations", () => {
  const RULE = "lexico/muletillas-ia";

  /** Un corpus de una muestra, con la adjudicación por defecto marcando `correct` el primer hallazgo de RULE. */
  function corpusConAdjudicacion(): { dir: string; key: string } {
    const sha = createHash("sha256").update(AI_TEXT).digest("hex");
    const dir = tmpProject({
      "corpus/ia.md": AI_TEXT,
      "corpus/manifests/development.yml": `schema_version: 1\npartition: development\nsamples:\n  - { id: s1, class: ai, file: ia.md, register: x, sha256: ${sha} }\n`,
    });
    const lint = JSON.parse(cli(["lint", "--stdin", "--stdin-filename", "ia.md", "-f", "json", "--fail-on", "never"], { cwd: path.join(dir, "corpus"), input: AI_TEXT }).stdout);
    const f = lint.files[0].findings.find((x: { rule: string }) => x.rule === RULE);
    const key = `s1|${RULE}|${f.fingerprint}`;
    fs.mkdirSync(path.join(dir, "benchmark", "annotations"), { recursive: true });
    fs.writeFileSync(path.join(dir, "benchmark", "annotations", "development.yml"), `schema_version: 1\nadjudications:\n  "${key}": correct\n`, "utf8");
    return { dir, key };
  }
  const bench = (dir: string, extra: string[] = []) =>
    cli(["benchmark", "run", "--corpus", "corpus", "--partition", "development", ...extra], { cwd: dir });

  it("sin la opción lee benchmark/annotations/<partición>.yml, como hasta ahora", () => {
    const { dir } = corpusConAdjudicacion();
    const r = bench(dir);
    expect(r.status).toBe(0);
    const rep = JSON.parse(r.stdout);
    expect(rep.per_rule[RULE].adjudicated).toEqual({ correct: 1, incorrect: 0, precision: 1 });
    expect(rep.config).not.toHaveProperty("annotations");
  });

  it("con la opción lee solo ese archivo, lo registra en el informe y cuenta las adjudicaciones huérfanas", () => {
    const { dir, key } = corpusConAdjudicacion();
    fs.mkdirSync(path.join(dir, "adj"), { recursive: true });
    fs.writeFileSync(path.join(dir, "adj", "v2.yml"), `schema_version: 1\nadjudications:\n  "${key}": incorrect\n  "s1|${RULE}|000000000000000000000000": correct\n`, "utf8");
    const r = bench(dir, ["--annotations", "adj/v2.yml"]);
    expect(r.status).toBe(0);
    const rep = JSON.parse(r.stdout);
    expect(rep.per_rule[RULE].adjudicated).toEqual({ correct: 0, incorrect: 1, precision: 0 });
    expect(rep.config.annotations).toBe("adj/v2.yml");
    expect(rep.notes).toContain("1 adjudicaciones no corresponden a ningún hallazgo de esta ejecución.");
  });

  it("un archivo de adjudicaciones que no existe es un error, no un informe sin precisión", () => {
    const { dir } = corpusConAdjudicacion();
    const r = bench(dir, ["--annotations", "adj/no-existe.yml"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("no existe el archivo de adjudicaciones");
  });
});
