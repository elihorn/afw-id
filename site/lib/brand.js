// Components driven by brand/brand.json, the portable core brand definition.
// Edit brand.json and everything here follows.
//
//   {% brandCss %}                         (in the layout) colour + type variables, @font-face, .ts-* classes
//   {% palette "primary" %}                large colour plates for one group
//   {% fontSpecimen %}                     brand font specimen
//   {% typeStyle "h1" %}text{% endtypeStyle %}   style specimen with baseline guides + specs
//
// Line height and paragraph space are brand-wide values (type.leading, type.paragraphSpacing),
// not per style: every style inherits them, in em, so they scale with the type size.
// Every style also becomes a CSS class (.ts-h1, .ts-p1, ...) for one-off layouts written in HTML.

import fs from "node:fs";
import path from "node:path";

const BRAND = path.resolve("brand/brand.json");

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

function paraCss(t) {
  const p = paraFactor(t);
  return p.lh !== undefined ? `calc(var(--brand-leading) * ${p.lh}em)` : `${p.em}em`;
}

// Paragraph space in em of the style's own size
function paraEm(t) {
  const p = paraFactor(t);
  return p.lh !== undefined ? p.lh * (t.leading || 1.2) : p.em;
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
      `@font-face{font-family:"${f.family}";src:url("/brand/${f.file}");font-weight:${f.weight || 400};font-style:${f.style || "normal"};font-display:swap}`
    );
  }

  const vars = [];
  for (const c of b.color?.colors || []) vars.push(`--brand-${c.name}:${c.hex}`);
  for (const [k, v] of Object.entries(t.families || {})) vars.push(`--brand-font-${k}:${stack(v)}`);
  vars.push(`--brand-leading:${t.leading || 1.2}`);
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
        `line-height:var(--brand-leading);` +
        `text-transform:${CASE[s.case] || "none"}}`
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

export function fontSpecimen(...args) {
  const { opts } = split(args);
  const b = brand();
  const styles = b.type?.styles || [];
  const big = opts.large || styles[0]?.name;
  const small = opts.small || styles[1]?.name || big;
  const f = fontOf(b, styles.find((s) => s.name === big) || styles[0] || {});
  const name = `${f.family || ""} Regular`;
  const scale = opts.scale ? ` style="--type-scale:${Number(opts.scale)}"` : "";
  return (
    `<div class="plate plate--type"${scale}>` +
    `<p class="ts-${big}" style="text-transform:uppercase">${esc(name)} All Caps</p>` +
    `<p class="ts-${small}" style="text-transform:none">${esc(name)}</p>` +
    `<p class="ts-${small} specimen__glyphs" style="text-transform:none;margin-top:calc(var(--brand-leading) * 1em)">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; @ # $ % ( ) – , . : ; ! ? ’ “ ”</p>` +
    `</div>`
  );
}

export function typeStyle(content, ...args) {
  const { pos, opts } = split(args);
  const b = brand();
  const t = b.type || {};
  const s = (t.styles || []).find((x) => x.name === pos[0]);
  if (!s) return problem(`typeStyle: no style "${pos[0]}" in brand/brand.json`);

  const unit = t.sizeUnit || "px";
  const leading = t.leading || 1.2;
  const fmt = (v) => `${+v.toFixed(2)}${unit}`;
  const text = (content || "").trim();
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.trim().split("\n").map(esc).join("<br>")}</p>`)
    .join("");
  const caps = s.case === "upper" ? " (ALL CAPS)" : "";
  const specs = [
    `<strong>${esc(s.label || s.name)}</strong>`,
    `${esc(fontOf(b, s).family || s.family)}${caps}`,
    `~ ${Math.round(leading * 100)}% line height<br>= ${fmt(s.size * leading)} leading<br>/ ${fmt(s.size)} type`,
    `${fmt(s.size * paraEm(t))} paragraph space`,
  ]
    .map((x) => `<p>${x}</p>`)
    .join("");
  const guides = opts.guides === false ? "" : " typestyle__sample--guides";
  const scale = opts.scale ? ` style="--type-scale:${Number(opts.scale)}"` : "";
  return (
    `<div class="typestyle"${scale}>` +
    `<div class="typestyle__specs">${specs}</div>` +
    `<div class="plate plate--type"><div class="ts-${s.name} typestyle__sample${guides}">${paras}</div></div>` +
    `</div>`
  );
}
