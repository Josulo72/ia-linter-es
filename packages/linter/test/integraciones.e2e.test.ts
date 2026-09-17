import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { AI_TEXT, BUNDLE, CLI, HUMAN_TEXT, REPO_ROOT, cli, run, tmpProject } from "./helpers.js";

const ACTION = path.join(REPO_ROOT, "integrations", "github-action", "main.mjs");
const HOOK = path.join(REPO_ROOT, "integrations", "claude-code", "scripts", "revisar-respuesta.mjs");

/** La Action lee sus entradas del entorno, igual que en GitHub. */
function action(inputs: Record<string, string>, opts: { cwd: string; outputs?: string; summary?: string }) {
  // GitHub sube el nombre a mayúsculas y cambia los espacios por guión bajo; el guión se queda.
  const env: Record<string, string> = { IA_LINTER_CLI: CLI };
  for (const [k, v] of Object.entries(inputs)) env[`INPUT_${k.toUpperCase().replace(/ /g, "_")}`] = v;
  if (opts.outputs) env.GITHUB_OUTPUT = opts.outputs;
  if (opts.summary) env.GITHUB_STEP_SUMMARY = opts.summary;
  return run(ACTION, [], { cwd: opts.cwd, env });
}

function leerOutputs(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n") : [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^([a-z-]+)<<(ghadelimiter_[a-z-]+)$/.exec(lines[i] ?? "");
    if (!m) continue;
    out[m[1] as string] = lines[i + 1] ?? "";
  }
  return out;
}

describe("Paridad entre superficies", () => {
  it("CLI, bundle y Action ven exactamente los mismos hallazgos", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "sub/ok.txt": HUMAN_TEXT, "ia-linter.yml": "profile: general\n" });
    const desdeCli = cli(["lint", "-f", "json", "--no-cache"], { cwd: dir });
    const desdeBundle = run(BUNDLE, ["lint", "-f", "json", "--no-cache"], { cwd: dir });
    expect(desdeBundle.stdout).toBe(desdeCli.stdout);

    const jsonAction = path.join(dir, "informe.json");
    const r = action({ json: "informe.json" }, { cwd: dir });
    expect(r.status).toBe(1); // la política falla en ia.md, igual que en la CLI
    expect(fs.readFileSync(jsonAction, "utf8")).toBe(desdeCli.stdout);
  });

  it("la Action no redefine la configuración del repositorio", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "ia-linter.yml": "fail_on: never\nrules:\n  'lexico/*': off\n" });
    const outputs = path.join(dir, "outputs.txt");
    const r = action({}, { cwd: dir, outputs });
    expect(r.status).toBe(0);
    expect(r.stdout).not.toContain("lexico/");
    expect(leerOutputs(outputs).passed).toBe("true");
  });
});

describe("GitHub Action", () => {
  it("publica una anotación por hallazgo, con archivo y línea", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT });
    const outputs = path.join(dir, "outputs.txt");
    const summary = path.join(dir, "summary.md");
    const r = action({ "fail-on": "never" }, { cwd: dir, outputs, summary });
    expect(r.status).toBe(0);
    const anotaciones = r.stdout.split("\n").filter((l) => /^::(error|warning|notice) /.test(l));
    expect(anotaciones.length).toBeGreaterThan(0);
    for (const a of anotaciones) {
      expect(a).toMatch(/file=ia\.md,line=\d+,col=\d+,endLine=\d+,endColumn=\d+,title=/);
      expect(a).not.toContain("\r");
    }
    const out = leerOutputs(outputs);
    expect(Number(out.findings)).toBe(anotaciones.length);
    expect(Number(out["max-index"])).toBeGreaterThan(0);
    expect(fs.readFileSync(summary, "utf8")).toContain("## ia-linter-es");
  });

  it("annotations=false calla las anotaciones pero cuenta igual", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT });
    const outputs = path.join(dir, "outputs.txt");
    const r = action({ annotations: "false", "fail-on": "never" }, { cwd: dir, outputs });
    expect(r.stdout.split("\n").filter((l) => /^::(error|warning|notice) /.test(l))).toHaveLength(0);
    expect(Number(leerOutputs(outputs).findings)).toBeGreaterThan(0);
  });

  it("escribe SARIF válido cuando se le pide", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT });
    const r = action({ sarif: "informe.sarif", "fail-on": "never" }, { cwd: dir });
    expect(r.status).toBe(0);
    const sarif = JSON.parse(fs.readFileSync(path.join(dir, "informe.sarif"), "utf8"));
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].tool.driver.name).toBe("ia-linter-es");
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });

  it("sin CLI ni bundle, falla diciendo qué hay que hacer", () => {
    // Copia de la Action sin bundle al lado y en un proyecto sin node_modules.
    const dir = tmpProject({ "ia.md": AI_TEXT, "action/main.mjs": fs.readFileSync(ACTION, "utf8") });
    const r = run(path.join(dir, "action", "main.mjs"), [], { cwd: dir, env: { IA_LINTER_CLI: path.join(dir, "no-existe.js") } });
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/no encuentro la CLI/i);
    expect(r.stdout).toContain("npm i -D ia-linter-es");
  });
});

