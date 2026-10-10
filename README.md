# A Friendly Wave: brand guidelines

The AFW brand guide as a static site. Content is plain folders and markdown; the site is built with Eleventy 3.

## Run it

```sh
npm install
npm run dev      # preview at http://localhost:8080 with live reload
npm run build    # writes the site to _site/
```

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
{% fontSpecimen %}                                   brand font specimen
{% typeStyle "h1" %}Sample text{% endtypeStyle %}          style with baseline guides and specs
```

Every type style is also a CSS class (`.ts-h1`, `.ts-p1`, ...), and every colour a variable (`var(--brand-blue)`), for one-off layouts written in HTML. Line height (`type.leading`, e.g. 1.2) and paragraph space (`type.paragraphSpacing`, e.g. `0.5lh` = half the line height) are brand-wide and inherited by every style in em, as `var(--brand-leading)` and `var(--brand-para)`. Sample text and examples belong in the content pages, not in brand.json. Print styles are shown at `--type-scale` (1.6) times their point size; change it in `site/assets/theme.css`.

## Assets

Only web-ready exports go in this repo (around 2400 px on the long edge). Masters (PSD, TIF, EPS, InDesign, print PDFs) stay in the Brand folder; `.gitignore` blocks them. Large downloads link out with `download "https://..."`.

## Versions

Brand releases are git tags: `brand-1.0`, `brand-1.1`, ... (version switcher: to do).
