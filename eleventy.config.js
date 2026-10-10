import { IdAttributePlugin, HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs";
import path from "node:path";
import { buildTree, navHtml, trail, pager } from "./site/lib/nav.js";
import { gallery, swatches, download } from "./site/lib/shortcodes.js";
import { copyContentAssets } from "./site/lib/assets.js";
import { brandCss, palette, fontSpecimen, typeStyle } from "./site/lib/brand.js";
import { plates, logotypeLayout, logomarkLayout } from "./site/lib/logo.js";
import { columns, column } from "./site/lib/layout.js";

export default function (eleventyConfig) {
  // Every page uses the same layout unless its front matter says otherwise.
  eleventyConfig.addGlobalData("layout", "page.njk");
  // Core brand values (portable): brand/brand.json
  eleventyConfig.addGlobalData("brand", () => JSON.parse(fs.readFileSync(path.resolve("brand/brand.json"), "utf8")));

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
  eleventyConfig.addShortcode("palette", palette);
  eleventyConfig.addShortcode("fontSpecimen", fontSpecimen);
  eleventyConfig.addPairedShortcode("typeStyle", typeStyle);
  eleventyConfig.addPairedShortcode("columns", columns);
  eleventyConfig.addPairedShortcode("column", column);
  // Brand colours, fonts and type styles as CSS (used in the layout)
  eleventyConfig.addShortcode("brandCss", brandCss);

  // ids on headings (used for in-page links in the sidebar)
  eleventyConfig.addPlugin(IdAttributePlugin);
  // Rewrites absolute URLs when the site is built under a sub-path (versions)
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Site CSS, JS, fonts
  eleventyConfig.addPassthroughCopy({ "site/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "brand/fonts": "brand/fonts" });

  // Images and files that live next to the pages
  eleventyConfig.on("eleventy.before", ({ directories, dir }) => {
    copyContentAssets((directories && directories.output) || dir.output);
  });
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./brand/");
  eleventyConfig.addWatchTarget("./site/lib/");
  // Wait for a burst of saves to settle before rebuilding, so a multi-file edit
  // is not built half-way (a missed site/lib change leaves the preview stale).
  eleventyConfig.setWatchThrottleWaitTime(300);

  return {
    dir: {
      input: "content",
      includes: "../site/_includes",
      data: "../site/_data",
      output: "_site",
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
  };
}
