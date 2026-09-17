import path from "node:path";
import { fileURLToPath } from "node:url";

/** Raíz del paquete (packages/linter), tanto desde src/ (tests) como desde dist/. */
export function packageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/paths.ts o dist/paths.js -> un nivel arriba.
  return path.resolve(here, "..");
}

export function rulesDir(): string {
  return path.join(packageRoot(), "rules");
}

export function rulepackPath(): string {
  return path.join(packageRoot(), "rulepack", "rulepack.json");
}
