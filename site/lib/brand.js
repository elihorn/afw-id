// Components driven by brand/tokens.json. Edit the tokens and these update.
//
//   {% brandCss %}                         (in the layout) colour + type variables, @font-face
//   {% palette "primary" %}                large colour plates for one group
//   {% fontSpecimen %}                     brand font specimen
//   {% typeStyle "h1-print" %}text{% endtypeStyle %}   style specimen with leading guides + specs
//
// Every type style in the tokens also becomes a CSS class: .ts-h1-print, .ts-p1-print, ...
// so one-off layouts can be written in HTML and still follow the tokens.

import fs from "node:fs";
import path from "node:path";

const TOKENS = path.resolve("brand/tokens.json");

export const tokens = () => JSON.parse(fs.readFileSync(TOKENS, "utf8"));

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const num = (v) => parseFloat(v) || 0;
const hexOf = (t) => (t.hex || t.value?.light || Object.values(t.value || {})[0] || "").toUpperCase();

function split(args) {
  const last = args[args.length - 1];
  if (last && typeof last === "object" && last.__keywords) {
    const { __keywords, ...opts } = last;
    return { pos: args.slice(0, -1), opts };
  }
  return { pos: args, opts: {} };
}

function allStyles(t) {
  const out = [];
  for (const g of t.type?.groups || []) {
    for (const s of g.styles || []) out.push({ ...s, group: g });
  }
  return out;
}

function findStyle(t, name) {
  return allStyles(t).find((s) => s.name === name);
}

function familyKey(t, style) {
  return style.family || style.group?.family || Object.keys(t.type?.families || {})[0];
}

