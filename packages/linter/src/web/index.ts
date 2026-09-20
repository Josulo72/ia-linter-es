/**
 * Motor para el navegador. Mismo análisis que la CLI, sin disco y sin red.
 *
 * La CLI descubre archivos, lee `textoneitor.yml` y escribe informes; nada de eso existe
 * aquí. Lo que queda es el análisis de un texto, que es el mismo código
 * (`runner/lint-text.ts`) y el mismo Rule Pack. `test/web-parity.test.ts` comprueba que
 * los dos caminos devuelven exactamente los mismos hallazgos y el mismo índice.
 *
 * El Rule Pack no se empaqueta con el motor: se pasa desde fuera, para que la web sirva
 * el `rulepack.json` de la versión que tenga instalada y no una copia congelada.
 */
import type { Config, FileResult, ProfileName, Register, RulePack } from "../contracts/index.js";
import { defaultConfig, mergeConfig, validateConfigObject, resolveEffectiveRules, PROFILES } from "../config/core.js";
import { lintDocumentText, type RunnerContext } from "../runner/lint-text.js";
import { SCHEMA_VERSION } from "../contracts/index.js";

export type { Config, FileResult, Finding, ProfileName, Register, RulePack, ScoreResult } from "../contracts/index.js";
export type { RunnerContext } from "../runner/lint-text.js";
export { SCHEMA_VERSION } from "../contracts/index.js";
export { defaultConfig, resolveEffectiveRules, PROFILES } from "../config/core.js";
export { computeScore } from "../scoring/index.js";

export interface WebContextOptions {
  /** Rule Pack ya cargado (`rulepack/rulepack.json` del paquete). */
  pack: RulePack;
  /** Perfil de situación. Por defecto `general`. */
  profile?: ProfileName;
  /** Registro. Por defecto el que traiga la configuración base. */
  register?: Register;
  /** Ajustes sueltos, con las mismas claves que `textoneitor.yml`. */
  config?: Partial<Config>;
}

export function createWebContext(opts: WebContextOptions): RunnerContext {
  const { pack } = opts;
  if (pack.schema_version !== SCHEMA_VERSION) {
    throw new Error(`Rule Pack con schema_version ${pack.schema_version}; se esperaba ${SCHEMA_VERSION}.`);
  }
  const raw: Record<string, unknown> = { ...(opts.config ?? {}) };
  if (opts.profile) raw.profile = opts.profile;
  if (opts.register) raw.register = opts.register;
  const issues = validateConfigObject(raw);
  if (issues.length) {
    throw new Error(`Configuración inválida: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
  }
  return {
    config: mergeConfig(defaultConfig(), raw),
    root: "/",
    pack,
    toolVersion: pack.version,
  };
}

export interface LintTextOptions {
  /** Ruta ficticia que decide el formato y los overrides por ruta. `texto.md` analiza como Markdown. */
  relPath?: string;
  format?: "text" | "markdown";
}

/** Analiza un texto. Devuelve los mismos hallazgos y el mismo índice que `textoneitor lint`. */
export function lintText(text: string, ctx: RunnerContext, opts: LintTextOptions = {}): FileResult {
  return lintDocumentText(text, ctx, opts);
}

/** Atajo para un solo análisis suelto. */
export function lintOnce(text: string, opts: WebContextOptions & LintTextOptions): FileResult {
  const { pack, profile, register, config, ...rest } = opts;
  return lintText(text, createWebContext({ pack, profile, register, config }), rest);
}

export const availableProfiles = PROFILES;
