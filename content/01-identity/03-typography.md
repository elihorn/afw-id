---
title: Typography
---

## Brand fonts

{% fontSpecimen %}

## Core styles

Most type should be set in these core styles. Sizes are for a 1080 × 1440 px canvas; scale everything proportionally for other formats. Line height is 4/3 (133%) of the type size and paragraph space is one full line, so text stays on the baseline grid.

Display is the exception with a 1/1 (100%) line height.

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

Type should be aligned on a baseline grid, and left-aligned within columns.

Margins and column gutters are the same as the type size. So 12px type on a 16px line height has 12px margins and gutters.

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
