/**
 * Seguridad de patrones. Se aplica a toda expresión regular que llegue al Rule Pack:
 * patrones `regex`, términos `re:` de léxicos y excepciones.
 */
export interface SafetyPolicy {
  forbid_backreferences: boolean;
  forbid_nested_quantifiers: boolean;
  forbid_empty_match: boolean;
  max_pattern_length: number;
}

export const DEFAULT_SAFETY: SafetyPolicy = {
  forbid_backreferences: true,
  forbid_nested_quantifiers: true,
  forbid_empty_match: true,
  max_pattern_length: 400,
};

export function checkPattern(source: string, policy: SafetyPolicy = DEFAULT_SAFETY): string[] {
  const errors: string[] = [];
  if (source.length === 0) return ["patrón vacío"];
  if (source.length > policy.max_pattern_length) errors.push(`patrón demasiado largo (${source.length} > ${policy.max_pattern_length})`);
  let re: RegExp;
  try {
    re = new RegExp(source, "iu");
  } catch (e) {
    return [`patrón inválido: ${(e as Error).message}`];
  }
  if (policy.forbid_backreferences && /\\[1-9]|\\k<|\(\?[=!<][^)]*\\[1-9]/.test(source)) errors.push("retroreferencias no permitidas");
  if (/\.\*|\.\+|\[\^[^\]]*\][*+]/.test(source)) errors.push("patrón no acotado (.*, .+ o clase negada sin límite); usa un cuantificador con máximo, p. ej. {1,60}");
  if (policy.forbid_nested_quantifiers && hasNestedQuantifier(source)) errors.push("cuantificador anidado sobre un grupo con cuantificador");
  if (/\{\d*,\s*\}/.test(source)) errors.push("cuantificador {n,} sin máximo");
  if (/\{\d+,(\d+)\}/.test(source)) {
    for (const m of source.matchAll(/\{\d+,(\d+)\}/g)) {
      if (Number(m[1]) > 200) errors.push(`cuantificador con máximo demasiado alto ({..,${m[1]}} > 200)`);
    }
  }
  if (policy.forbid_empty_match) {
    if (re.test("")) errors.push("el patrón puede coincidir con la cadena vacía");
  }
  return errors;
}

/** Detecta `(…X+…)+`, `(…X*…)*` y variantes {n,m} sobre grupos que ya contienen cuantificadores. */
export function hasNestedQuantifier(source: string): boolean {
  const stack: { hasQuant: boolean }[] = [];
  let i = 0;
  let inClass = false;
  let lastWasGroupClose = false;
  while (i < source.length) {
    const c = source[i] as string;
    if (c === "\\") {
      i += 2;
      lastWasGroupClose = false;
      continue;
    }
    if (inClass) {
      if (c === "]") inClass = false;
      i++;
      continue;
    }
    if (c === "[") {
      inClass = true;
      i++;
      continue;
    }
    if (c === "(") {
      stack.push({ hasQuant: false });
      i++;
      lastWasGroupClose = false;
      continue;
    }
    if (c === ")") {
      const g = stack.pop();
      lastWasGroupClose = true;
      // El siguiente carácter decide si el grupo se cuantifica.
      const next = source[i + 1];
      const quantified = next === "+" || next === "*" || next === "{" || (next === "?" && g !== undefined && false);
      if (quantified && g?.hasQuant) return true;
      if (g?.hasQuant && stack.length) (stack[stack.length - 1] as { hasQuant: boolean }).hasQuant = true;
      if (quantified && stack.length) (stack[stack.length - 1] as { hasQuant: boolean }).hasQuant = true;
      i++;
      continue;
    }
    if (c === "+" || c === "*" || c === "{") {
      // `?` solo (opcional) no se considera peligroso.
      if (stack.length && !lastWasGroupClose) (stack[stack.length - 1] as { hasQuant: boolean }).hasQuant = true;
      if (c === "{") {
        const close = source.indexOf("}", i);
        i = close === -1 ? i + 1 : close + 1;
        lastWasGroupClose = false;
        continue;
      }
    }
    lastWasGroupClose = false;
    i++;
  }
  return false;
}

/** Texto adversarial determinista para pruebas de tiempo: repeticiones largas, símbolos y casi-coincidencias. */
export function adversarialText(bytes: number): string {
  const seeds = [
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no,",
    "en en en en en en en en en en en en en en en en en en en en en en en en en en en en en en en en en",
    "es importante es importante es importante es importante es importante es importante es importante",
    "sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino sino",
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    "—————————————————————————————————————————————————————————————————————————————————————————————————",
    ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "desde desde desde hasta hasta hasta pasando pasando pasando por por por por por por por por por por",
    "En primer lugar en primer lugar en primer lugar en primer lugar en primer lugar en primer lugar",
    "😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀",
    "palabra, palabra, palabra, palabra, palabra, palabra, palabra, palabra, palabra, palabra y palabra",
  ];
  let out = "";
  let i = 0;
  while (out.length < bytes) {
    out += seeds[i % seeds.length] + (i % 7 === 0 ? "\n\n" : " ");
    i++;
  }
  return out;
}
