// Copies every non-page file in content/ (images, PDFs, zips...) to the
// output folder, using the same cleaned folder names as the page URLs.

import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR, relFromContent, assetUrl } from "./paths.js";

const PAGE = /\.(md|njk|html|11tydata\.js|11tydata\.json)$/i;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (!PAGE.test(entry.name)) yield full;
  }
}

export function copyContentAssets(outputDir) {
  if (!fs.existsSync(CONTENT_DIR)) return 0;
  let copied = 0;
  for (const file of walk(CONTENT_DIR)) {
    const dest = path.join(outputDir, decodeURIComponent(assetUrl(relFromContent(file))));
    const src = fs.statSync(file);
    if (fs.existsSync(dest)) {
      const out = fs.statSync(dest);
      if (out.size === src.size && out.mtimeMs >= src.mtimeMs) continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    copied++;
  }
  return copied;
}
