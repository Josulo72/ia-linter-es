/** Conversión mínima de glob a RegExp: `**`, `*`, `?`, `{a,b}`, clases `[...]`. Las rutas se comparan con barras `/`. */
const cache = new Map<string, RegExp>();

export function globToRegExp(glob: string): RegExp {
  const hit = cache.get(glob);
  if (hit) return hit;
  let re = "";
  let i = 0;
  let g = glob.replace(/\\/g, "/");
  if (g.startsWith("./")) g = g.slice(2);
  while (i < g.length) {
    const c = g[i] as string;
    if (c === "*") {
      if (g[i + 1] === "*") {
        // `**/` o `**`
        if (g[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 3;
        } else {
          re += ".*";
          i += 2;
        }
      } else {
        re += "[^/]*";
        i++;
      }
    } else if (c === "?") {
      re += "[^/]";
      i++;
    } else if (c === "{") {
      const end = g.indexOf("}", i);
      if (end === -1) {
        re += "\\{";
        i++;
      } else {
        const alts = g.slice(i + 1, end).split(",").map((a) => globToRegExp(a).source.slice(1, -1));
        re += `(?:${alts.join("|")})`;
        i = end + 1;
      }
    } else if (c === "[") {
      const end = g.indexOf("]", i);
      if (end === -1) {
        re += "\\[";
        i++;
      } else {
        re += g.slice(i, end + 1);
        i = end + 1;
      }
    } else {
      re += /[.+^$()|\\]/.test(c) ? `\\${c}` : c;
      i++;
    }
  }
  // Un patrón sin `/` se aplica a cualquier profundidad (como .gitignore).
  const anchored = g.includes("/") ? `^${re}$` : `^(?:.*/)?${re}$`;
  const out = new RegExp(anchored);
  cache.set(glob, out);
  return out;
}

export function matchesAny(relPath: string, globs: string[]): boolean {
  const p = relPath.replace(/\\/g, "/").replace(/^\.\//, "");
  return globs.some((g) => globToRegExp(g).test(p));
}
