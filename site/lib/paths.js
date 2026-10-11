// Path rules shared by permalinks, navigation and assets.
//
//   content/01-identity/02-colour.md      -> /identity/colour/
//   content/01-identity/01-logo/index.md  -> /identity/logo/
//   content/01-identity/01-logo/marks/A.svg -> /identity/logo/marks/A.svg
//
// Folder and page names: a leading number ("01-", "01.", "01 ") sets the order
// and is removed. A leading "_" hides a page or folder from the sidebar.
// Asset file names are kept exactly as they are.

import path from "node:path";
import { CONTENT_DIR } from "./source.js";

export { CONTENT_DIR };

const ORDER_PREFIX = /^\d+[-._ ]+/;

export function stripOrder(name) {
  return name.replace(ORDER_PREFIX, "");
}

export function slug(segment) {
  return stripOrder(segment)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_\-]/g, "");
}

export function label(segment) {
  const s = stripOrder(segment).replace(/\.[^.]+$/, "").replace(/^_+/, "").replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Path of a file relative to content/, with forward slashes. null if outside.
export function relFromContent(file) {
  const rel = path.relative(CONTENT_DIR, path.resolve(file));
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

export function dirUrl(segments) {
  const parts = segments.filter(Boolean).map(slug);
  return parts.length ? `/${parts.join("/")}/` : "/";
}

// content-relative page file -> URL
export function pageUrl(relPath) {
  const segs = relPath.split("/");
  const base = segs.pop().replace(/\.[^.]+$/, "");
  if (base !== "index") segs.push(base);
  return dirUrl(segs);
}

// content-relative asset file -> URL (folders cleaned, file name kept)
export function assetUrl(relPath) {
  const segs = relPath.split("/");
  const file = segs.pop();
  return dirUrl(segs) + encodeURIComponent(file);
}

export function isHidden(relPath) {
  return relPath.split("/").some((s) => s.startsWith("_"));
}
