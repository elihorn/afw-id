// Components driven by brand/brand.json, the portable core brand definition.
// Edit brand.json and everything here follows.
//
//   {% brandCss %}                         (in the layout) colour + type variables, @font-face, .ts-* classes
//   {% palette "primary" %}                large colour plates for one group
//   {% fontSpecimen %}                     each brand font: name, licence, source, character set
//   {% typeStyle "h1" %}text{% endtypeStyle %}   style specimen with baseline guides + specs
//   {% typeLayout "p1" %}rows{% endtypeLayout %}  .type-row HTML on the column/baseline grid, specs beside it
//
// Style "tracking" is in 1/1000 em, as in Illustrator (-35 = -0.035em).
// Line height and paragraph space are brand-wide values (type.leading, type.paragraphSpacing),
// inherited by every style in em, so they scale with the type size. A style may set its own
// "leading" (e.g. 1.0 for display); paragraph space then follows that style's line height.
// Every style also becomes a CSS class (.ts-h1, .ts-p1, ...) for layouts written in HTML
// (see .type-layout in theme.css). Font names always come from brand.json, never the content.

import fs from "node:fs";
import path from "node:path";
import { BRAND_FILE as BRAND, PREFIX } from "./source.js";

export const brand = () => JSON.parse(fs.readFileSync(BRAND, "utf8"));

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function split(args) {
  const last = args[args.length - 1];
  if (last && typeof last === "object" && last.__keywords) {
    const { __keywords, ...opts } = last;
    return { pos: args.slice(0, -1), opts };
  }
  return { pos: args, opts: {} };
}

const problem = (msg) => `<p class="component-error">${esc(msg)}</p>`;

// --------------------------------------------------------------------------
// Reading the brand values
// --------------------------------------------------------------------------

const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+)$/;
const stack = (list) => (Array.isArray(list) ? list : [list]).map((f) => (GENERIC.test(f) ? f : `"${f}"`)).join(", ");

const CASE = { upper: "uppercase", lower: "lowercase", sentence: "none", none: "none" };

// paragraphSpacing: "0.5lh" = half the line height, "0.6em", or a plain number of em
function paraFactor(t) {
  const v = String(t.paragraphSpacing ?? "0.5lh").trim();
  if (v.endsWith("lh")) return { lh: parseFloat(v) };
  return { em: parseFloat(v) };
}

function paraCss(t, leadingVar = "--brand-leading") {
  const p = paraFactor(t);
  return p.lh !== undefined ? `calc(var(${leadingVar}) * ${p.lh}em)` : `${p.em}em`;
}

// Paragraph space in em of the style's own size
// A leading may be a number (1.2) or a fraction string ("4/3")
export function ratio(v, fallback = 1.2) {
  if (v == null || v === "") return fallback;
  if (typeof v === "string" && v.includes("/")) {
    const [a, b] = v.split("/").map(Number);
    return b ? a / b : fallback;
  }
  return Number(v) || fallback;
}
const leadingOf = (t, s = {}) => ratio(s.leading ?? t.leading);

// Print sizes (pt) are shown larger on screen than pixel sizes
const SCREEN_SCALE = { pt: 1.6, px: 1.25 };

function paraEm(t, leading = leadingOf(t)) {
  const p = paraFactor(t);
  return p.lh !== undefined ? p.lh * leading : p.em;
}

// Display name of a font: "name" if given, else family + weight name ("Iosevka Aile Heavy")
const WEIGHTS = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Heavy" };
export function fontName(f) {
  if (f.name) return f.name;
  const italic = f.style === "italic" ? " Italic" : "";
  return `${f.family || ""} ${WEIGHTS[f.weight || 400] || f.weight}${italic}`.trim();
}

