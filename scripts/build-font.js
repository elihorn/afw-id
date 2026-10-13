// Builds the custom Iosevka fonts from brand/fonts/private-build-plans*.toml.
// Each toml is built on its own: private-build-plans_aile.toml -> brand/fonts/aile/,
// private-build-plans_mono.toml -> brand/fonts/mono/ (no suffix -> brand/fonts/custom/).
// Run by hand when the build plans change (it takes a while), check the result,
// and commit the fonts. The deploy build never runs this.
//
//   npm run font               every toml
//   npm run font -- aile       only the named one(s)
//
// Steps: download Iosevka at IOSEVKA_VERSION into .cache/iosevka (git-ignored),
// build each plan unhinted, subset to Latin web fonts (woff2) in brand/fonts/<name>/,
// keep the full TTFs for desktop use beside them, and print each
// font's metrics for brand.json. File names come from the plan names in the toml.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const IOSEVKA_VERSION = "v34.9.0";
const FONTS = path.resolve("brand/fonts");
const CACHE = path.resolve(".cache");
const REPO = path.join(CACHE, "iosevka");
const VENV = path.join(CACHE, "fonttools");
// Latin, punctuation and common symbols (as the earlier Iosevka web fonts)
const UNICODES = "U+0020-007E,U+00A0-024F,U+02C6-02DD,U+2000-206F,U+20AC,U+2100-2122,U+2190-2193,U+2212,U+2215,U+FB01-FB02";

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: "inherit", ...opts });

const configs = fs
  .readdirSync(FONTS)
  .filter((f) => /^private-build-plans.*\.toml$/.test(f))
  .map((f) => ({ file: path.join(FONTS, f), name: (f.match(/^private-build-plans_(.+)\.toml$/) || [])[1] || "custom" }));
const wanted = process.argv.slice(2);
const todo = wanted.length ? configs.filter((c) => wanted.includes(c.name)) : configs;
if (!todo.length) throw new Error(`No build plans to run (found: ${configs.map((c) => c.name).join(", ") || "none"})`);

// Iosevka source, at a pinned release so the letterforms do not change unannounced
fs.mkdirSync(CACHE, { recursive: true });
const tagFile = path.join(REPO, ".afw-version");
if (!fs.existsSync(tagFile) || fs.readFileSync(tagFile, "utf8").trim() !== IOSEVKA_VERSION) {
  fs.rmSync(REPO, { recursive: true, force: true });
  run("git", ["clone", "--depth", "1", "--branch", IOSEVKA_VERSION, "https://github.com/be5invis/Iosevka.git", REPO]);
  run("npm", ["ci", "--no-audit", "--no-fund"], { cwd: REPO });
  fs.writeFileSync(tagFile, IOSEVKA_VERSION + "\n");
}

// fonttools for subsetting and metrics
if (!fs.existsSync(path.join(VENV, "bin", "python"))) {
  run("python3", ["-m", "venv", VENV]);
  run(path.join(VENV, "bin", "pip"), ["install", "--quiet", "fonttools", "brotli"]);
}
const py = path.join(VENV, "bin", "python");

for (const config of todo) {
  fs.copyFileSync(config.file, path.join(REPO, "private-build-plans.toml"));
  const plans = [...fs.readFileSync(config.file, "utf8").matchAll(/^\[buildPlans\.([^.\]]+)\]/gm)].map((m) => m[1]);
  const outDir = path.join(FONTS, config.name);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const plan of plans) {
    console.log(`\n== ${config.name}: ${plan}`);
    fs.rmSync(path.join(REPO, "dist", plan), { recursive: true, force: true });
    run("npm", ["run", "build", "--", `ttf-unhinted::${plan}`], { cwd: REPO });
    const ttfDir = path.join(REPO, "dist", plan, "TTF-Unhinted");
    const ttfs = fs.readdirSync(ttfDir).filter((f) => f.endsWith(".ttf")).sort();
    for (const f of ttfs) {
      fs.copyFileSync(path.join(ttfDir, f), path.join(outDir, f)); // full font, for desktop
      run(py, ["-m", "fontTools.subset", path.join(ttfDir, f), `--unicodes=${UNICODES}`, "--layout-features=*",
        "--flavor=woff2", `--output-file=${path.join(outDir, f.replace(/\.ttf$/, ".woff2"))}`]);
    }
    // Metrics (as fractions of the em) for brand.json, read from the first font of the plan
    const metrics = execFileSync(py, ["-c", `
import sys, json
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1]); u = f["head"].unitsPerEm; o = f["OS/2"]
print(json.dumps({"ascent": round(o.sTypoAscender/u, 3), "descent": round(-o.sTypoDescender/u, 3),
                  "capHeight": round(o.sCapHeight/u, 3), "xHeight": round(o.sxHeight/u, 3)}))
`, path.join(ttfDir, ttfs[0])], { encoding: "utf8" }).trim();
    console.log(`${ttfs.length} fonts -> brand/fonts/${config.name}/ (woff2 and ttf)  metrics: ${metrics}`);
  }
}
