// Versions for the dropdown. main is the current version, at "/". Each branch
// named v1, v2, ... is an earlier major version, at /v/1/, /v/2/, ...
// Other branches (features, drafts) are ignored. Labels come from each
// version's brand/brand.json "version".

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const VERSION_BRANCH = /^v(\d+)$/;

const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

// [{ name: "v1", ref: "v1" or "origin/v1", n: 1 }], newest first
export function versionBranches() {
  let refs = [];
  try {
    refs = git("for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin").split("\n");
  } catch (e) {
    return [];
  }
  const found = new Map();
  for (const ref of refs) {
    const name = ref.replace(/^origin\//, "");
    const m = name.match(VERSION_BRANCH);
    if (m && (!found.has(name) || !ref.startsWith("origin/"))) found.set(name, { name, ref, n: Number(m[1]) });
  }
  return [...found.values()].sort((a, b) => b.n - a.n);
}

function labelAt(ref) {
  try {
    return JSON.parse(git("show", `${ref}:brand/brand.json`)).version;
  } catch (e) {
    return null;
  }
}

export function versions() {
  let current = null;
  try {
    current = JSON.parse(fs.readFileSync(path.resolve("brand/brand.json"), "utf8")).version;
  } catch (e) {}
  return [
    { label: current || "current", url: "/" },
    ...versionBranches().map((b) => ({ label: labelAt(b.ref) || String(b.n), url: `/v/${b.n}/` })),
  ];
}
