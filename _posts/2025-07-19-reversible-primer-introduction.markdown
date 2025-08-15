---
layout: post
title: "Reversible Programming Primer: Introduction"
date: "2025-07-19 11:00:00 -0400"
categories: post
tags: programming reversible_programming reversible_primer
excerpt_separator: <!--more-->
---

Over the past few years, I've been doing a lot of personal hobby research into
[reversible computing](https://en.wikipedia.org/wiki/Reversible_computing).
Studying reversible computing has been almost like having to learn programming
from the ground up again, and the lack of resources has meant that I have had to
come up with my own mental models and analogies for understanding reversible
programming concepts. So I thought that it might be worthwhile to share some of
that hard-won intuition so that anyone else looking into the topic might have an
easier time getting a grip on it. This is the first in a series of posts
discussing some of the basic concepts and programming primitives of reversible
computing. In this post, I will be explaining what reversible computing is and
some high-level concepts of how it can be used for computation.
<!--more-->

## What is Reversible Computing?

If you've ever used a computer or a phone or a tablet, you'll know that
they tend to get very hot when they have to do a lot of work. And, if the device
is running on battery power, the battery starts to drain very fast and has to
be recharged more often.

Although it's not the lone culprit, one of the causes of this excessive energy
consumption and heat is the fact that computers frequently *erase information*.
In the 1960s, a physicist named Rolf Landauer proposed what is now called
"[Landauer's Principle](https://en.wikipedia.org/wiki/Landauer%27s_principle)",
which states that, in order to erase one [bit](https://en.wikipedia.org/wiki/Bit) of information, a certain amount of
energy has to be lost as heat. And so, when a computer erases information,
Landauer's Principle predicts that it will both waste energy and get hotter.

This effect occurs any time that a computer program erases information. In
terms of code written in higher-level programming languages, information erasure
happens very explicitly when a program overwrites the value of a variable:

```rust
int x = 5;
x = 3; // Here, the program is erasing the value `5` that was previously stored
       // in `x`, and overwriting it with `3`.
```

However, information erasure can also happen as a logical consequence of other
operations. For example, if you multiply a number by `0`, it becomes impossible
to recover its original value:

```rust
int x = 5;
x *= 0; // Here, the program replaced the original value of `x` with `x * 0`, so
        // the original value of `x` is lost.
```

However, erasing information is also just baked into how processors are
constructed. Processors are built on non-reversible logic gates, such as the
universal "[NAND](https://en.wikipedia.org/wiki/NAND_gate)" gate:

| Input 1 | Input 2 | Output |
| ------- | ------- | ------ |
| F       | F       | T      |
| T       | F       | T      |
| F       | T       | T      |
| T       | T       | F      |

There are three different possible input combinations that all map to `T`, so
given the output of a NAND gate, it is not possible in general to determine what
the inputs were, and the input information is simply lost. In fact, even given
the output of a NAND gate and one of its inputs, it is still not generally
possible to uniquely determine the value of the other input.

If you wanted to avoid erasing any information, you would need a fundamentally
different approach to computation from the ground up, and that approach is
called "reversible computing".

In reversible computing, the computer is limited to only performing operations
that are "reversible", meaning that they do not destroy any information. Since
no information is lost, it is possible to return the program to any previous
state (this is why the term "reversible" is commonly used, rather than just
"non-destructive" or something similar). To put this in more familiar
mathematical terms: each individual operation that a reversible computer can
perform must have an "inverse"-- another operation that perfectly undoes the
effect that the original operation has on the program state.

So, the NAND gate is no longer possible, but there are other *reversible* logic
gates that reversible computers can still use. For example, the "[Controlled NOT](https://en.wikipedia.org/wiki/Controlled_NOT_gate)"
gate:

| Input 1 | Input 2 | Output 1 | Output 2 |
| ------- | ------- | -------- | -------- |
| F       | F       | F        | F        |
| T       | F       | T        | T        |
| F       | T       | F        | T        |
| T       | T       | T        | F        |

This gate accepts two inputs. It outputs the first input unchanged, but negates
the second input if the first input was true. You can see that just as each
input combination is unique, each output combination is also unique. So, it's
possible to determine what inputs produced a given set of outputs, making the
gate invertible. (We won't be working directly with logic gates much in these
posts, but, for the curious, the [Fredkin](https://en.wikipedia.org/wiki/Fredkin_gate) and [Toffoli](https://en.wikipedia.org/wiki/Toffoli_gate)
gates are the most commonly-used "universal" gates that take the role of the
NAND gate in reversible computing)

In our previous arithmetic example, multiplying a number by `0` is an example of
an operation that has no inverse (since dividing by `0` is undefined). However,
many common operations *do* have inverses. For example, the inverse of adding
`1` to a number is subtracting `1` from the number.

```rust
// The inverse of:
x += 1;

// Is:
x -= 1;
```

This works even with the bounded integer types used in computers because
modular addition (the type of addition computers perform that "wraps around"
when the number goes out of bounds) is also invertible.

Reversible programs require constructing algorithms out of only operations that
have an inverse in this way. This means that many familiar programming
primitives must be abandoned, and many algorithms have added complexities. But,
as it turns out, the very same reversibility that raises these problems also
often provides the solutions.

The most important such problem, and most important such solution, are the
answer to a question that may very well have been stewing in your own mind since
the idea of "computing without destroying information" was first mentioned.

### Lecerf-Bennett Reversal

*"If you can't destroy information, won't you very quickly run out of memory?"*

This is the question that plagued the concept of reversible computing from the
moment it was first considered.

All non-trivial computer programs inevitably involve calculating a large number
of temporary intermediate values in the course of computing a final result.
Typically, these values are calculated, used, and then thrown away, but in a
reversible computer, you wouldn't be able to throw them away, so it would seem
like they would pile up as "junk data", taking up space, even though their
values are no longer useful. This was a major concern during the early
investigations of reversible computing. However, two researchers in the 1960s
and 1970s-- Yves Lecerf and Charles Bennett-- each independently came up
with basically the same solution to this problem.

As mentioned earlier, every operation that a reversible computer can perform is
required to have an inverse. If you start with a complete program, then reverse
the order of the instructions and replace each instruction with its inverse, the
result will be an "inverse program" that perfectly undoes the work of the
original program.

So, let's say that we started with an initially-blank program state, and ran a
program, which would generate a lot of intermediate junk values. Then, we run
the inverse program. What would happen? The answer is: the program state would
revert to its initial, blank state. By running the same computation in reverse,
we essentially "uncompute" all of the intermediate values that were generated
when running it forward.

This leads to an extremely straightforward method for calculating any computable
value in a reversible program without permanently generating extra junk data:

1. Execute some code that performs a calculation.
2. Copy the calculated result and store it in some additional memory that wasn't
  used by the calculation.
3. Execute the "inverse" of that code to revert all of the memory used in the
  calculation back to its original, "blank" state.

This effectively "frees" the memory used during the calculation while preserving
its result. We can refer to this concept as "Lecerf-Bennett Reversal", after the
two researchers that discovered it.

This idea-- of using inverse calculations or "uncomputation" to clean up
memory-- is the cornerstone of reversible computing. Future posts will go into
more detail about how Lecerf-Bennett Reversal not only appears as a valuable
control structure in structured reversible programming languages, but also about
how the concept is baked into the very structure of how nested expressions are
evaluated in reversible programming languages.

## Disclaimer on Logical vs Physical Reversibility

Now, before proceeding into the remainder of the posts in the series, filled
with conviction that this bold new programming paradigm will make computer
programs more energy-efficient, it is important to draw a distinction between
the two different aspects of reversible computation and their different
properties. These two aspects are: the "logical" reversibility of computer
software, and the "physical" reversibility of computer hardware.

Logical reversibility is the property that it is always possible to determine
what any past state of a computer program was. It is possible to create an
interpreter that runs on existing non-reversible computer hardware, which
interprets a logically reversible programming language. However, such an
interpreter would offer none of the energy efficiency benefits discussed in the
first section. In fact, it would likely be less efficient than a comparable
non-reversible programming language because the redundant structure of
Lecerf-Bennett Reversal would necessitate doing twice as much work to compute
the same result.

Physical reversibility is the property that a piece of computer hardware
implements computation in a way that avoids invoking the ire of Landauer's
Principle-- the hardware itself never erases information and thus never loses
that information as heat. It's physically reversible computer hardware that
delivers all of the energy efficiency benefits. However, both pieces are
ultimately necessary, because while a physically non-reversible computer *is
able* to run logically reversible software, a physically reversible computer
can **only** run logically reversible software.

Although physically reversible computer hardware is clearly the more
ground-breaking concept of the two, this series of posts will be focusing
exclusively on logical reversibility in computer software, and the types of
programming structures and primitives that naturally emerge as solutions to
problems in reversible programming. The hardware side of the equation is still
an area of active physics and engineering research, but people will have to
write the software for those computers if they're ever to be built, and people
will have to learn the programming primitives for that software if it's ever to
be written.

## Wrapping Up

Despite existing since the 1960s, the field of reversible computing has been
largely niche for nearly 70 years, and is only now starting to get wider
attention given the ever-expanding demand for more efficient computers-- a more
relevant concern than ever with the emergence of compute-hungry large language
models. It remains to be seen whether or not computers can actually be built
that realize the efficiency benefits that were predicted in the 1960s; however,
the programming concepts are interesting in their own right, with a combination
of unique constraints and new capabilities, and this series of posts will be
exploring both in detail.

In this post, we have established the basic definition of reversible computing,
and discussed the most important programming concept in the field:
Lecerf-Bennett Reversal. This post was light on code, but future posts in this
series will be more technical, and will incrementally build up a set of
programming primitives that can be used to write arbitrary reversible programs
in a more or less intuitive way. The next post in this series will cover the
types of assignment operators that can be defined in reversible programming
languages in extensive detail.

---

#### Extra: The Name and Definition of "Lecerf-Bennett Reversal" & "Uncomputation"

Prior to compiling this series of posts, I had used the term "Lecerf-Bennett
Reversal" in my own notes, with the impression that I had seen it widely used in
a lot of reversible computing material that I had read. However, upon searching
for the term again, I could only find this exact term mentioned in a
[single 2008 blog post](https://strangepaths.com/reversible-computation/2008/01/20/en/)
from the blog "Strange Paths", which must be where I first encountered the term.
Upon further investigation of other sources, I found that although the general
concept was present in virtually all discussions of reversible computing, it
isn't really consistently named, and it is inconsistent how broadly or narrowly
the concept is scoped.

In terms of naming, the [University of Florida's reversible computing page](https://www.cise.ufl.edu/research/revcomp/faq.html)
comes close to using the same term, referring to this as "Lecerf Reversal [with
the addition of] Bennett's Trick". Other materials sometimes refer to the entire
concept as "Bennett's Trick".

However, many of those sources define the scope of this operation differently.
In some sources, "Bennett's Trick" doesn't just involve running a computation
backwards to clean up memory, but rather also includes a specific method of
simulating non-reversible computations by generating a "trace" explicitly
recording the history of the computation-- with the trace itself being
"uncomputed" during the final step of the operation.

For the purpose of this series of posts, the operation will be referred to as
"Lecerf-Bennett Reversal", and it will have the narrowly-scoped function
described in the main ["Lecerf-Bennett Reversal" section](#lecerf-bennett-reversal)
of this post, which simply covers running a computation forward to generate a
value, copying the value to a safe location, and then running the computation
in reverse to clean up any temporary values that were calculated during the
forward computation. "Uncomputation" will be used as an umbrella term
referring to any method of cleaning up a variable by performing a calculation
that cancels out its value, including Lecerf-Bennett Reversal, but also other
methods of cleaning up memory that will be introduced later.

Since we are going to be writing reversible code from the ground up, the whole
additional aspect of "simulating non-reversible computations" is just not going
to be relevant.
