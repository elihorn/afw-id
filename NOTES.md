# Notes (not published)

Working notes taken out of the published guide, to decide on later. Nothing here is built into the site.

## Colour

- Neutral is #F0F0EB in the guide; recent exports use #F6F6F1. To be resolved.
- Yellow's CMYK value is carried over from the 1.0 guide and needs confirming. Sky, orange and green have no print values yet.

### Contrast

Blue against each colour (neutral on blue for blue itself), WCAG ratio. Computed from brand.json on 2026-10-09; `contrast()` in `site/lib/brand.js` gives current values.

| Pair | Ratio |
| --- | --- |
| Neutral on blue | 13.2:1 |
| Blue on sky | 11.5:1 |
| Blue on yellow | 12.3:1 |
| Blue on orange | 6.0:1 |
| Blue on green | 4.4:1 |

Blue on green is below 4.5:1, so it passes WCAG AA only for large text.

## Instagram specs

- Measured from the Season 1–3 post files.
- Header 63 / 76: ALL CAPS except am/pm is approximate.
- Small 48 / 58: estimated, to confirm.

## Applications specs

- Eventbrite: 2160 x 1080 (2:1) is Eventbrite's recommended size. The Summer Sessions banner was exported at 2210 x 1130.
- Mixcloud: no official minimum found for show images. 1728 x 1728 is the AFW radio export size.
- No Instagram story example yet.

## Brand 2.0 (main branch)

- Seasonal colours (Option 1) were sampled from AFW_IDv2-1_1-Season_Colours.png: orange #E06C3A, magenta #B34479, lime #E2FF78. Confirm against the design file; no CMYK or PMS yet.
- The same image shows the blue as #001B72 (as in the logo SVGs); brand.json keeps #001A72.
- v2 type is set on a 1080 x 1440 px canvas with a 12px module: type = 1 module, leading 4/3 (16px rows, 90 x 90 cells of 12 x 16), gutter 2 modules, margin 1 module. Styles: P1 and H1 12/16, Display 64/64 (leading 1.0, 4 rows, so stacked lines stay on the 16px rows). Paragraph space is one line (16px). The copy on the typography page states these relationships in modules and rows; if the module changes, update its 12px / 16px example.
- Iosevka web fonts are subset from the installed 34.1.0 TTCs to Latin, punctuation and common symbols (~200 KB each).