function fontFor(t, style) {
  const stack = t.type?.families?.[familyKey(t, style)] || "";
  const first = stack.split(",")[0].replace(/["']/g, "").trim();
  return (t.type?.fonts || []).find((f) => f.family === first) || (t.type?.fonts || [])[0] || {};
}

// --------------------------------------------------------------------------
// CSS variables and classes from the tokens
// --------------------------------------------------------------------------

export function brandCss() {
  const t = tokens();
  const lines = [];

  for (const f of t.type?.fonts || []) {
    if (!f.file) continue;
    lines.push(
      `@font-face{font-family:"${f.family}";src:url("/brand/${f.file}");font-weight:${f.weight || 400};font-style:${f.style || "normal"};font-display:swap}`
    );
  }

  const vars = [];
  for (const c of t.color?.tokens || []) vars.push(`--brand-${c.name}:${hexOf(c)}`);
  for (const [k, v] of Object.entries(t.type?.families || {})) vars.push(`--brand-font-${k}:${v}`);
  lines.push(`:root{${vars.join(";")}}`);

  for (const s of allStyles(t)) {
    const f = fontFor(t, s);
    const m = f.metrics || { ascent: 0.8, descent: 0.2, capHeight: 0.7 };
    const size = num(s.fontSize);
    const lead = num(s.lineHeight) || size * 1.2;
    const para = num(s.paragraphSpacing);
    lines.push(
      `.ts-${s.name}{` +
        `--ts-size:${size}px;--ts-leading:${lead}px;--ts-para:${para}px;` +
        `--ts-ascent:${m.ascent};--ts-descent:${m.descent};--ts-cap:${m.capHeight};` +
        `font-family:var(--brand-font-${familyKey(t, s)});` +
        `font-weight:${s.fontWeight || 400};font-style:${s.fontStyle || "normal"};` +
        `letter-spacing:${s.letterSpacing && s.letterSpacing !== "0" ? s.letterSpacing : "normal"};` +
        `text-transform:${s.textTransform || "none"};` +
        `font-size:calc(var(--ts-size) * var(--type-scale, 1));` +
        `line-height:calc(var(--ts-leading) * var(--type-scale, 1))}`
    );
  }
  return `<style>${lines.join("\n")}</style>`;
}

// --------------------------------------------------------------------------
// Colour plates
// --------------------------------------------------------------------------

export function palette(...args) {
  const { pos, opts } = split(args);
  const t = tokens();
  const all = t.color?.tokens || [];
  const group = pos[0];
  const list = group ? all.filter((c) => c.group === group) : all;
  const byName = Object.fromEntries(all.map((c) => [c.name, c]));
  const blank = "---";

  const plates = list.map((c) => {
    const ink = c.ink && byName[c.ink] ? `var(--brand-${c.ink})` : c.ink || "#000";
    const specs = [
      ["HEX", hexOf(c)],
      ["RGB", c.rgb],
      ["CMYK", c.cmyk],
      ["PMS", c.pms],
    ]
      .map(([k, v]) => {
        const parts = v ? String(v).split(/\s+/).map((p) => `<span>${esc(p)}</span>`).join("") : `<span>${blank}</span>`;
        return `<div><dt>${k}</dt><dd>${parts}</dd></div>`;
      })
      .join("");
    const note = c.usage && opts.notes !== false ? `<p class="colour__note">${esc(c.usage)}</p>` : "";
    return (
      `<figure class="colour">` +
      `<div class="colour__plate" style="background:var(--brand-${c.name});color:${ink}">` +
      `<div class="colour__head"><strong>${esc(c.label || c.name)}</strong><span>${esc(c.purpose || "")}</span></div>` +
      `<dl class="colour__specs">${specs}</dl>` +
      `</div>${note}</figure>`
    );
  });
  return `<div class="palette">${plates.join("")}</div>`;
}

// --------------------------------------------------------------------------
// Type
// --------------------------------------------------------------------------

export function fontSpecimen(...args) {
  const { opts } = split(args);
  const t = tokens();
  const core = (t.type?.groups || []).find((g) => g.core) || t.type?.groups?.[0];
  const big = opts.large || core?.styles?.[0]?.name;
  const small = opts.small || core?.styles?.[1]?.name || big;
  const f = fontFor(t, findStyle(t, big) || {});
  const name = `${f.family || ""} Regular`;
  const scale = opts.scale ? ` style="--type-scale:${Number(opts.scale)}"` : "";
  return (
    `<div class="plate plate--type"${scale}>` +
    `<p class="ts-${big}" style="text-transform:uppercase;margin:0">${esc(name)} All Caps</p>` +
    `<p class="ts-${small}" style="text-transform:none;margin:0 0 1.5em">${esc(name)}</p>` +
    `<p class="ts-${small} specimen__glyphs" style="text-transform:none;margin:0">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp; @ # $ % ( ) – , . : ; ! ? ’ “ ”</p>` +
    `</div>`
  );
}

const ratio = (a, b) => Math.round((a / b) * 100);

export function typeStyle(content, ...args) {
  const { pos, opts } = split(args);
  const t = tokens();
  const s = findStyle(t, pos[0]);
  if (!s) return `<p class="component-error">typeStyle: no style "${esc(pos[0])}" in brand/tokens.json</p>`;

  const f = fontFor(t, s);
  const unit = s.group?.unit || "px";
  const size = num(s.fontSize);
  const lead = num(s.lineHeight) || size * 1.2;
  const para = num(s.paragraphSpacing);
  const text = (content || s.sample || "").trim();
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.trim().split("\n").map(esc).join("<br>")}</p>`)
    .join("");
  const caps = s.textTransform === "uppercase" ? " (ALL CAPS)" : "";
  const fmt = (v) => `${+v.toFixed(2)}${unit}`;
  const specs = [
    `<strong>${esc(s.label || s.name)}</strong>`,
    `${esc(f.family || familyKey(t, s))}${caps}`,
    `~ ${ratio(lead, size)}% line height<br>= ${fmt(lead)} leading<br>/ ${fmt(size)} type`,
    para ? `${fmt(para)} paragraph space` : "",
  ]
    .filter(Boolean)
    .map((x) => `<p>${x}</p>`)
    .join("");
  const guides = opts.guides === false ? "" : " typestyle__sample--guides";
  const scale = opts.scale ? ` style="--type-scale:${Number(opts.scale)}"` : "";
  return (
    `<div class="typestyle"${scale}>` +
    `<div class="plate plate--type"><div class="ts-${s.name} typestyle__sample${guides}">${paras}</div></div>` +
    `<div class="typestyle__specs">${specs}</div>` +
    `</div>`
  );
}
