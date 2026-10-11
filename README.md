# A Friendly Wave: brand guidelines

The AFW brand guide as a static site. Content is plain folders and markdown; the site is built with Eleventy 3.

## Run it

```sh
npm install
npm run dev      # preview at http://localhost:8080 with live reload
npm run build    # writes the site, with every version, to _site/
npm run versions # builds older versions (branches v1, v2...) so the dropdown works in dev
```

The current brand lives on `main`. Earlier major versions live on branches named `v1`, `v2`, ...; edit one by committing on its branch.

## Where things are

```
content/          the guide: one folder or .md file per page
brand/brand.json  core brand values only (colours, fonts, type styles, leading): portable, no manual content
site/             how the guide looks and works (layout, theme, components)
  assets/theme.css  fonts, colours, borders, sidebar width: edit the variables at the top
  _data/site.json   guide title, subtitle, version
```

## Content rules

- **A folder is a sidebar group.** Nest folders to nest the menu.
- **A page is `name.md`, or `name/index.md`** when it has images next to it.
- **Order:** prefix names with numbers (`01-logo`, `02-colour`). The number is removed from URLs and menu labels.
- **Hidden:** prefix with `_` (`_masters/`, `_draft.md`) to keep it out of the sidebar.
- **Title:** taken from the file or folder name (`02-colour.md` -> "Colour"). Override with front matter: `title: Colour palette`.
- **Section links:** `##` headings on a page are listed under it in the sidebar.
- Images and files placed anywhere in `content/` are published at the same cleaned path.

## Components

Put each on its own line, with a blank line before and after. Paths are relative to the page's folder.

```
{% gallery "profiles" %}                         every image in ./profiles, auto-fill grid
{% gallery "profiles", cols=3 %}                 up to 3 columns, fewer on narrow screens
{% gallery "profiles", cols=1, captions=true %}  captions from file names
{% gallery "profiles", min=180 %}                smallest tile width in px (default 240)

{% swatches %}                                   every colour in brand/brand.json
{% swatches "blue", "neutral", size="small" %}   a subset, smaller tiles

{% download "_files/AFW_Logos.zip", "Logo package" %}
{% download "https://drive.google.com/...", "Print masters" %}
```

Galleries sort by file name, so prefix files with numbers to control order. They accept jpg, png, gif, webp, avif, svg, and mp4/webm (videos autoplay muted).

### Layout

```
{% columns %}                  two columns (cols=3 for three), stacked on small screens
{% column %}
### Heading
Markdown, images, components...
{% endcolumn %}
{% column %}
...
{% endcolumn %}
{% endcolumns %}
```

### Logos

```
{% plates "blue" %}                                  each image in ./blue on its own plate, stacked
{% plates "blue", only="Logo-Type_01.svg, Logo-Mark_AFW.svg", labels="Logo type, Logo mark", bg="neutral" %}
{% logotypeLayout %}                                 'a' / 'friendly' / 'wave' with spacing guides
{% logomarkLayout %}                                 mark aligned to the page edge
```

### From the brand values (brand/brand.json)

```
{% palette "primary" %}                              colour plates for a group (primary, secondary)
{% fontSpecimen %}                                   each brand font: name, licence, source link, characters
{% typeStyle "h1" %}Sample text{% endtypeStyle %}          style with baseline guides and specs
{% typeLayout "p1" %}rows{% endtypeLayout %}           rows on the column and baseline grid, with specs
```

Font names, weights and links always come from brand.json; don't type them into pages.

Every type style is also a CSS class (`.ts-h1`, `.ts-p1`, ...), and every colour a variable (`var(--brand-blue)`), for one-off layouts written in HTML. Line height (`type.leading`, e.g. 1.2) and paragraph space (`type.paragraphSpacing`, e.g. `0.5lh` = half the line height) are brand-wide and inherited by every style in em (a style can add `tracking` in 1/1000 em, as in Illustrator), as `var(--brand-leading)` and `var(--brand-para)`. Sample text and examples belong in the content pages, not in brand.json. Sizes are in `type.sizeUnit` on `type.sizeReference` (v2: px on 1080 x 1440). They are shown on screen at `--type-scale` times their size: 1.6 for pt, 1.25 for px (set in `site/lib/brand.js`). `type.leading` may be a fraction such as `"4/3"`.

Layouts on the column and baseline grid use `{% typeLayout %}` around rows of HTML set with the style classes. The base style (default p1) sets size and leading; `grid.margin` and `grid.gutter` in brand.json set the margins and gutters; the specs beside it are generated. In a row, `span-2` spans two columns:

```html
{% typeLayout "p1" %}
<div class="type-row">
<p class="ts-h1">Label</p>
<p class="span-2">Body text in the base style...</p>
</div>
{% endtypeLayout %}
```

Options: `cols=3` (default), `guides=false` to hide the grid.

## Assets

Only web-ready exports go in this repo (around 2400 px on the long edge). Masters (PSD, TIF, EPS, InDesign, print PDFs) stay in the Brand folder; `.gitignore` blocks them. Large downloads link out with `download "https://..."`.

## Versions

Brand releases are git tags: `brand-1.0`, `brand-1.1`, ... (version switcher: to do).
