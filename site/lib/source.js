// Where the guide's content/ and brand/ come from, and the URL it is built under.
// Normally this repo at "/". The versions build points AFW_SOURCE at a vN branch
// exported to .versions/vN and sets AFW_PREFIX to /v/N/; the site code is always this repo's.

import path from "node:path";

export const SOURCE = path.resolve(process.env.AFW_SOURCE || ".");
export const CONTENT_DIR = path.join(SOURCE, "content");
export const BRAND_DIR = path.join(SOURCE, "brand");
export const BRAND_FILE = path.join(BRAND_DIR, "brand.json");
export const PREFIX = process.env.AFW_PREFIX || "/";
