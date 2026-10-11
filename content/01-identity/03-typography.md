---
title: Typography
---

## Brand fonts

{% fontSpecimen %}

## Core styles

Most type should be set in these core styles. Sizes are for an 11 × 17 poster; scale everything proportionally for other formats. Line height and paragraph space are shared by every style and scale with the type size.

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

Type sits on a column and baseline grid: labels in H1 in the left column, details in P1 in aligned columns, with two empty lines between blocks. Side margins are half a gutter, so the middle of each gutter divides the full width into equal thirds.

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
