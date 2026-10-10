// Logo components.
//
//   {% plates "blue" %}                                   every image in ./blue, one plate each, stacked
//   {% plates "blue", only="Logo-Type_01.svg, Logo-Mark_AFW.svg", labels="Logo type, Logo mark" %}
//   {% plates "blue", bg="neutral", ratio="2/1" %}        plate colour (token name) and proportions
//
//   {% logotypeLayout %}      'a' / 'friendly' / 'wave' stacked with spacing guides
//   {% logomarkLayout %}      mark aligned to the edge of the page
//   Both read the SVGs from ./blue by default (folder="..." to change).

import fs from "node:fs";
import path from "node:path";
import { relFromContent, assetUrl } from "./paths.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const list = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);
const problem = (msg) => `<p class="component-error">${esc(msg)}</p>`;

function split(args) {
  const last = args[args.length - 1];
  if (last && typeof last === "object" && last.__keywords) {
    const { __keywords, ...opts } = last;
    return { pos: args.slice(0, -1), opts };
  }
  return { pos: args, opts: {} };
}

const pageDir = (ctx) => path.dirname(path.resolve(ctx.page.inputPath));

// Inner markup of an SVG file, recoloured to currentColor.
function svgInner(file) {
  const src = fs.readFileSync(file, "utf8");
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return inner
    .replace(/\s(id|class|data-name)="[^"]*"/g, "")
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
}

function svg(file, box, attrs = "") {
  return `<svg viewBox="${box.join(" ")}" ${attrs} aria-hidden="true" focusable="false">${svgInner(file)}</svg>`;
}

const label = (file) => file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

export function plates(...args) {
  const { pos, opts } = split(args);
  const folder = pos[0] ?? ".";
  const dir = path.resolve(pageDir(this), folder);
  if (!fs.existsSync(dir)) return problem(`plates: folder "${folder}" not found next to this page`);

  const only = list(opts.only);
  const files = only.length
    ? only.filter((f) => fs.existsSync(path.join(dir, f)))
    : fs.readdirSync(dir).filter((f) => /\.(svg|png|jpe?g|webp|gif)$/i.test(f)).sort(byName);
  if (!files.length) return problem(`plates: no images found in "${folder}"`);

  const labels = list(opts.labels);
  const bg = opts.bg ? `background:var(--brand-${esc(opts.bg)}, ${esc(opts.bg)});` : "";
  const ratio = opts.ratio ? `aspect-ratio:${esc(opts.ratio)};` : "";
  const style = bg || ratio ? ` style="${bg}${ratio}"` : "";

  const items = files.map((f, i) => {
    const url = assetUrl(relFromContent(path.join(dir, f)));
    const cap = labels[i] || label(f);
    return (
      `<figure class="plate-row">` +
      `<figcaption>${esc(cap)}</figcaption>` +
      `<div class="plate plate--logo"${style}><img src="${url}" alt="${esc(cap)}"></div>` +
      `</figure>`
    );
  });
  return `<div class="plates">${items.join("")}</div>`;
}

// Logotype metrics, in the SVG units of the logo files (1152 unit em box).
const LT = {
  xTop: 288,
  xBottom: 864,
  a: { file: "Logo-Type_A.svg", x: [153, 549] },
  friendly: { file: "Logo-Type_Friendly.svg", x: [153, 3384] },
  wave: { file: "Logo-Type_Wave.svg", x: [135, 2286] },
};

export function logotypeLayout(...args) {
  const { opts } = split(args);
  const dir = path.resolve(pageDir(this), opts.folder || "blue");
  const h = LT.xBottom - LT.xTop;
  const full = LT.friendly.x[1] - LT.friendly.x[0];
  const part = (key) => {
    const p = LT[key];
    const file = path.join(dir, p.file);
    if (!fs.existsSync(file)) return null;
    const w = p.x[1] - p.x[0];
    return svg(file, [p.x[0], LT.xTop, w, h], `style="width:${((w / full) * 100).toFixed(3)}%"`);
  };
  const [a, friendly, wave] = ["a", "friendly", "wave"].map(part);
  if (!a || !friendly || !wave) return problem("logotypeLayout: Logo-Type_A/Friendly/Wave.svg not found");

  return (
    `<div class="plate logo-layout logo-layout--type">` +
    `<div class="ll-row ll-row--a ll-line-bottom">${a}<span class="ll-arrow ll-arrow--to-left"></span></div>` +
    `<div class="ll-gap"><span class="ll-varrow"></span></div>` +
    `<div class="ll-row ll-line-top ll-line-bottom">${friendly}</div>` +
    `<div class="ll-gap"><span class="ll-varrow"></span></div>` +
    `<div class="ll-row ll-row--wave ll-line-top"><span class="ll-arrow ll-arrow--to-right"></span>${wave}</div>` +
    `</div>`
  );
}

export function logomarkLayout(...args) {
  const { opts } = split(args);
  const file = path.resolve(pageDir(this), opts.folder || "blue", opts.file || "Logo-Mark_AFW.svg");
  if (!fs.existsSync(file)) return problem(`logomarkLayout: ${path.basename(file)} not found`);
  const size = Number(opts.size || 55);
  return (
    `<div class="plate logo-layout logo-layout--mark">` +
    svg(file, [9, 9, 1386, 1350], `style="width:${size}%"`) +
    `</div>`
  );
}
