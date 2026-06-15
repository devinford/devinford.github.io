---
layout: post
title: "Corner Place"
date: "2026-05-01 11:00:00 -0400"
categories: post
tags: game_development mathematics
excerpt_separator: <!--more-->
---

The puzzles I've posted so far have been easy-to-describe as "like sudoku,
but...". But, as I've done more research into the mathematics underlying these
types of puzzle systems, I've come to realize that the "sudoku-like"ness of
these puzzles is captured entirely by the concept of the "Latin square". And, in
doing further research into Latin squares, I found a neat kind of puzzle that
seems very underexplored.
<!--more-->

If you'd like to skip the writeup and just solve some puzzles, you can play
it [here](/browser-games/corner-place/).

## Latin Squares

[Latin squares](https://en.wikipedia.org/wiki/Latin_square) are a type of
pattern that underlies a huge number of common pencil and paper logic puzzles. A
Latin square is an NxN grid, where each square of the grid is filled in with one
of N unique symbols, under the constraint that each symbol appears exactly once
in each row or column. For example, we can construct a 5x5 Latin square as:

<table>
  <tr>
    <td>A</td>
    <td>B</td>
    <td>C</td>
    <td>D</td>
    <td>E</td>
  </tr>
  <tr>
    <td>D</td>
    <td>A</td>
    <td>E</td>
    <td>B</td>
    <td>C</td>
  </tr>
  <tr>
    <td>C</td>
    <td>E</td>
    <td>D</td>
    <td>A</td>
    <td>B</td>
  </tr>
  <tr>
    <td>E</td>
    <td>D</td>
    <td>B</td>
    <td>C</td>
    <td>A</td>
  </tr>
  <tr>
    <td>B</td>
    <td>C</td>
    <td>A</td>
    <td>E</td>
    <td>D</td>
  </tr>
</table>

You can see that each letter A, B, C, D and E, appears exactly once in each row
and in each column.

This makes up 2/3s of the constraints of arguably the most popular pencil and
paper puzzle in the world: sudoku. Sudoku, played on a 9x9 instead of a 5x5,
simply adds the constraints that the each symbol can only appear once in each
3x3 "house" of the grid.

And sudoku is not alone. Latin squares are kind of like the mayonnaise of pencil
and paper logic puzzles. Most people don't just sit down and eat mayonnaise, but
70% of all dipping sauces are just "mayonnaise + spices". Similarly, few people
solve Latin squares for fun, but 70% of pencil and paper logic puzzles are just
Latin squares with extra constraints.

## Orthogonal Latin Squares

It's possible for a pair of Latin squares to have a property called
"[orthogonality](https://en.wikipedia.org/wiki/Mutually_orthogonal_Latin_squares)".
Two "orthogonal" Latin squares have the property that if you pair up their
corresponding cells, the same pair of symbols will appear in exactly one pair of
corresponding cells.

<table>
  <tr>
    <td>A</td>
    <td>B</td>
    <td>C</td>
    <td>D</td>
  </tr>
  <tr>
    <td>C</td>
    <td>D</td>
    <td>A</td>
    <td>B</td>
  </tr>
  <tr>
    <td>D</td>
    <td>C</td>
    <td>B</td>
    <td>A</td>
  </tr>
  <tr>
    <td>B</td>
    <td>A</td>
    <td>D</td>
    <td>C</td>
  </tr>
</table>

<table>
  <tr>
    <td>1</td>
    <td>2</td>
    <td>3</td>
    <td>4</td>
  </tr>
  <tr>
    <td>2</td>
    <td>1</td>
    <td>4</td>
    <td>3</td>
  </tr>
  <tr>
    <td>3</td>
    <td>4</td>
    <td>1</td>
    <td>2</td>
  </tr>
  <tr>
    <td>4</td>
    <td>3</td>
    <td>2</td>
    <td>1</td>
  </tr>
</table>

It's a little hard to see the pairings with them separated out into two squares
like this, so, orthogonal Latin squares are often written as a single square
with the corresponding values from each constituent square written together in
the same cell:

<table>
  <tr>
    <td>A1</td>
    <td>B2</td>
    <td>C3</td>
    <td>D4</td>
  </tr>
  <tr>
    <td>C2</td>
    <td>D1</td>
    <td>A4</td>
    <td>B3</td>
  </tr>
  <tr>
    <td>D3</td>
    <td>C4</td>
    <td>B1</td>
    <td>A2</td>
  </tr>
  <tr>
    <td>B4</td>
    <td>A3</td>
    <td>D2</td>
    <td>C1</td>
  </tr>
</table>

You can see that, not only do the letters and numbers separately obey the Latin
square rule, but also each combination of letters and numbers appears exactly
one time.

Examples with two orthogonal Latin squares are sometimes called "Graeco-Latin
squares", because they usually use Latin alphabet symbols and Greek alphabet
symbols. However, for large enough Latin squares, you can actually find sets of
more than 2 Latin squares that are all pairwise orthogonal to one another. This
is called a set of "mutually-orthogonal" Latin squares.

<table>
  <tr>
    <td>A1X</td>
    <td>B2Y</td>
    <td>C3Z</td>
    <td>D4W</td>
  </tr>
  <tr>
    <td>C2W</td>
    <td>D1Z</td>
    <td>A4Y</td>
    <td>B3X</td>
  </tr>
  <tr>
    <td>D3Y</td>
    <td>C4X</td>
    <td>B1W</td>
    <td>A2Z</td>
  </tr>
  <tr>
    <td>B4Z</td>
    <td>A3W</td>
    <td>D2X</td>
    <td>C1Y</td>
  </tr>
</table>

You can see that "A" and "1" appear together in the same square in the top left
square only, and never appear together in any other square. The same is true of
"A" and "X" and the same is true of "1" and "X". The ABCD, 1234 and WXYZ Latin
squares are all orthogonal to one another.

Since this is kind of like 3 layers of Latin squares, in some ways, it's almost
like a 3-dimensional latin square, where the third dimension selects one of the
Latin squares.

![The 3 mutually-orthogonal latin squares above, displayed as three separate Latin squares, layered to create a 3d visual effect](/assets/images/corner-place-layers.png)

For NxN Latin squares, the maximum achievable number of mutually-orthogonal
Latin squares is known to be N-1 (although this is not achievable for every N).
For example, you can have 3 mutually orthogonal 4x4s as in the example above, or
4 mutually-orthogonal 5x5s (here with the symbol sets: ABCDE, 12345, VWXYZ and
?!%@&):

<table>
  <tr>
    <td>D4X?</td>
    <td>E5W!</td>
    <td>A1V%</td>
    <td>B2Y@</td>
    <td>C3Z&</td>
  </tr>
  <tr>
    <td>E3V@</td>
    <td>B1X&</td>
    <td>D2Z!</td>
    <td>C4W%</td>
    <td>A5Y?</td>
  </tr>
  <tr>
    <td>B5Z%</td>
    <td>C2V?</td>
    <td>E4Y&</td>
    <td>A3X!</td>
    <td>D1W@</td>
  </tr>
  <tr>
    <td>C1Y!</td>
    <td>A4Z@</td>
    <td>B3W?</td>
    <td>D5V&</td>
    <td>E2X%</td>
  </tr>
  <tr>
    <td>A2W&</td>
    <td>D3Y%</td>
    <td>C5X@</td>
    <td>E1Z?</td>
    <td>B4V!</td>
  </tr>
</table>

It's the 4 mutually-orthogonal 5x5s that ties into the puzzle being introduced
today, as the puzzle is essentially just a challenge of completing a partially
filled-in set of 4 mutually-orthogonal 5x5 Latin squares.

## Cleaning up the UI for 4 Mutually-Orthogonal 5x5s

The 4 mutually-orthogonal 5x5s make for a more interesting puzzle than
standalone Latin squares, but it presents a bit of a unique user interface
challenge for how to present the puzzle in a readable way. Luckily, 4 letters
per square maps in a fairly natural way onto the four corners of the square.

![A 5x5 square with the letters associated with 4 orthogonal 5x5 Latin squares each placed in corresponding corners of the squares of the grid.](/assets/images/corner-place-corners.png)

For each square, one of the four quadrants is used to store that square's
element of one of the four Latin squares. I've used thinner, disconnected lines
to separate the quadrants so that it's more clear which subsquares are grouped
together as quadrants of a single square.

However, this selection of symbols for the quadrants is a little arbitrary and
hard to remember, as well as being hard to type.

In an earlier prototype of the game I had attempted to solve this readability
issue by using symbols derived from a standard keyboard layout.

![A corner place puzzle with a mix of symbols, and four separate sets of buttons below, each comprising one quarter of the top 20 alphanumeric keys of the keyboard](/assets/images/corner-place-prototype.png)

These symbols were derived from the top two rows of a standard keyboard, which
each contain 10 alphanumeric characters. This version actually made the rules of
the puzzle a little easier to explain, but the sets of symbols used for each
quadrant were somewhat arbitrary which made it difficult to figure out what
symbols were allowed in a particular quadrant without looking down at your
keyboard.

So, I revised this and took a slightly different approach.

![A 5x5 square with the letters associated with 4 orthogonal 5x5 Latin squares each placed in corresponding corners of the squares of the grid; all latin squares use the same symbols.](/assets/images/corner-place-numbers.png)

I tried out using the same symbols: just the numbers from 1 to 5, for all four
quadrants. This makes it easier to remember what symbols are allowed in each
quadrant, since *the same* symbols are allowed in all four quadrants. However,
it has some readability issues; it's harder to scan over the board and quickly
situate yourself and identify which quadrant a particular number belongs to. To
address this, I tried introducing different fonts for each quadrant:

![A 5x5 square with the letters associated with 4 orthogonal 5x5 Latin squares each placed in corresponding corners of the squares of the grid; all latin squares use the same symbols.](/assets/images/corner-place-font.png)

This seems to work well enough in practice, even with just a collection of
off-the-shelf Google fonts. I tried to pick a quartet of meaningfully distinct
fonts: a sharp solid font, a rounded solid font, a sharp font with an open
interior and a rounded font with an open interior

However, this only helps when looking at a filled-in square, but often you need
to identify matching quadrants across several squares that may not be filled in.
So, I added a number of other visual aids to help with identifying corresponding
quadrants across multiple squares quickly.

Hovering over or pressing a quadrant will automatically highlight the
corresponding quadrants in all of the squares in the same row or column:

![An animation of the mouse hovering over a puzzle. as it moves, all squares in the same row or column have the same quadrant highlighted as the one that the mouse is currently over.](/assets/images/corner-place-hover.gif)

This helps to quickly identify which numbers have already been used and are not
valid for a particular quadrant of a particular square.

I also added a helper feature for checking what values should be excluded based
on already existing pairs in different squares. Remember the core rule of
orthogonal Latin squares: each pair of values appears together in exactly one
square. In the case of this puzzle: no two squares may have the same pair of
numbers in the same pair of quadrants.

This helper is activated when you press down on one quadrant, and then drag to
another quadrant of the same square.

![The mouse presses down on a quadrant, then moves to another quadrant. A corresponding quadrant in another square that shares the same value becomes highlighted.](/assets/images/corner-place-spread.gif)

Every square that shares the same value in the quadrant you dragged to gets
highlighted---both the shared value (in blue), and the quadrant corresponding to
the one that you initially pressed down on (in green, like the rows and
columns). This makes it easy to get a visual read on what squares can cause a
conflict. In this example, 1, 2 and 5 are in the same row or column, and the
press-and-drag feature reveals a 3 that has already been paired with the
northeast 1, meaning that 4 is the only valid option remaining.

I'm still not 100% sure that the font-based approach, or at least this
particular set of fonts, is the right solution. I'll likely continue to iterate
on improving the visuals of the puzzle over time.

## Wrapping Up

The more I worked on Corner Place, the more surprised I became that this wasn't
an existing puzzle game. It has a very classic sort of feel to it. Maybe the
information overload of having to cross-reference squares in such a strange way
is a part of it, as it definitely took a lot of iteration to work it into
something playable---and I'll probably continue to tweak the UI as time goes on.
But if you'd like to try it out for yourself to see how well these little UI
tweaks have come together, you can try playing the game [here](/browser-games/corner-place/).