describe("Hook de Claude Code", () => {
  const entrada = (texto: string, extra: Record<string, unknown> = {}) =>
    JSON.stringify({ session_id: "s", prompt_id: "p", cwd: REPO_ROOT, hook_event_name: "Stop", last_assistant_message: texto, ...extra });

  const PLANO =
    "Este es un texto de prueba con una frase normal. Esta es otra frase de longitud parecida aqui. Y otra mas con el mismo numero de palabras. Seguimos con otra frase de longitud similar. Cada frase se parece mucho a la anterior. Nada cambia el ritmo de este parrafo. Las frases siguen con la misma medida siempre. Ninguna es corta y ninguna es larga aqui. Esto ocupa mas de cuarenta palabras ya seguro.";

  it("desactivado por defecto: no mira ni la respuesta", () => {
    const r = run(HOOK, [], { input: entrada(PLANO), env: { IA_LINTER_REVISAR: "" } });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });

  it("encendido, devuelve la respuesta con el motivo en stderr", () => {
    const estado = fs.mkdtempSync(path.join(os.tmpdir(), "ial-hook-"));
    try {
      const r = run(HOOK, [], { input: entrada(PLANO), env: { IA_LINTER_REVISAR: "1", CLAUDE_SESSION_ID: "t1", TMPDIR: estado, TEMP: estado, TMP: estado, IA_LINTER_CLI: CLI } });
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("estructura/ritmo-plano");
      expect(r.stderr).toContain("Reescríbela");
    } finally {
      fs.rmSync(estado, { recursive: true, force: true });
    }
  });

  it("deja pasar un texto que no marca nada", () => {
    const estado = fs.mkdtempSync(path.join(os.tmpdir(), "ial-hook-"));
    try {
      const r = run(HOOK, [], { input: entrada(HUMAN_TEXT), env: { IA_LINTER_REVISAR: "1", CLAUDE_SESSION_ID: "t2", TMPDIR: estado, TEMP: estado, TMP: estado, IA_LINTER_CLI: CLI } });
      expect(r.status).toBe(0);
    } finally {
      fs.rmSync(estado, { recursive: true, force: true });
    }
  });

  it("no insiste más de lo que dice el tope", () => {
    const estado = fs.mkdtempSync(path.join(os.tmpdir(), "ial-hook-"));
    try {
      const env = { IA_LINTER_REVISAR: "1", IA_LINTER_REVISAR_INTENTOS: "2", CLAUDE_SESSION_ID: "t3", TMPDIR: estado, TEMP: estado, TMP: estado, IA_LINTER_CLI: CLI };
      expect(run(HOOK, [], { input: entrada(PLANO), env }).status).toBe(2);
      expect(run(HOOK, [], { input: entrada(PLANO), env }).status).toBe(2);
      expect(run(HOOK, [], { input: entrada(PLANO), env }).status).toBe(0);
    } finally {
      fs.rmSync(estado, { recursive: true, force: true });
    }
  });

  it("un mensaje corto o vacío no se revisa", () => {
    for (const texto of ["", "Hecho.", "Sí, lo he cambiado."]) {
      const r = run(HOOK, [], { input: entrada(texto), env: { IA_LINTER_REVISAR: "1", IA_LINTER_CLI: CLI } });
      expect(r.status).toBe(0);
    }
  });

  it("entrada ilegible no bloquea nada", () => {
    expect(run(HOOK, [], { input: "esto no es json", env: { IA_LINTER_REVISAR: "1" } }).status).toBe(0);
  });
});

describe("Pre-commit", () => {
  it("la definición está en la raíz y llama a la CLI sin lógica propia", () => {
    const hooks = fs.readFileSync(path.join(REPO_ROOT, ".pre-commit-hooks.yaml"), "utf8");
    expect(hooks).toContain("id: ia-linter-es");
    expect(hooks).toContain("entry: ia-linter-es lint");
    expect(hooks).toContain("pass_filenames: true");
  });

  it("analizar los archivos uno a uno da lo mismo que analizarlos juntos", () => {
    const dir = tmpProject({ "ia.md": AI_TEXT, "ok.txt": HUMAN_TEXT });
    const juntos = JSON.parse(cli(["lint", "ia.md", "ok.txt", "-f", "json", "--no-cache", "--fail-on", "never"], { cwd: dir }).stdout);
    const sueltos = ["ia.md", "ok.txt"].map((f) => JSON.parse(cli(["lint", f, "-f", "json", "--no-cache", "--fail-on", "never"], { cwd: dir }).stdout).files[0]);
    expect(sueltos).toEqual(juntos.files);
  });
});
