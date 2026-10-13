---
title: Typography
---

## Brand fonts

The brand fonts are custom builds of Iosevka, made with Iosevka's own build options: chosen letterforms, a monospaced and a quasi-proportional (Aile) spacing, and the weights and widths the brand uses. Iosevka is released under the {{ brand.type.fonts[0].licence }}; the source and build tools are at [typeof.net/Iosevka]({{ brand.type.fonts[0].source }}).

{% fontSpecimen %}

## Core styles

Most type should be set in these core styles. Sizes are for a 1080 × 1440 px canvas; scale everything proportionally for other formats. Line height is 4/3 (133%) of the type size and paragraph space is one full line, so text stays on the baseline grid.

Display styles are the exception, with a 1/1 (100%) line height.

---

{% typeStyle "display" %}
A Friendly Wave
Season 4
{% endtypeStyle %}

---

{% typeStyle "display2" %}
A Friendly Wave
Season 4
{% endtypeStyle %}

---

{% typeStyle "h1" %}
BECAUSE GOOD MUSIC
SOUNDS BETTER TOGETHER.

CASSETTE CAFÉ
{% endtypeStyle %}

---

{% typeStyle "p1" %}
We're creating a listening space on Salt Spring Island. A place where music matters, where we listen and connect. Local enthusiasts share their music, visiting and community DJs play records after dark, with full album deep listening sessions each Sunday.

Quality sound. Quality music.
{% endtypeStyle %}

---

{% typeStyle "p2" %}
We're creating a listening space on Salt Spring Island. A place where music matters, where we listen and connect. Local enthusiasts share their music, visiting and community DJs play records after dark, with full album deep listening sessions each Sunday.

Quality sound. Quality music.
{% endtypeStyle %}

## Layout

Type should be aligned on a baseline grid, and left-aligned within columns.

Margins and column gutters are the same as the type size.

Display type should be scaled to the width of the layout.

{% typeLayout "p1", baseline=false, styles="display2: Headline, p1: text, h1: headings" %}

<div class="type-row">
<p class="ts-display2 span-all fit-width">Listen to this</p>
</div>

<div class="type-row">
<p class="ts-h1">A Friendly Wave</p>
<p class="span-2">A Friendly Wave is a volunteer-run music space and radio initiative based on Salt Spring Island, BC. In collaboration with the Cassette Café, we host listening sessions, parties, and talks centred on music appreciation.</p>
</div>
<div class="type-row">
<p class="ts-h1">Season 1</p>
<p>A Friendly Wave Radio<br>Chris Arnett<br>March 24</p>
<p>Tuesdays at 7:00pm<br>107.9 fm / 102.1 fm<br>ChiR.fm</p>
</div>
<div class="type-row">
<p class="ts-h1">Cassette Café<br>Salt Spring Island</p>
<p>Sunday Sessions with<br>Stephen Corwin</p>
<p>Sun Oct 25<br>11:00am–12:30pm</p>
</div>
{% endtypeLayout %}
