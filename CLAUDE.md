# A Friendly Wave: brand guide site

Brand guidelines for A Friendly Wave (AFW), a community listening space and event series on Salt Spring Island, BC. Built and maintained by E at Memory Studio. Static site, Eleventy 3, content as plain folders and markdown.

This file describes the project as it stands. It is context, not a spec: the structure, components and styling are all expected to change. When something here no longer matches the code, trust the code and update this file.

## Goals

- A quick cross-reference to the AFW identity standards, with links to assets and applications.
- Easy to edit: in a text editor, in Finder (folders = navigation), or with Claude.
- Version controlled, with past brand versions viewable (planned: version dropdown driven by git tags).
- Hosted on a custom domain (planned: Cloudflare Pages).
- Longer term: tokens and templates good enough to generate assets from code rather than design software.

## Run

```sh
npm run dev     # http://localhost:8080, live reload
npm run build   # -> _site/
npm run clean   # remove _site (do this after renaming content folders)
```

## How it is organised (current)

- `content/`: the guide. A folder is a sidebar group, nesting folders nests the menu. A page is `name.md` or `name/index.md`. Number prefixes set order and are stripped from URLs and labels; a leading `_` hides from the sidebar. Images live next to the pages that use them and are copied to the output at the same cleaned path (`site/lib/assets.js`).
- `brand/tokens.json`: colours (with purpose, specs, group, ink), type families, fonts (with metrics) and type styles. Originally exported from the Claude Design System artifact; extra fields have been added since.
- `brand/fonts/`: Panchi Mono, referenced from the tokens.
- `site/_includes/page.njk`: the one layout. `site/assets/theme.css`: guide chrome as CSS variables at the top, then component styles. `site/assets/site.js`: mobile menu, theme toggle, in-page section links, lightbox.
- `site/lib/`: `paths.js` (URL rules), `nav.js` (sidebar tree, breadcrumbs, prev/next), `shortcodes.js` (gallery, swatches, download), `brand.js` (token-driven CSS and components), `logo.js` (logo plates and layout diagrams), `layout.js` (columns).
- Components are Nunjucks shortcodes used in markdown; usage is in `README.md`.
- `{% brandCss %}` in the layout turns the tokens into `--brand-*` variables, `@font-face` rules and `.ts-<style>` classes, so type and colour components follow the tokens.

The UI look was ported loosely from Memory Studio's Grav "portal" theme (`~/Code/Web/client`, treat as read-only reference).

## Working preferences (E)

- Brief, quick-reference content over long documentation.
- Show the actual designed images; do not rebuild artwork in code unless asked.
- Web-ready assets are exported by E. Masters (PSD, TIF, EPS, print PDFs) stay in the separate Brand folder and out of git.
- Keep content authoring simple and Finder-friendly; keep components few and general.
- Prose style in content and docs: plain, no em dashes.

## Sources

- PDF guide: `~/Code/Claude/afw/Brand/AFW_001_Brand-Guideline_1.0.pdf` (brand 1.0, May 2025). Site content follows it in substance, not layout.
- Earlier design-system work (tokens, template code, docs): `~/Code/Claude/afw/design-system/`.
- Brand assets and applications: `~/Code/Claude/afw/Brand/`.

## Status

Done: scaffold, sidebar/nav, gallery, Marks (plates + layout diagrams), Colour (plates by group), Typography (specimen, H1/P1 with baseline guides, in-use example), Voice, Illustration, Instagram samples.

Not done yet (roughly in order, open to change):
- Colour combinations (PDF pp. 4-5) and asset/reference specs (p. 7).
- git init, first commit, tag `brand-1.0`.
- Version dropdown: build each `brand-*` tag under `/v/<version>/`. Note `brandCss` writes an absolute `/brand/...` font URL that HtmlBasePlugin does not rewrite.
- Deploy to Cloudflare Pages on a custom domain.
- Optionally generate the Claude Design System artifact from this repo.
- Season 4 (Oct 2026) may bring brand 1.1 or 2.0.

## Open questions

- Neutral #F0F0EB (guide) vs #F6F6F1 (exports).
- Blue #001A72 (guide/tokens) vs #001B72 (logo SVG fills).
- Yellow CMYK "0 2 3 83" (from the PDF) looks mis-entered; sky/orange/green have no CMYK/PMS.
- Lilac #DCB8FF: adopt or retire.
- ABC ROM (guide UI font) and Panchi Mono licence terms for a public repo/site.
