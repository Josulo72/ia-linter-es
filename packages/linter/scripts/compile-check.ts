// Comprobación rápida de compilación de reglas (desarrollo): pnpm exec tsx scripts/compile-check.ts
import { compileRules } from "../src/rules/compiler/index.js";
import { rulesDir } from "../src/paths.js";

const r = compileRules({ rulesDir: rulesDir(), version: "dev", adversarialBytes: 200_000 });
for (const i of r.issues) console.log(`[${i.severity}] ${i.rule}: ${i.message}`);
console.log(`compiladas: ${r.pack.rules.length}, stable: ${r.pack.rules.filter((x) => x.status === "stable").length}`);
console.log("más lentas:", Object.entries(r.timings).sort((a, b) => b[1] - a[1]).slice(0, 5));
process.exit(r.issues.some((i) => i.severity === "error") ? 1 : 0);
