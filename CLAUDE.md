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
npm run dev     # builds older versions into _site/v/, then http://localhost:8080 with live reload
npm run build     # clean full build with all versions -> _site/ (deploy; not while dev runs)
npm run versions  # build only the v1, v2... branches into _site/v/N/, safe while dev runs
npm run clean     # remove _site and .versions (do this after renaming content folders)
npm run check     # build of the current version into a throwaway folder, safe while dev runs
```

### Versions

- `main` is the current brand version, served at `/`. Each branch named `v1`, `v2`, ... (pattern `^v\d+$`) is an earlier major version, served at `/v/N/`. Other branches are ignored. To edit an old version, commit on its branch; the latest commit is what is shown. Tags are optional bookmarks and are not used by the build.
- `scripts/build.js` exports each version branch's committed `content/` and `brand/` to `.versions/vN/` and builds them with `main`'s site code (`AFW_SOURCE`, `AFW_PREFIX`, read in `site/lib/source.js`). So layout, theme and components are shared; content and brand.json must stay compatible with them.
- The sidebar dropdown (`site/lib/versions.js`) lists main plus the version branches, labelled from each `brand.json` "version". It opens the same page in the chosen version, or that version's home if the page does not exist there.
- `npm run dev` builds the older versions once at startup. After committing to a version branch, or after `npm run clean`, run `npm run versions` (safe while dev runs) or restart dev.

### Keeping the local preview working

E usually has `npm run dev` running on :8080 while Claude edits.

- Edit sources only (`content/`, `brand/`, `site/`). Never edit `_site/`: it is regenerated on every build and changes there are lost.
- Do not run `npm run build` or `npm run clean` while dev is running; they rewrite or delete the folder the dev server is serving. To verify a change, use `npm run check`, or `curl` the running server.
- Rebuilds wait 300 ms for saves to settle (`setWatchThrottleWaitTime`). This does not fully prevent stale `site/lib/*.js` modules when they change together with other files: after editing `site/lib`, `curl` the page to confirm; if it is stale, wait a moment and `touch eleventy.config.js` (reloads the config and everything it imports; touching the lib file itself is not always enough, and a touch in the same instant as the edits can be swallowed by the same rebuild). No restart needed.
- Renamed or deleted files leave stale copies in `_site/`. If that matters, ask E to stop dev, then `npm run clean && npm run dev`.

## How it is organised (current)

- `content/`: the guide. A folder is a sidebar group, nesting folders nests the menu. A page is `name.md` or `name/index.md`. Number prefixes set order and are stripped from URLs and labels; a leading `_` hides from the sidebar. Images live next to the pages that use them and are copied to the output at the same cleaned path (`site/lib/assets.js`).
- `brand/brand.json`: the portable core brand definition. Only brand parameters: colours (hex, rgb, cmyk, pms, group, role), fonts (with metrics), font stacks, brand-wide leading and paragraph spacing, type styles (size, case), corner radius, output formats (size per application, resolution and colour space per medium). No sample text or manual presentation choices: those live in the content pages, or are derived in code (plate ink, contrast ratios, format ratios). Intended to be reusable elsewhere, e.g. converted for the Claude design system.
- `NOTES.md`: unpublished working notes (open questions, contrast figures, measurement caveats) taken out of the guide for E to decide on. Keep the published content free of such notes.
- `brand/fonts/`: fonts referenced from brand.json. Custom Iosevka builds come from `private-build-plans_<name>.toml` via `npm run font` (pinned Iosevka release, cached in `.cache/`, git-ignored) into `brand/fonts/<name>/` (woff2 for the web, full TTF beside it for desktop and the download links); run it by hand when a plan changes and commit the fonts. The deploy build never builds fonts.
- `site/assets/fonts/`: ABC Areal (free), the guide UI font.
- `site/_includes/page.njk`: the one layout. `site/assets/theme.css`: guide chrome as CSS variables at the top, then component styles. `site/assets/site.js`: mobile menu, theme toggle, in-page section links, lightbox.
- `site/lib/`: `paths.js` (URL rules), `nav.js` (sidebar tree, breadcrumbs, prev/next), `shortcodes.js` (gallery, swatches, download, specs), `brand.js` (token-driven CSS and components), `logo.js` (logo plates and layout diagrams), `layout.js` (columns).
- Components are Nunjucks shortcodes used in markdown; usage is in `README.md`.
- `{% brandCss %}` in the layout turns brand.json into `--brand-*` variables (including `--brand-leading`, `--brand-para`), `@font-face` rules and `.ts-<style>` classes. Styles inherit leading and paragraph space in em, so examples follow brand changes automatically.

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

Done: scaffold, sidebar/nav, gallery, Marks (plates + layout diagrams), Colour (plates by group), Typography (specimen, H1/P1 with baseline guides, in-use example), Illustration (Mister Listener), Applications: Specs (Instagram, Eventbrite, Mixcloud, with examples) and Examples (galleries). Voice was removed.

Not done yet (roughly in order, open to change):
- Colour combinations (PDF pp. 4-5) and asset/reference specs (p. 7).
- Tag `brand-1.0` once this version of the guide is complete (repo initialised, not tagged yet).
- Deploy to Cloudflare Pages on a custom domain. Build command `npm run build`; the build needs the `vN` branches fetched (Pages clones may be shallow).
- Optionally generate the Claude Design System artifact from this repo.
- Season 4 (Oct 2026) may bring brand 1.1 or 2.0.

## Open questions

- Neutral #F0F0EB (guide) vs #F6F6F1 (exports).
- Blue #001A72 (guide/brand.json) vs #001B72 (logo SVG fills).
- Yellow CMYK "0 2 3 83" (from the PDF) looks mis-entered; sky/orange/green have no CMYK/PMS.
- Lilac #DCB8FF: adopt or retire.
