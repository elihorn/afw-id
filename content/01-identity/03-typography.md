---
title: Typography
---

## Brand fonts

{% fontSpecimen %}

## Core styles

Most type should be set in these core styles. Sizes are for a 1080 × 1440 px canvas; scale everything proportionally for other formats. Leading is 4/3 of the type size and paragraph space is one full line, so text stays on the baseline grid. Display is the exception: it is at 100% line height.

---

{% typeStyle "display" %}
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
We're creating a listening space on Salt Spring Island. A place where music matters, where we listen and connect. Local enthusiasts share their music, visiting and community DJs play records after dark, with full album deep listening sessions on each Sunday.

Quality sound. Quality music.
{% endtypeStyle %}

## Layout

Layouts are built from one module: the body type size (P1). Every other measurement is a multiple of it.

- **Baseline:** one row is one line of body text, 4/3 of the module. Paragraph space is one row, and blocks are separated by two empty rows.
- **Columns:** gutters are 2 modules. Side margins are 1 module, half a gutter, so the middle of each gutter divides the full width into equal thirds.
- **Top and bottom margins** are one row, so the first line sits on the baseline grid.
- On a 1080 × 1440 px canvas the module is 12px and a row is 16px: 90 modules across and 90 rows down. Each 12 × 16 cell has the same 3:4 proportion as the canvas.

{% typeLayout "p1" %}

<div class="type-row">
<p class="ts-h1">A Friendly Wave</p>
<p class="span-2">A Friendly Wave is a volunteer-run music space and radio initiative based on Salt Spring Island, BC. In collaboration with the Cassette Cafe, we host listening sessions, parties, and talks centered around music appreciation.</p>
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
