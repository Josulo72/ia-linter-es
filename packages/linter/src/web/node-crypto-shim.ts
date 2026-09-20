/**
 * Sustituto de `node:crypto` para el bundle de navegador. Solo cubre lo que usa el motor:
 * `createHash("sha256").update(texto).digest("hex")`. El alias lo pone `scripts/bundle-web.mjs`.
 */
import { sha256Hex } from "./sha256.js";

interface Hash {
  update(chunk: string): Hash;
  digest(encoding: "hex"): string;
}

export function createHash(algorithm: string): Hash {
  if (algorithm !== "sha256") {
    throw new Error(`El motor web solo implementa sha256, no ${algorithm}.`);
  }
  let data = "";
  const hash: Hash = {
    update(chunk: string) {
      data += chunk;
      return hash;
    },
    digest(encoding: "hex") {
      if (encoding !== "hex") throw new Error(`El motor web solo devuelve hex, no ${encoding}.`);
      return sha256Hex(data);
    },
  };
  return hash;
}

export default { createHash };
