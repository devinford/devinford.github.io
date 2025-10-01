---
layout: post
title: "Pair Place"
date: "2025-10-01 11:00:00 -0400"
categories: post
tags: programming game_development math reversible_programming
excerpt_separator: <!--more-->
---

I thought that it might be a good challenge to try to introduce and keep
up-to-date a daily puzzle on the site for as long as I can manage. So, starting
today, I will be uploading a daily puzzle for a puzzle system I've been
investigating, which has some similarities to sudoku.
<!--more-->

If you'd like to skip the writeup and just solve some puzzles, you can play
it [here](/browser-games/pair-place/).

## Reversible Control Flow as a Puzzle System

In the course of some of [my hobby research](/category/reversible_primer/)
into [reversible computing](https://en.wikipedia.org/wiki/Reversible_computing),
I wound up looking into [edge coloring problems](https://en.wikipedia.org/wiki/Edge_coloring)
as part of investigations into reversible control flow. The idea was that if:

- Each node represents the starting or ending position of a jump as a result of
  a control structure.
- Edge edge represents a particular kind of conditional jump the control
  structure can perform.
- And each color represents the state of the control value (such as the boolean
  in an `if` statement) under which a particular jump will be taken.

Then ensuring that the graph is properly-colored will prove that the control
structure represented by the graph is reversible, because, when the control value
is in a particular state, each destination can only be reached by a jump from
one starting point.

For example, the colored graph for a basic "reversible `while` statement" can
be seen here:

![Four vertex cycle graph with vertices labeled, in order, A, B, C, D, with alternating red and green edges](/assets/images/pair-place-while.png)

The vertices in the graphs correspond to the possible before and after positions
of the jumps that the control structure can do, as laid out here:

```cs
// Position A
while(color) {
  // Position B

  // Position C
}
// Position D
```

For reference, the behavior of a typical reversible loop is:

- `A` jumps to `D`, skipping the block, if the condition is `false`, and
  otherwise enters the loop by jumping to `B`.
- `C` jumps back to `B` if the condition is `false`, and exits by jumping to `D`
  otherwise.

This may sound a little backwards if you come from a traditional programming
background, but this is how things work in the world of reversible computing.
I will have a post coming out soon explaining some of this basic reversible
control flow in more detail.

As it turns out, a "reversible `if` statement" actually has exactly the same
structure, but with one caveat: if the edge between B and C would be traversed,
an error is raised.

![Four vertex cycle graph with vertices labeled, in order, A, B, C, D, with alternating red and green edges and the BC edge labeled as an "Error Case"](/assets/images/pair-place-if.png)

```cs
// Position A
if(color) {
  // Position B

  // Position C
}
// Position D
```

And we can also model generalizations of these, such as reversible `if`/`else`
chains.

![Six vertex cycle graph with vertices labeled, in order, A, B, C, F, E, D, with alternating red and green edges and the BC and DE edges labeled as "Error Case"s](/assets/images/pair-place-ifelse.png)

```cs
// Position A
if(color) {
  // Position B

  // Position C
} else {
  // Position D

  // Position E
}
// Position F
```

I started solving the colorations for some of these small graphs by-hand, and I
noticed that a lot of the logic I was using to to try to avoid dead-ends in my
solutions felt very similar to the kinds of logic applied in [sudoku](https://en.wikipedia.org/wiki/Sudoku)
puzzles, and that's not a coincidence. This type of problem is a graph-coloring
problem where you color edges, and sudoku puzzles are a tidied up version of a
graph-coloring problems where you color vertices. And so, the obvious question
arose of: can this edge-coloring problem be tidied up into a similar sort of
pen and paper puzzle as well?

## Graph Coloring Via a Table

I managed to convert the layout of the graph-coloring problem into a table
format according to the following rules:

- Each vertex of the graph becomes a column.
- Each color of the graph coloring becomes a row.
- Each edge of a particular color becomes a reflexive pair of letter placements
  in that color's row. By "reflexive", I mean that if letter A is placed in
  column B, then letter B must be placed in column A. Essentially, we are
  "pairing up" the columns within each row.

So, our `if` and `while` graph:

![Four vertex cycle graph with vertices labeled, in order, A, B, C, D, with alternating red and green edges](/assets/images/pair-place-while.png)

Would become the following table:

| A | B | C | D |
| - | - | - | - |
| B | A | D | C |
| D | C | B | A |

Here, the header row contains the letter of the vertex represented by each
column, the next row contains all of the green edges, and the bottom row
contains all of the red edges. You can see the reflexive "pairing" here.
A/B and C/D are paired in the first row, and A/D and B/C are paired in the
second row.

And a similar conversion can be done for the `if`/`else` graph:

![Six vertex cycle graph with vertices labeled, in order, A, B, C, F, E, D, with alternating red and green edges and the BC and DE edges labeled as "Error Case"s](/assets/images/pair-place-ifelse.png)

| A | B | C | D | E | F |
| - | - | - | - | - | - |
| B | A | F | E | D | C |
| D | C | B | A | F | E |

Now, if we just start removing letters, we end up with something like a puzzle.
Can you fill in the missing cells? Do you even dare attempt?

| A | B | C | D | E | F |
| - | - | - | - | - | - |
| B | A |   | E | D |   |
| D |   |   | A | F | E |

... Yeah, this is a pretty trivial puzzle. This is the limit of how many letters
you can remove from a 6x3 puzzle without the puzzle having multiple solutions.
Through trial and error, I discovered that the more square the dimensions of the
table are, the more hints you will be able to remove while leaving the puzzle
with a single unique solution, so you can end up with much more challenging
puzzles, and I pretty quickly abandoned everything but square grids. With square
grid, you can get sparser grids that make for better puzzles, like:

| A | B | C | D | E | F |
| - | - | - | - | - | - |
|   | C | B | E | D |   |
|   | E |   |   | B |   |
| E |   |   |   | A |   |
| B | A | E |   | C |   |
|   |   |   |   |   |   |

If the explanation of the reflexive placement didn't make much sense, try
playing the [tutorial puzzles](/browser-games/pair-place/#tutorial) for the
game. The game turned out to be unexpectedly well-suited to a cursor or
touch-based interface, and it's fairly intuitive once you start interacting with
it.

### Writing a Puzzle Generator

As I started looking into writing a puzzle generator for this puzzle system
(as well as other puzzle systems that I've investigated in the time since), it
quickly became apparent that there's a pretty straightforward method for writing
puzzle generators for most abstract logic puzzles of this type:

1. Write a brute force "solver" that takes an input board state and enumerates
  valid completions of the board.
2. Apply the brute force solver to a blank board to generate an already-solved
  puzzle.
3. Attempt to remove each value from the board in a random order, verifying that
  the puzzle still has only one unique solution for each value that is removed.
  This can be broken down into a few steps:
    1. Remove the value.
    2. Run the brute force solver and see if it enumerates more than one unique
      solution.
    3. If so, restore the value; otherwise, leave it removed. Then move on to
      the next candidate for removal.

This process is guaranteed to generate a puzzle with a unique solution, but not
necessarily one that a person will be able to solve by taking any obvious
logical steps. The next step up would be a solver that removes values by testing
whether or not there is any known logical deductive rule of the puzzle system
that would allow that value to be restored afterwards.

That is still a work in progress for Pair Place (I'm still in the process of
documenting and implementing all of those logical rules into the solver), so for
the time being I'm relying on manually solving each puzzle myself in order to
verify that they can be solved and to evaluate their difficulty. So, the puzzles
that will be posted on this site have been manually curated. Hopefully, as a
result, the puzzles will continue to get better as I myself get better at
solving them.

## Wrapping Up

I had originally imagined that investigating Pair Place as a puzzle system would
give me some insight into reversible control flow, but as it turns out, only
small cases of the edge-coloring problem are really useful for reversible
control structures, because you tend to build larger control structures out of
smaller ones, rather than constructing larger control structures from whole
cloth. But nonetheless, turning the problem into a puzzle game was an
interesting exercise to go through.

I plan to upload daily puzzles [here](/browser-games/pair-place/) for the
foreseeable future. I may start posting additional daily puzzles under entirely
different puzzle systems in the future, or I may eventually retire Pair Place,
or some combination of the two. I have a number of variations of Pair Place that
I've come up with, as well as a number of completely different kinds of puzzle
games that I've been looking into that just need a little more time in the oven.
