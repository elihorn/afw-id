import { IdAttributePlugin, HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs";
import path from "node:path";
import { buildTree, navHtml, trail, pager } from "./site/lib/nav.js";
import { gallery, swatches, download } from "./site/lib/shortcodes.js";
import { copyContentAssets } from "./site/lib/assets.js";
import { brandCss, palette, fontSpecimen, typeStyle, typeLayout } from "./site/lib/brand.js";
import { plates, logotypeLayout, logomarkLayout, logoOrigin } from "./site/lib/logo.js";
import { columns, column } from "./site/lib/layout.js";
import { CONTENT_DIR, BRAND_DIR, BRAND_FILE, PREFIX } from "./site/lib/source.js";
import { versions } from "./site/lib/versions.js";

const rel = (p) => path.relative(process.cwd(), p) || ".";

export default function (eleventyConfig) {
  // Every page uses the same layout unless its front matter says otherwise.
  eleventyConfig.addGlobalData("layout", "page.njk");
  // Core brand values (portable): brand/brand.json
  eleventyConfig.addGlobalData("brand", () => JSON.parse(fs.readFileSync(BRAND_FILE, "utf8")));
  // Version dropdown: main at "/", vN branches at /v/N/ (site/lib/versions.js, scripts/build.js)
  eleventyConfig.addGlobalData("versions", versions);
  eleventyConfig.addGlobalData("prefix", PREFIX);

  // Sidebar, breadcrumbs, previous/next
  eleventyConfig.addCollection("navTree", (api) => buildTree(api.getAll()));
  eleventyConfig.addFilter("navHtml", navHtml);
  eleventyConfig.addFilter("trail", trail);
  eleventyConfig.addFilter("pager", pager);

  // Components
  eleventyConfig.addShortcode("gallery", gallery);
  eleventyConfig.addShortcode("swatches", swatches);
  eleventyConfig.addShortcode("download", download);
  eleventyConfig.addShortcode("plates", plates);
  eleventyConfig.addShortcode("logotypeLayout", logotypeLayout);
  eleventyConfig.addShortcode("logomarkLayout", logomarkLayout);
  eleventyConfig.addShortcode("logoOrigin", logoOrigin);
  eleventyConfig.addShortcode("palette", palette);
  eleventyConfig.addShortcode("fontSpecimen", fontSpecimen);
  eleventyConfig.addPairedShortcode("typeStyle", typeStyle);
  eleventyConfig.addPairedShortcode("typeLayout", typeLayout);
  eleventyConfig.addPairedShortcode("columns", columns);
  eleventyConfig.addPairedShortcode("column", column);
  // Brand colours, fonts and type styles as CSS (used in the layout)
  eleventyConfig.addShortcode("brandCss", brandCss);

  // Not-found page for every version (hosts serve the nearest 404.html; without one,
  // Cloudflare Pages would answer every unknown URL with the home page)
  eleventyConfig.addTemplate("404.md", "That page does not exist in this version of the guide.\n\n[Back to the start](/)", {
    title: "Page not found",
    fixedPermalink: "/404.html",
    eleventyExcludeFromCollections: true,
  });

  // Keep search engines out (only meaningful at the site root, so not in /v/N/ builds)
  if (PREFIX === "/") {
    eleventyConfig.addTemplate("robots.njk", "User-agent: *\nDisallow: /\n", {
      layout: false,
      fixedPermalink: "/robots.txt",
      eleventyExcludeFromCollections: true,
    });
  }

  // ids on headings (used for in-page links in the sidebar)
  eleventyConfig.addPlugin(IdAttributePlugin);
  // Rewrites absolute URLs when the site is built under a sub-path (versions)
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Site CSS, JS, fonts
  eleventyConfig.addPassthroughCopy({ "site/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ [rel(path.join(BRAND_DIR, "fonts"))]: "brand/fonts" });

  // Images and files that live next to the pages
  eleventyConfig.on("eleventy.before", ({ directories, dir }) => {
    copyContentAssets((directories && directories.output) || dir.output);
  });
  eleventyConfig.addWatchTarget(rel(CONTENT_DIR));
  eleventyConfig.addWatchTarget(rel(BRAND_DIR));
  eleventyConfig.addWatchTarget("./site/lib/");
  // Wait for a burst of saves to settle before rebuilding, so a multi-file edit
  // is not built half-way (a missed site/lib change leaves the preview stale).
  eleventyConfig.setWatchThrottleWaitTime(300);
  // Input is only the content folder; .gitignore would otherwise hide the
  // exported versions in .versions/ (see scripts/build.js).
  eleventyConfig.setUseGitIgnore(false);

  return {
    dir: {
      input: rel(CONTENT_DIR),
      includes: path.relative(CONTENT_DIR, path.resolve("site/_includes")),
      data: path.relative(CONTENT_DIR, path.resolve("site/_data")),
      output: "_site",
    },
    pathPrefix: PREFIX,
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
  };
}