function fontOf(b, style) {
  const fam = b.type?.families?.[style.family] || [];
  const first = (Array.isArray(fam) ? fam[0] : String(fam).split(",")[0]).replace(/["']/g, "").trim();
  return (b.type?.fonts || []).find((f) => f.family === first) || (b.type?.fonts || [])[0] || {};
}

function luminance(hex) {
  const n = hex.replace("#", "");
  const [r, g, bl] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// --------------------------------------------------------------------------
// CSS from the brand values
// --------------------------------------------------------------------------

export function brandCss() {
  const b = brand();
  const t = b.type || {};
  const lines = [];

  for (const f of t.fonts || []) {
    if (!f.file) continue;
    lines.push(
      `@font-face{font-family:"${f.family}";src:url("${PREFIX}brand/${f.file}");font-weight:${f.weight || 400};font-style:${f.style || "normal"};font-display:swap}`
    );
  }

  const vars = [];
  for (const c of b.color?.colors || []) vars.push(`--brand-${c.name}:${c.hex}`);
  for (const [k, v] of Object.entries(t.families || {})) vars.push(`--brand-font-${k}:${stack(v)}`);
  vars.push(`--brand-leading:${+leadingOf(t).toFixed(6)}`);
  vars.push(`--screen-scale:${SCREEN_SCALE[t.sizeUnit] || 1}`, `--type-scale:var(--screen-scale)`);
  vars.push(`--brand-para:${paraCss(t)}`);
  vars.push(`--brand-radius:${b.shape?.radius ?? 0}px`);
  lines.push(`:root{${vars.join(";")}}`);

  for (const s of t.styles || []) {
    const m = fontOf(b, s).metrics || { ascent: 0.8, descent: 0.2 };
    lines.push(
      `.ts-${s.name}{` +
        `--ts-ascent:${m.ascent};--ts-descent:${m.descent};` +
        `font-family:var(--brand-font-${s.family});font-weight:${s.weight || 400};font-style:${s.style || "normal"};` +
        `font-size:calc(${s.size}px * var(--type-scale, 1));` +
        `--ts-leading:${s.leading != null ? +ratio(s.leading).toFixed(6) : "var(--brand-leading)"};--ts-para:${paraCss(t, "--ts-leading")};` +
        `line-height:var(--ts-leading);` +
        `text-transform:${CASE[s.case] || "none"};` +
        `letter-spacing:${(s.tracking || 0) / 1000}em}`
    );
  }
  return `<style>${lines.join("\n")}</style>`;
}

// --------------------------------------------------------------------------
// Colour plates
// --------------------------------------------------------------------------

export function palette(...args) {
  const { pos } = split(args);
  const all = brand().color?.colors || [];
  const group = pos[0];
  const list = group ? all.filter((c) => c.group === group) : all;
  const light = all[1];        // the light ground (neutral)
  const blank = "---";

  const plates = list.map((c) => {
    // Ink on the plate: whichever reads better, black or the light ground
    const ink = light && contrast(c.hex, light.hex) > contrast(c.hex, "#000000") ? `var(--brand-${light.name})` : "#000";
    const row = (k, v) => {
      const parts = v == null || v === "" ? [blank] : Array.isArray(v) ? v : String(v).split(/\s+/);
      return `<div><dt>${k}</dt><dd>${parts.map((p) => `<span>${esc(p)}</span>`).join("")}</dd></div>`;
    };
    const specs = row("HEX", c.hex) + row("RGB", c.rgb) + row("CMYK", c.cmyk) + row("PMS", c.pms);

    return (
      `<figure class="colour">` +
      `<div class="colour__plate" style="background:var(--brand-${c.name});color:${ink}">` +
      `<div class="colour__head"><strong>${esc(c.label || c.name)}</strong><span>${esc(c.role || "")}</span></div>` +
      `<dl class="colour__specs">${specs}</dl>` +
      `</div></figure>`
    );
  });
  return `<div class="palette">${plates.join("")}</div>`;
}

// --------------------------------------------------------------------------
// Type
// --------------------------------------------------------------------------

// One row per font in brand.json: name, licence and source link beside its character set.
// Every font is shown at the body (smallest) style size on the brand leading, enlarged on screen
// by --example-scale like the other type examples.
export function fontSpecimen() {
  const b = brand();
  const fonts = b.type?.fonts || [];
  const sizes = (b.type?.styles || []).map((s) => s.size).filter(Boolean);
  const body = sizes.length ? Math.min(...sizes) : 10;
  const size = `calc(${+body.toFixed(3)}px * var(--type-scale, 1))`;
  const rows = fonts
    .map((f) => {
      const name = fontName(f);
      const set = `class="plate plate--type" style="font-family:${esc(stack([f.family]))};font-weight:${f.weight || 400};font-style:${f.style || "normal"};font-size:${size}"`;
      const src = f.source ? `<p><a href="${esc(f.source)}" target="_blank" rel="noopener">Source</a></p>` : "";
      return (
        `<figure class="plate-row specimen">` +
        `<figcaption><p>${esc(name)}</p>${f.licence ? `<p>${esc(f.licence)}</p>` : ""}${src}</figcaption>` +
        `<div ${set}>` +
        `<p class="specimen__name">${esc(name)}</p>` +
        `<p class="specimen__glyphs">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; @ # $ % ( ) – , . : ; ! ? ’ “ ”</p>` +
        `</div></figure>`
      );
    })
    .join("");
  return `<div class="plates">${rows}</div>`;
}

export function typeStyle(content, ...args) {
  const { pos, opts } = split(args);
  const b = brand();
  const t = b.type || {};
  const s = (t.styles || []).find((x) => x.name === pos[0]);
  if (!s) return problem(`typeStyle: no style "${pos[0]}" in brand/brand.json`);

  const unit = t.sizeUnit || "px";
  const leading = leadingOf(t, s);
  const fmt = (v) => `${+v.toFixed(2)}${unit}`;
  const text = (content || "").trim();
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.trim().split("\n").map(esc).join("<br>")}</p>`)
    .join("");
  const caps = s.case === "upper" ? " (ALL CAPS)" : "";
  const specs = [
    `<strong>${esc(s.label || s.name)}</strong>`,
    `${esc(fontName(fontOf(b, s)))}${caps}`,
    `~ ${Math.round(leading * 100)}% line height<br>= ${fmt(s.size * leading)} leading<br>/ ${fmt(s.size)} type`,
    s.tracking ? `${s.tracking} tracking` : "",
    `${fmt(s.size * paraEm(t, leading))} paragraph space`,
  ]
    .filter(Boolean)
    .map((x) => `<p>${x}</p>`)
    .join("");
  const guides = opts.guides === false ? "" : " typestyle__sample--guides";
  const scale = opts.scale ? ` style="--type-scale:${Number(opts.scale)}"` : "";
  return (
    `<figure class="plate-row typestyle"${scale}>` +
    `<figcaption>${specs}</figcaption>` +
    `<div class="plate plate--type"><div class="ts-${s.name} typestyle__sample${guides}">${paras}</div></div>` +
    `</figure>`
  );
}

// A layout on the column and baseline grid. The content is .type-row HTML (see theme.css);
// the base style sets size and leading, grid.margin and grid.gutter (in the type size unit,
// on the same reference format) set the side margins and column gutters; top and bottom
// margins are one line of the base style, so the text stays on the baseline grid. Specs beside it.
export function typeLayout(content, ...args) {
  const { pos, opts } = split(args);
  const b = brand();
  const t = b.type || {};
  const g = b.grid || {};
  const s = (t.styles || []).find((x) => x.name === (pos[0] || "p1"));
  if (!s) return problem(`typeLayout: no style "${pos[0] || "p1"}" in brand/brand.json`);

  const unit = t.sizeUnit || "px";
  const fmt = (v) => `${+v.toFixed(2)}${unit}`;
  const leading = leadingOf(t, s);
  const cols = Number(opts.cols || 3);
  const px = (v) => `calc(${v}px * var(--type-scale, 1))`;
  const vars = [`--layout-cols:${cols}`];
  // Without grid tokens, gutter = 2x and margin = 1x the base size (the module rule), so the
  // spacing always scales with the type. Only token values are listed in the specs.
  const row = s.size * leading;
  const gutter = g.gutter ?? s.size * 2;
  const margin = g.margin ?? gutter / 2;
  vars.push(`--margin-y:${px(row)}`, `--margin-x:${px(margin)}`, `--gap:${px(gutter)}`);
  const specs = [
    `<strong>Layout</strong>`,
    `${esc(s.label || s.name)} base, ${cols} columns`,
    `${fmt(s.size * leading)} leading<br>${fmt(s.size * paraEm(t, leading))} paragraph space`,
    g.margin != null || g.gutter != null
      ? [g.margin != null ? `${fmt(g.margin)} margins<br>${fmt(row)} top and bottom` : "", g.gutter != null ? `${fmt(g.gutter)} gutters` : ""].filter(Boolean).join("<br>")
      : "",
  ]
    .filter(Boolean)
    .map((x) => `<p>${x}</p>`)
    .join("");
  const guides = opts.guides === false ? "" : " guides";
  return (
    `<figure class="plate-row type-layout-row" style="${vars.join(";")}">` +
    `<figcaption>${specs}</figcaption>` +
    `<div class="plate plate--type plate--layout"><div class="type-layout ts-${s.name}${guides}">${content.trim()}</div></div>` +
    `</figure>`
  );
}
