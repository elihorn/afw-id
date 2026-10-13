// Logo components.
//
//   {% plates "blue" %}                                   every image in ./blue, one plate each, stacked
//   {% plates "blue", only="Logo-Type_01.svg, Logo-Mark_AFW.svg", labels="Logo type, Logo mark" %}
//   {% plates "blue", bg="neutral", ratio="2/1" %}        plate colour (token name) and proportions
//   {% plates "blue", pad="0" %}                          padding around the image (CSS value)
//
//   {% logotypeLayout %}      'a' / 'friendly' / 'wave' stacked with spacing guides
//   {% logomarkLayout %}      mark aligned to the edge of the page
//   {% logoOrigin %}          the 'e' beside the speaker it comes from, with geometry guides
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
  const pad = opts.pad != null ? `padding:${esc(opts.pad)};` : "";
  const style = bg || ratio || pad ? ` style="${bg}${ratio}${pad}"` : "";

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

// The 'e' of the logotype beside the speaker it is drawn from, with guides.
// The 'e' is the exact outline from Logo-Type_Friendly.svg (x 1224-1620, y 288-864):
// body 396 x 576, counter r117 centred across the width and in the top 396 square, notch 108
// high from the right
// edge ending in an r54 half circle. The speaker is a simplified redraw at the same height,
// with the woofer and port placed on the same centre lines as the counter and the notch.
const E_PATH =
  "M1224,864h396v-90h-108c-29.82,0-54-24.18-54-54s24.18-54,54-54h108v-378h-396v576Z" +
  "M1422,369c64.62,0,117,52.38,117,117s-52.38,117-117,117-117-52.38-117-117,52.38-117,117-117Z";

export function logoOrigin() {
  const H = 576;
  const sp = { w: 480, woofer: { cx: 240, cy: 198, r: 156 }, port: { cx: 357, cy: 432, r: 54 } };
  const ex = 720; // left edge of the 'e'
  const e = { w: 396, counter: { cx: ex + 198, cy: 198 }, notch: { cx: ex + 288, cy: 432, r: 54 } };
  const W = ex + e.w;
  const far = 5000; // guides run to the plate edges (the plate clips them)
  const g = (d) => `<path class="lo-guide" d="${d}"/>`;
  const ink = 'fill="currentColor"';
  const ground = 'style="fill:var(--plate-bg)"';
  const ring = (r) => `<circle cx="${sp.woofer.cx}" cy="${sp.woofer.cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="3"/>`;
  const speaker =
    `<rect x="0" y="0" width="${sp.w}" height="${H}" ${ink}/>` +
    `<circle cx="${sp.woofer.cx}" cy="${sp.woofer.cy}" r="${sp.woofer.r}" ${ground}/>` +
    ring(sp.woofer.r * 0.88) + ring(sp.woofer.r * 0.79) + ring(sp.woofer.r * 0.4) +
    `<circle cx="${sp.port.cx}" cy="${sp.port.cy}" r="${sp.port.r}" ${ground}/>`;
  const letter = `<path d="${E_PATH}" transform="translate(${ex - 1224} -288)" ${ink} fill-rule="evenodd"/>`;
  const guides =
    g(`M${-far} ${sp.woofer.cy}H${far}`) + // woofer centre = counter centre
    g(`M${-far} ${sp.port.cy}H${far}`) + // port centre = notch centre
    g(`M${sp.woofer.cx} ${-far}V${far}`) + // woofer on the speaker's centre axis
    g(`M${e.counter.cx} ${-far}V${far}`) + // counter on the letter's centre axis
    `<circle class="lo-guide" cx="${e.notch.cx}" cy="${e.notch.cy}" r="${e.notch.r}"/>` + // the port circle inside the notch
    g(`M${sp.w + 60} ${H / 2}H${ex - 60}M${ex - 84} ${H / 2 - 24}l24 24-24 24`); // arrow
  return (
    `<div class="plate logo-layout logo-layout--origin">` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The speaker cabinet, woofer and port, and the letter e drawn from them">${speaker}${letter}${guides}</svg>` +
    `</div>`
  );
}
