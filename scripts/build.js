// Builds the guide with every version:
//   main (this working tree)  -> _site/
//   branch vN (committed)      -> _site/v/N/   content/ and brand/ from the branch, site code from here
//
//   node scripts/build.js                  clean full build (deploy). Not while `npm run dev` is running.
//   node scripts/build.js --versions-only  only _site/v/N/, safe while dev runs, so the dropdown works locally

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { versionBranches } from "../site/lib/versions.js";

const versionsOnly = process.argv.includes("--versions-only");
const OUT = process.env.AFW_OUT || "_site";
const eleventy = (env = {}, args = []) =>
  execFileSync("npx", ["@11ty/eleventy", "--quiet", ...args], { stdio: "inherit", env: { ...process.env, ...env } });

// Hosts such as Cloudflare Pages may clone only the branch being built: fetch the
// version branches from origin first (shallow is enough for git archive).
if (!versionsOnly) {
  try {
    execFileSync("git", ["fetch", "--no-tags", "--depth=1", "origin", "+refs/heads/v*:refs/remotes/origin/v*"], { stdio: "inherit" });
  } catch (e) {
    console.warn("Could not fetch version branches from origin; building with local branches only.");
  }
}
const branches = versionBranches();
if (!branches.length) console.warn("No version branches (v1, v2...) found: only the current version will be built.");

if (!versionsOnly) {
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log("main -> /");
  eleventy({}, [`--output=${OUT}`]);
}

for (const b of branches) {
  const src = path.join(".versions", b.name);
  const out = path.join(OUT, "v", String(b.n));
  fs.rmSync(src, { recursive: true, force: true });
  fs.mkdirSync(src, { recursive: true });
  execFileSync("sh", ["-c", `git archive "${b.ref}" content brand | tar -x -C "${src}"`], { stdio: "inherit" });
  fs.rmSync(out, { recursive: true, force: true });
  console.log(`${b.ref} -> /v/${b.n}/`);
  eleventy({ AFW_SOURCE: src, AFW_PREFIX: `/v/${b.n}/` }, [`--output=${out}`]);
}
