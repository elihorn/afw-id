// Content components, used inside markdown on their own line:
//
//   {% gallery "profiles" %}                    auto-fill grid
//   {% gallery "profiles", cols=3 %}            up to 3 columns, fewer on small screens
//   {% gallery "profiles", cols=1, captions=true, min=320 %}
//
//   {% swatches %}                              every colour in brand/tokens.json
//   {% swatches "blue", "neutral", size="small" %}
//
//   {% download "_files/AFW_Logos.zip", "Logo package" %}
//   {% download "https://drive.google.com/...", "Print masters" %}
//
// Paths are relative to the page's own folder.

import fs from "node:fs";
import path from "node:path";
import { relFromContent, assetUrl } from "./paths.js";

const IMAGE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const VIDEO = /\.(mp4|webm|mov)$/i;
const TOKENS = path.resolve("brand/tokens.json");

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

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
const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const caption = (file) => file.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
const problem = (msg) => `<p class="component-error">${esc(msg)}</p>`;

function fileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function gallery(...args) {
  const { pos, opts } = split(args);
  const folder = pos[0] ?? ".";
  const cols = Number(opts.cols ?? pos[1] ?? 0);
  const dir = path.resolve(pageDir(this), folder);
  if (!fs.existsSync(dir)) return problem(`gallery: folder "${folder}" not found next to this page`);

  const files = fs.readdirSync(dir).filter((f) => !f.startsWith(".") && (IMAGE.test(f) || VIDEO.test(f))).sort(byName);
  if (!files.length) return problem(`gallery: no images in "${folder}"`);

  const style = [cols ? `--cols:${cols}` : "", opts.min ? `--min:${Number(opts.min)}px` : "", opts.gap ? `--gap:${esc(opts.gap)}` : ""]
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

  const cls = ["gallery", cols ? "gallery--cols" : "", opts.class ? esc(opts.class) : ""].filter(Boolean).join(" ");
  return `<div class="${cls}"${style ? ` style="${style}"` : ""}>${items.join("")}</div>`;
}

function readTokens() {
  return JSON.parse(fs.readFileSync(TOKENS, "utf8"));
}

export function swatches(...args) {
  const { pos, opts } = split(args);
  let tokens;
  try {
    tokens = readTokens().color.tokens;
  } catch (e) {
    return problem(`swatches: could not read brand/tokens.json (${e.message})`);
  }
  const names = pos.filter((p) => typeof p === "string");
  const list = names.length ? names.map((n) => tokens.find((t) => t.name === n)).filter(Boolean) : tokens;
  const size = opts.size === "small" ? "small" : "large";

  const tiles = list.map((t) => {
    const hex = (t.hex || t.value?.light || Object.values(t.value || {})[0] || "").toUpperCase();
    const specs = [
      `<div><dt>HEX</dt><dd>${esc(hex)}</dd></div>`,
      t.rgb ? `<div><dt>RGB</dt><dd>${esc(t.rgb)}</dd></div>` : "",
      t.cmyk ? `<div><dt>CMYK</dt><dd>${esc(t.cmyk)}</dd></div>` : "",
      t.pms ? `<div><dt>PMS</dt><dd>${esc(t.pms)}</dd></div>` : "",
    ].join("");
    return (
      `<figure class="swatch">` +
      `<div class="swatch__chip" style="background:${esc(hex)}"></div>` +
      `<figcaption><strong class="swatch__name">${esc(t.label || t.name)}</strong>` +
      `<dl class="swatch__specs">${specs}</dl>` +
      (t.usage && opts.usage !== false ? `<p class="swatch__usage">${esc(t.usage)}</p>` : "") +
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
    return `<a class="download" href="${esc(target)}" target="_blank" rel="noopener"><span class="download__label">${esc(text || target)}</span><span class="download__meta">Link</span></a>`;
  }
  const file = path.resolve(pageDir(this), target);
  if (!fs.existsSync(file)) return problem(`download: "${target}" not found next to this page`);
  const name = path.basename(file);
  const ext = path.extname(name).slice(1).toUpperCase();
  const meta = `${ext} · ${fileSize(fs.statSync(file).size)}`;
  return `<a class="download" href="${assetUrl(relFromContent(file))}" download><span class="download__label">${esc(text || name)}</span><span class="download__meta">${esc(meta)}</span></a>`;
}
