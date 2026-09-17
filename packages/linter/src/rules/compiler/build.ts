/**
 * Entrada de build: compila las reglas oficiales y escribe el Rule Pack y la documentación de reglas.
 * Uso: node dist/rules/compiler/build.js
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { compileRules, renderRulesDoc } from "./index.js";
import { packageRoot, rulepackPath, rulesDir } from "../../paths.js";

const root = packageRoot();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as { version: string };
const policyFile = path.resolve(root, "..", "..", "quality-policy.yml");
const policy = fs.existsSync(policyFile)
  ? (parseYaml(fs.readFileSync(policyFile, "utf8")) as {
      rules?: { min_positive_examples?: number; min_negative_examples?: number; min_reviewers?: number; stable_min?: number; stable_max?: number };
      regex_safety?: { max_ms_per_rule_on_1mb?: number; max_pattern_length?: number };
    })
  : {};

const result = compileRules({
  rulesDir: rulesDir(),
  version: pkg.version,
  minPositive: policy.rules?.min_positive_examples,
  minNegative: policy.rules?.min_negative_examples,
  minReviewers: policy.rules?.min_reviewers,
  maxMsPerRule: policy.regex_safety?.max_ms_per_rule_on_1mb,
  adversarialBytes: 1_000_000,
});

for (const i of result.issues) console.error(`[${i.severity}] ${i.rule}: ${i.message}`);
const errors = result.issues.filter((i) => i.severity === "error");
if (errors.length) {
  console.error(`\nCompilación fallida: ${errors.length} error(es).`);
  process.exit(1);
}
const stable = result.pack.rules.filter((r) => r.status === "stable").length;
const min = policy.rules?.stable_min ?? 0;
const max = policy.rules?.stable_max ?? Infinity;
if (stable < min || stable > max) {
  console.error(`Reglas stable: ${stable}; la política exige entre ${min} y ${max}.`);
  process.exit(1);
}
const out = rulepackPath();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result.pack, null, 2) + "\n", "utf8");
const docOut = path.resolve(root, "..", "..", "docs", "rules.md");
fs.writeFileSync(docOut, renderRulesDoc(result.definitions, result.pack) + "\n", "utf8");
const slowest = Object.entries(result.timings).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log(`Rule Pack: ${result.pack.rules.length} reglas (${stable} stable) -> ${path.relative(process.cwd(), out)}`);
console.log(`Más lentas (1 MB adversarial): ${slowest.map(([id, ms]) => `${id} ${ms} ms`).join(", ")}`);
