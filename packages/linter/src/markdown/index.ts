import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatter } from "micromark-extension-frontmatter";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";
import type { Nodes, Parent, Root } from "mdast";
import type { BlockKind, TextBlock } from "../contracts/index.js";

interface Part {
  text: string;
  offsets: number[];
}

/**
 * Extrae bloques elegibles de un Markdown mediante AST.
 * Excluidos: código (bloque e inline), front matter, URLs y destinos de enlaces, comentarios y HTML, definiciones.
 * Analizados: párrafos, encabezados, elementos de lista, citas, celdas de tabla y texto visible de enlaces.
 */
export function markdownBlocks(text: string): TextBlock[] {
  const tree: Root = fromMarkdown(text, {
    extensions: [frontmatter(["yaml", "toml"]), gfm()],
    mdastExtensions: [frontmatterFromMarkdown(["yaml", "toml"]), gfmFromMarkdown()],
  });
  const blocks: TextBlock[] = [];
  walk(tree, 0);
  return blocks;

  function walk(node: Nodes, depth: number): void {
    switch (node.type) {
      case "root":
        for (const c of node.children) walk(c, depth);
        return;
      case "paragraph":
        emit("paragraph", node, depth);
        return;
      case "heading":
        emit("heading", node, node.depth);
        return;
      case "blockquote":
        for (const c of node.children) {
          if (c.type === "paragraph") emit("blockquote", c, depth + 1);
          else walk(c, depth + 1);
        }
        return;
      case "list":
        for (const c of node.children) walk(c, depth + 1);
        return;
      case "listItem":
        for (const c of node.children) {
          if (c.type === "paragraph") emit("list_item", c, depth);
          else walk(c, depth);
        }
        return;
      case "table":
        for (const row of node.children) for (const cell of row.children) emit("table_cell", cell, depth);
        return;
      case "footnoteDefinition":
        for (const c of node.children) walk(c, depth);
        return;
      default:
        // code, html, yaml, toml, definition, thematicBreak: excluidos.
        return;
    }
  }

  function emit(kind: BlockKind, node: Parent, depth: number): void {
    const parts: Part[] = [];
    collect(node as Nodes, parts);
    let out = "";
    const map: number[] = [];
    for (const p of parts) {
      out += p.text;
      for (const o of p.offsets) map.push(o);
    }
    let s = 0;
    let e = out.length;
    while (s < e && /\s/.test(out[s] as string)) s++;
    while (e > s && /\s/.test(out[e - 1] as string)) e--;
    if (e <= s) return;
    const body = out.slice(s, e);
    const m = new Int32Array(body.length + 1);
    for (let i = 0; i < body.length; i++) m[i] = map[s + i] as number;
    m[body.length] = (map[e - 1] as number) + 1;
    const first = node.children[0];
    const startsWithStrong = first?.type === "strong";
    blocks.push({ kind, text: body, map: m, depth, startsWithStrong });
  }

  function collect(node: Nodes, parts: Part[]): void {
    switch (node.type) {
      case "text": {
        const start = node.position?.start.offset ?? 0;
        const end = node.position?.end.offset ?? start;
        const raw = text.slice(start, end);
        if (raw === node.value) {
          parts.push({ text: node.value, offsets: range(start, end) });
        } else {
          // Entidades o escapes: alineación aproximada y acotada dentro del nodo.
          parts.push({ text: node.value, offsets: approx(node.value, raw, start) });
        }
        return;
      }
      case "inlineCode":
      case "html":
      case "image":
      case "imageReference":
      case "footnoteReference":
      case "break": {
        const o = node.position?.start.offset ?? 0;
        parts.push({ text: " ", offsets: [o] });
        return;
      }
      case "link":
      case "linkReference":
      case "emphasis":
      case "strong":
      case "delete":
        for (const c of node.children) collect(c, parts);
        return;
      default:
        if ("children" in node) for (const c of (node as Parent).children) collect(c, parts);
        return;
    }
  }
}

function range(a: number, b: number): number[] {
  const r: number[] = new Array(b - a);
  for (let i = a; i < b; i++) r[i - a] = i;
  return r;
}

/** Alinea `value` (decodificado) con `raw` (crudo) de forma monótona; cada carácter apunta a una posición válida dentro de raw. */
function approx(value: string, raw: string, start: number): number[] {
  const offs: number[] = [];
  let j = 0;
  for (let i = 0; i < value.length; i++) {
    const v = value[i] as string;
    // Escape "\x" en raw que produce "x" en value.
    if (raw[j] === "\\" && raw[j + 1] === v && v !== "\\") j++;
    // Entidad HTML en raw (&amp;) que produce un carácter distinto en value.
    if (raw[j] === "&") {
      const semi = raw.indexOf(";", j);
      if (semi > j && semi - j <= 12 && !value.startsWith(raw.slice(j, semi + 1), i)) {
        offs.push(start + j);
        j = semi + 1;
        continue;
      }
    }
    if (j < raw.length && raw[j] === v) {
      offs.push(start + j);
      j++;
    } else {
      offs.push(start + Math.min(j, raw.length - 1));
      j++;
    }
  }
  return offs;
}
