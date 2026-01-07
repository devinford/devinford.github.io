---
layout: post
title: "Triple Place"
date: "2026-01-01 11:00:00 -0400"
categories: post
tags: game_development math
excerpt_separator: <!--more-->
---

A few months ago, I started posting a daily puzzle called [Pair Place](/post/2025/10/01/pair-place).
Pair Place arose naturally as a math problem during some research, but I
naturally started to wonder if there were any basic generalizations of it that
could serve as variations on the same puzzle concept. The first such
generalization of Pair Place is the subject of today's post: Triple Place.
<!--more-->

If you'd like to skip the writeup and just solve some puzzles, you can play
it [here](/browser-games/triple-place/).

## A Variation on Pair Place

Pair Place can be viewed as a grid-based presentation of a partially-solved
[edge coloring problem](https://en.wikipedia.org/wiki/Edge_coloring). However,
Pair Place can also be viewed through an entirely different lens.

Pair Place can be viewed as a special case of a [Latin Square puzzle](https://en.wikipedia.org/wiki/Latin_square#Mathematical_puzzles).
Let's take a look at a completed Pair Place puzzle:

| A | B | C | D | E | F |
| - | - | - | - | - | - |
| F | C | B | E | D | A |
| D | E | F | A | B | C |
| E | F | D | C | A | B |
| B | A | E | F | C | D |
| C | D | A | B | F | E |

If we count the header row, each letter appears exactly once in each row and
column. This is the Latin square rule. However, Pair Place adds one additional
constraint. The top row is fixed as the "header row", and each other row can
be constructed by pairing up the elements of the header row and swapping them.
The first non-header row here swaps A and F, B and C, and D and E, relative to
the header row. This swapping constraint acts as an additional logical
constraint that can be used to make deductions about the puzzles.

However, swapping isn't the only kind of permutation. For example, instead of
pairing up the elements of the top row and swapping, we could partition the
letters into groups of three and cyclically-shift the three elements.

| A   | B   | C   | D   | E   | F   |
| --- | --- | --- | --- | --- | --- |
| E   | C   | F   | A   | D   | B   |
| C   | F   | E   | B   | A   | D   |
| D   | E   | B   | F   | C   | A   |
| ... | ... | ... | ... | ... | ... |

Here, in the first row, we cyclically shift A, E and D-- E is under header A,
D is under header E, and A is under header D. We also cyclically shift B, C and
F in the same way. In the second row, we cyclically shift A, C and E, as well as
B, F and D. In the third row, we cyclically shift A, D and F, as well as B, E
and C.

In practice, I've found that these three-cycle latin squares work best on a 9x9
grid:

| A   | B   | C   |D    | E   | F   | G   | H   | I   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H   | I   | E   |B    | G   | A   | C   | F   | D   |
| D   | C   | I   |H    | F   | G   | E   | A   | B   |
| B   | E   | H   |G    | A   | D   | F   | I   | C   |
| E   | D   | A   |F    | C   | B   | I   | G   | H   |
| G   | A   | F   |I    | D   | H   | B   | C   | E   |
| I   | F   | B   |E    | H   | C   | A   | D   | G   |
| C   | G   | D   |A    | I   | E   | H   | B   | F   |
| F   | H   | G   |C    | B   | I   | D   | E   | A   |

And if we remove some of the hints, we end up with a puzzle:

| A   | B   | C   |D    | E   | F   | G   | H   | I   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|     | I   |     |     |     |     | C   | F   |     |
| D   |     | I   |H    |     |     |     | A   |     |
|     | E   |     |     |     |     |     |     | C   |
|     |     |     |     |     | B   | I   |     |     |
| G   | A   | F   |I    | D   |     | B   |     | E   |
|     |     | B   |     |     |     |     | D   | G   |
| C   | G   |     |     |     | E   |     |     |     |
|     |     | G   |     | B   |     |     |     |     |

But, we don't have to stop here. We could instead partition the letters into
groups of four and cyclically-shift. Or five. Or six. But I have a feeling that
with that many straightforward variations, they would lose their novelty fast.
How different would a 5-cycle puzzle even be from a 4-cycle puzzle? Or for that
matter: how different is this new 3-cycle puzzle from the existing 2-cycle
puzzle?

## Three is Greater than Two

Pair Place puzzles are fairly simple. There are really only a handful of
meaningful deductive rules:

- Fill in the last two squares in a row with one another's letters.
- Fill in the last square of a column with the only letter the column is missing.
- Fill in an open square of a column with the only letter the column is missing that hasn't already been used in that row.
- If every row but one where a column is open has already used one of its missing letters, then fill in that letter in that row.

That's more or less the extent of it. I'm not the greatest puzzle solver in the
world, so there may be more advanced moves that I'm not aware of, or that only
become apparent on much larger grids, but these are your 4 basic moves, and
there are no other special criteria that disqualify letters from being placed in
particular locatons. However, you might notice something missing from these
logical deduction rules.

Although Pair Place was designed around the additional constraint that the
letters in each row must be in swapped pairs relative to the header row, this
constraint does not actually factor into the logical deductions in a direct way.
The biggest reason for this is that filling in one square of a pair
automatically determines the value of its partner. There is no point at which
you reason about the members of a pair independently. And I think this weakens
it as a puzzle.

Triple Place addresses this issue, because it's possible to fill in only one
member of a triple without being able to immediately deduce every member. As a
result, it has a more substantial number of deduction rules. In addition to the
rules listed for Pair Place, Triple Place adds the deduction rules that:

- Filling in a letter must not a create a 2-cycle (if column A contains the
  letter B, column B cannot contain the letter A).
- If you have two separate chains of 2 elements, you can't connect them, as that
  would result in an eventual cycle longer than 3 elements.
- A column must contain each letter, and each letter must appear in each column
  (in Pair Place, these were equivalent, but in Triple Place, you have to reason
  about both conditions separately).
- If, within a particular row, column A contains the letter B, then the letter
  you fill into column B must be the letter of a column where it is valid to
  insert the letter A.

These additional constraints make it possible to remove more hints while leaving
the puzzles with a valid solution. And, figuring out which letter to fill into
a cell will often involve invalidating different options with different
combinations of deduction rules until only one option remains.

In practice, this makes solving Triple Place puzzles feel very different than
solving Pair Place puzzles. You end up cross-referencing multiple different
criteria for whether or not a particular letter is eligible to appear in each
spot. While it's less a mathematically-relevant problem than Pair Place, it also
feels a little less rote.

## Modifying the UI for Triple Place

There is a little bit more information to process now that you have to think
about grouping the letters into triples, and now that it's not only important
for your reasoning what letters a column has referenced, but also what other
columns have already referenced it. The UI for Triple Place has been updated
relative to Pair Place to expose some of this information in a more convenient
way.

![An example partially-filled Triple Place puzzle](/assets/images/triple-place-example.png)

The most immediately obvious change is the colors. With Pair Place, it wasn't
particularly relevant which letters were connected in a pair, only which letters
were used, but in Triple Place, being able to quickly identify groups of
connected letters, and especially incomplete chains, is very important. So,
within a row, each distinct chain or cycle is assigned a different color.

The second thing you might notice is the little boxes in the top left corner of
each square. These are "backreference boxes". If the main letter of a square is
the reference to the "next" column in the chain, then the backreference box
stores the letter of the "previous" column in the chain. Backreference boxes are
automatically filled in for you to aid in puzzle solving.

The last tweak is a fairly straightforward modification of letter placement. In
Pair Place, you would drag your cursor between the two columns that you wanted
to connect and both would be filled in. However, Triple Place modifies this
slightly.

![Example of placing a letter into a square](/assets/images/triple-place-drag-1.gif)

In Triple Place, you press down on the square you want to fill in, then drag to
the column of the letter you want to write into that square. This will fill in
that square with the selected column.

![Example of placing the third letter of a cycle and the cycle closes automatically](/assets/images/triple-place-drag-2.gif)

If you are filling in a letter for the second element element of a chain, then
the chain will automatically be closed into a 3-cycle. This means that, outside
major logic errors, it's less likely that a player will accidentally make a
cycle longer than 3 elements.

There's definitely more tweaking that will need to be done to the UI as time
goes on, but, for the time being, I think it's very functional and readable.

## Wrapping Up

If you've tried the Pair Place puzzles on the site before but are looking for
something with a little more meat to it, Triple Place might be what you're
looking for. You can try out Triple Place [here](/browser-games/triple-place/).

Now. If you'll excuse me. I have to get work on the blog posts for Quadruple
Place, and Quintuple Place, and Hexuple Place, and...
