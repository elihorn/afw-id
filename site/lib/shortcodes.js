// Content components, used inside markdown on their own line:
//
//   {% gallery "profiles" %}                    auto-fill grid
//   {% gallery "profiles", cols=3 %}            up to 3 columns, fewer on small screens
//   {% gallery "profiles", cols=1, captions=true, min=320 %}
//
//   {% swatches %}                              every colour in brand/brand.json
//   {% swatches "blue", "neutral", size="small" %}
//
//   {% download "_files/AFW_Logos.zip", "Logo package" %}
//   {% download "https://drive.google.com/...", "Print masters" %}
//
// Paths are relative to the page's own folder.

import fs from "node:fs";
import path from "node:path";
import { relFromContent, assetUrl } from "./paths.js";
import { BRAND_FILE as BRAND } from "./source.js";

const IMAGE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const VIDEO = /\.(mp4|webm|mov)$/i;

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

// Nunjucks passes key=value arguments as a final object flagged __keywords.
function split(args) {
  const last = args[args.length - 1];
  if (last && typeof last === "object" && last.__keywords) {
    const { __keywords, ...opts } = last;
    return { pos: args.slice(0, -1), opts };
  }
  return { pos: args, opts: {} };
}

const pageDir = (ctx) => path.dirname(path.resolve(ctx.page.inputPath));
const byName = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const caption = (file) => file.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
const problem = (msg) => `<p class="component-error">${esc(msg)}</p>`;

export function fileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function gallery(...args) {
  const { pos, opts } = split(args);
  const folder = pos[0] ?? ".";
  const cols = Number(opts.cols ?? pos[1] ?? 0);
  const dir = path.resolve(pageDir(this), folder);
  if (!fs.existsSync(dir))
    return problem(`gallery: folder "${folder}" not found next to this page`);

  const files = fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith(".") && (IMAGE.test(f) || VIDEO.test(f)))
    .sort(byName);
  if (!files.length) return problem(`gallery: no images in "${folder}"`);

  const style = [
    cols ? `--cols:${cols}` : "",
    opts.min ? `--min:${Number(opts.min)}px` : "",
    opts.gap ? `--gap:${esc(opts.gap)}` : "",
  ]
    .filter(Boolean)
    .join(";");

  const items = files.map((f) => {
    const url = assetUrl(relFromContent(path.join(dir, f)));
    const text = caption(f);
    const media = VIDEO.test(f)
      ? `<video src="${url}" muted loop autoplay playsinline></video>`
      : `<a href="${url}"><img src="${url}" alt="${esc(text)}" loading="lazy"></a>`;
    const cap = opts.captions ? `<figcaption>${esc(text)}</figcaption>` : "";
    return `<figure>${media}${cap}</figure>`;
  });

  const cls = [
    "gallery",
    cols ? "gallery--cols" : "",
    opts.class ? esc(opts.class) : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<div class="${cls}"${style ? ` style="${style}"` : ""}>${items.join("")}</div>`;
}

function readBrand() {
  return JSON.parse(fs.readFileSync(BRAND, "utf8"));
}

export function swatches(...args) {
  const { pos, opts } = split(args);
  let tokens;
  try {
    tokens = readBrand().color.colors;
  } catch (e) {
    return problem(`swatches: could not read brand/brand.json (${e.message})`);
  }
  const names = pos.filter((p) => typeof p === "string");
  const list = names.length
    ? names.map((n) => tokens.find((t) => t.name === n)).filter(Boolean)
    : tokens;
  const size = opts.size === "small" ? "small" : "large";

  const tiles = list.map((t) => {
    const hex = (t.hex || "").toUpperCase();
    const join = (v) => (Array.isArray(v) ? v.join(" ") : v);
    const specs = [
      `<div><dt>HEX</dt><dd>${esc(hex)}</dd></div>`,
      t.rgb ? `<div><dt>RGB</dt><dd>${esc(join(t.rgb))}</dd></div>` : "",
      t.cmyk ? `<div><dt>CMYK</dt><dd>${esc(join(t.cmyk))}</dd></div>` : "",
      t.pms ? `<div><dt>PMS</dt><dd>${esc(t.pms)}</dd></div>` : "",
    ].join("");
    return (
      `<figure class="swatch">` +
      `<div class="swatch__chip" style="background:${esc(hex)}"></div>` +
      `<figcaption><strong class="swatch__name">${esc(t.label || t.name)}</strong>` +
      `<dl class="swatch__specs">${specs}</dl>` +
      (t.role && opts.usage !== false
        ? `<p class="swatch__usage">${esc(t.role)}</p>`
        : "") +
      `</figcaption></figure>`
    );
  });
  return `<div class="swatches swatches--${size}">${tiles.join("")}</div>`;
}

export function download(...args) {
  const { pos, opts } = split(args);
  const target = pos[0];
  const text = pos[1] || opts.label;
  if (!target) return problem("download: no file or link given");

  if (/^https?:\/\//.test(target)) {
    // Label defaults to the address without the protocol or trailing slash; the arrow comes from CSS
    const label = text || target.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `<a class="download" href="${esc(target)}" target="_blank" rel="noopener"><span class="download__label">${esc(label)}</span></a>`;
  }
  const file = path.resolve(pageDir(this), target);
  if (!fs.existsSync(file))
    return problem(`download: "${target}" not found next to this page`);
  const name = path.basename(file);
  const ext = path.extname(name).slice(1).toUpperCase();
  const meta = `${ext} · ${fileSize(fs.statSync(file).size)}`;
  return `<a class="download" href="${assetUrl(relFromContent(file))}" download><span class="download__label">${esc(text || name)}</span><span class="download__meta">${esc(meta)}</span></a>`;
}

// Output formats from brand.json "output". Ratio is derived from the size.
//   {% specs %}                    every format, with a Type column
//   {% specs "instagram-post" %}   one or more formats, no Type column
export function specs(...args) {
  const { pos } = split(args);
  let output;
  try {
    output = readBrand().output;
  } catch (e) {
    return problem(`specs: could not read brand/brand.json (${e.message})`);
  }
  if (!output?.formats) return problem("specs: no output formats in brand.json");
  const names = pos.filter((p) => typeof p === "string" && p);
  const missing = names.filter((n) => !output.formats.some((f) => f.name === n));
  if (missing.length) return problem(`specs: unknown format "${missing.join('", "')}"`);
  const list = names.length
    ? names.map((n) => output.formats.find((f) => f.name === n))
    : output.formats;

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const head = ["Ratio", "Dimensions", "Resolution", "Colour space"];
  if (!names.length) head.unshift("Type");
  const rows = list.map((f) => {
    const medium = output.media?.[f.medium] ?? {};
    const d = gcd(f.width, f.height);
    const cells = [
      `${f.width / d}:${f.height / d}`,
      `${f.width} x ${f.height} ${f.unit}`,
      medium.resolution ? `${medium.resolution} ppi` : "",
      medium.colorSpace ?? "",
    ];
    if (!names.length) cells.unshift(f.label || f.name);
    return `<tr>${cells.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`;
  });
  return (
    `<table class="specs"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows.join("")}</tbody></table>`
  );
}
