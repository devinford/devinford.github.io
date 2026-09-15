---
layout: post
title: "Some Notable Reversible Logic Gates"
date: "2026-09-15 11:00:00 -0400"
categories: post
tags: programming reversible_programming mathematics
excerpt_separator: <!--more-->
---

Logical connectives are the building blocks of logic; and logic gates, derived
from logical connectives, are the building blocks of computers. Anyone familiar
with programming is likely familiar with most of the basic logic gates: `AND`,
`OR`, and `NOT`. Maybe they've heard of `NAND` or `XOR`, or, if they're more
logically-inclined, maybe they've heard of `IMPLY`. They're well-known
quantities; each logic gate with 2 or fewer arguments even has its own wikipedia
page. But what aren't really documented quite *as* exhaustively are the
"reversible" logic gates.
<!--more-->
<script type="text/javascript" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

## Reversible Logic Gates

Typical logic gates accept one or more inputs which are either `true` or
`false`, and return a *single output*. For example, the truth table for an `AND`
gate can be written as:

| Input 1 | Input 2 | Output |
| ------- | ------- | ------ |
| F       | F       | F      |
| F       | T       | F      |
| T       | F       | F      |
| T       | T       | T      |

This truth table represents the concept of logical "and", because the output is
`true` only when Input 1 **and** Input 2 are both `true`.

Reversible logic gates are similar; they accept one or more inputs, and produce
output. But, they produce a number of outputs **equal** to their number of
inputs (for example, if the gate accepts two inputs, it will produce two
outputs), and the mapping between inputs and outputs is a 1:1 mapping. Every
unique set of inputs produces a unique set of outputs. One of the most
commonly-encountered reversible logic gates is the "controlled not" or `CNOT`
gate:

| Input 1 | Input 2 | Output 1 | Output 2 |
| ------- | ------- | -------- | -------- |
| F       | F       | F        | F        |
| F       | T       | F        | T        |
| T       | F       | T        | T        |
| T       | T       | T        | F        |

This gate negates the second input if the first input is `true`, and passes the
first input through to the first output unchanged.

You can see here that, just as all the input combinations are unique, all of the
output combinations are also unique. This is why the gate is "reversible": given
the outputs, we can determine which inputs produced them.

Aside from `CNOT` and the familiar `NOT`, the only notable commonly-discussed
reversible logic gates are the three-input/three-output
[Toffoli](https://en.wikipedia.org/wiki/Toffoli_gate) and
[Fredkin](https://en.wikipedia.org/wiki/Fredkin_gate) gates, which are
commonly-used in quantum computing. These two gates are each "universal",
meaning that, for any other gate, there is some logical circuit that you can
build from copies of the Toffoli gate that is equivalent to that gate (and the
same is true of the Fredkin gate).

But it seems strange. With three inputs and three outputs, there should be a
really large number of reversible logic gates. But it's actually really hard
to find any kind of information about them. Are the Toffoli and Fredkin gates
the only universal gates? How many reversible logic gates are there?

## Counting Reversible Logic Gates

A reversible logic gate maps each unique combination of inputs to a unique
combination of outputs. So, let's consider how many unique combinations of
inputs there are for logic gates of a given size.

- A 1-input gate has $$2$$ possible combinations of inputs:
    - `[F]`
    - `[T]`.
- A 2-input gate has $$4$$ possible combinations of inputs:
    - `[F, F]`
    - `[F, T]`
    - `[T, F]`
    - `[T, T]`.
- A 3-input gate has $$8$$ possible combinations of inputs:
    - `[F, F, F]`
    - `[F, F, T]`
    - `[F, T, F]`
    - `[F, T, T]`
    - `[T, F, F]`
    - `[T, F, T]`
    - `[T, T, F]`
    - `[T, T, T]`.
- In general, an $$N$$-input gate has $$2^N$$ possible combinations of inputs,
  representing every ordered combination of $$N$$ `true` or `false` values.

Since reversible logic gates are a 1:1 mapping, this makes them a "permutation"
of these possible combinations. The number of permutations of a list of $$M$$
elements is the factorial of $$M$$, or $$M!$$. In this case, $$M$$ is the number
of combinations of inputs, which we've already established is $$2^N$$. So the
number of reversible logic gates with $$N$$ inputs and $$N$$ outputs is
$${2^N}!$$. For example:

- The number of 1-input, 1-output reversible logic gates is $${2^1}! = 2! = 2$$.
- The number of 2-input, 2-output reversible logic gates is $${2^2}! = 4! = 24$$.
- The number of 3-input, 3-output reversible logic gates is $${2^3}! = 8! = 40320$$.

So, there are a lot of reversible logic gates. Even when it comes to gates that
are the same size as the Fredkin and Toffoli gates, there are $$40318$$ of them
that no one ever talks about. The most important property of the Fredkin and
Toffoli gates is that they are universal, as discussed before. So maybe the most
important question to look into is: how many *universal* reversible logic gates
are there?

### Counting Universal Reversible Logic Gates

Unfortunately, to the best of my knowledge, there isn't a simple formula for the
number of universal gates with a particular number of inputs and outputs,
reversible or otherwise. However, it turns out that doing a simple brute force
check isn't actually all that difficult or time consuming, so I've written a
simple program to enumerate them.

Of the $$16$$ standard 2-input, 1-output logic gates, only $$2$$ are universal,
so it would be easy to assume that the number of universal reversible gates
would also be small. However, it turns out that this is not the case. Out of the
$$40320$$ 3-input, 3-output reversible logic gates, **$$38976$$ are universal**.
That's the overwhelming majority. Exactly $$29$$ out of every $$30$$ 3-input,
3-output reversible logic gates are universal.

Although the Toffoli and Fredkin gates are often brought up as exemplars due to
their universality, universality is actually very typical for reversible logic
gates of their size. What is really exemplary about these two gates is that
they are universal in a conveniently simple way; their behavior is intuitive
and can be explained easily in terms of operations people are already familiar
with. However, it's definitely worth asking if they are the only universal gates
that are exemplary in this particular way.

However, if there's not a formula for the number of universal gates, there is
even less of a formula for the number of "conveniently simple" universal gates.
The only way that we are going to sort this out is if we actually look at some
of these gates to see how they work. However, 40,320 gates is a lot. So, first,
let's try to figure out if we can reduce these down to a smaller number of
"meaningfully distinct" gates.

## Reversible Logic Gate Families

We are going to make use of three operations to group reversible logic gates
into families.

- Inversion - We will consider a gate to be in the same family as its inverse.
- Permutation - We will consider a gate to be in the same family as each gate
  that can be constructed by permuting the inputs and outputs of that gate.
- Dualing - We will consider a gate to be in the same family as the gate that
  can be constructed by negating all inputs before they are passed into the gate
  and negating all outputs after they come out of the gate.

All three of these operations preserve a number of important properties of the
gate:

- Whether or not the gate is "*universal*", as discussed above.
- Whether or not the gate is "*population-preserving*", meaning that the number of
  `true` values in its output will always be the same as it had in its input.
- Whether or not the gate is "*parity-preserving*", meaning that the parity of the
  number of `true` values in its output will always be the same as it had in its
  input.

These three operations will group the gates into families of potentially as many
as $$144$$ gates each. In the best case scenario, we could end up with as few as
$$280$$ families. However, due to many of the gates having symmetries that make
these operations redundant, we only end up with $$406$$ distinct gate families,
of which $$382$$ are universal families.

$$406$$ is still actually a lot, and digging through, not all of those families
are interesting. So, I've taken quite a bit of time to curate as many
"interesting" reversible logic gates as I could identify.

## List of Notable 3-Input Reversible Logic Gate Families

This is a list of representative members of reversible logic gate families that
I found to be notably comprehensible and interesting that go beyond the typical
list of just Toffoli and Fredkin (although those will also be covered here).
This will hopefully give a better sense for how wide the field of reversible
logic gates is, and how Toffoli and Fredkin are not the only universal gates
with easy-to-interpret behavior.

This is obviously not a complete list. If you have a favorite 3-input reversible
gate, or you decide to go out and discover one after reading this post, feel
free to let me know, and I can list it here and credit you appropriately.

### Toffoli

The Toffoli gate, named after [Tommaso Toffoli](https://en.wikipedia.org/wiki/Tommaso_Toffoli),
and also known as the "controlled controlled not" gate, is arguably the simplest
universal reversible gate to understand and apply to building real circuits;
it's no coincidence that it is one of the two reversible gates that everyone
knows the name of.

The Toffoli gate toggles its third input if both of its first two inputs are
`true`. In other words, it toggles its third input if the `AND` of its first two
arguments is `true`.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | F        | T        |
| T       | T       | F       | T        | T        | T        |
| T       | T       | T       | T        | T        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2`
    - `Output 3 = Input 3 XOR (Input 1 AND Input 2)`
- Implementing Universal Set of Gates:
    - [T, T, x] => [T, T, NOT x]
    - [x, y, F] => [x, y, x AND y]

#### The Toffoli Variants

There's a number of other gates that I mentally file in the category of
"Toffoli variants". These are gates which have two inputs which pass through
unchanged as outputs, and a final input which is toggled depending on the values
of the passthrough bits. To my knowledge, these gates are not generally grouped
in this way, but I find that it is an easy way to understand (and to name) these
other, more rarely-discussed gates. All of these gates are self-inverse, and all
of those listed here are universal.

##### Toffoli-OR

The Toffoli-OR gate toggles its third input if either of its first two inputs is
`true` or if both are `true`. In other words, it toggles its third input if the
`OR` of its first two arguments is `true`.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | T        |
| F       | T       | T       | F        | T        | F        |
| T       | F       | F       | T        | F        | T        |
| T       | F       | T       | T        | F        | F        |
| T       | T       | F       | T        | T        | T        |
| T       | T       | T       | T        | T        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2`
    - `Output 3 = Input 3 XOR (Input 1 OR Input 2)`
- Implementing Universal Set of Gates:
    - [T, T, x] => [T, T, NOT x]
    - [x, y, F] => [x, y, x OR y]

##### Toffoli-NIMPLY

The Toffoli-NIMPLY gate toggles its third input if its first input is `true` and
its second input is `false`. In other words, it toggles its third input if the
[`NIMPLY` ("non-implication")](https://en.wikipedia.org/wiki/Material_nonimplication)
of its first two arguments is `true`.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | F        | T        |
| T       | F       | T       | T        | F        | F        |
| T       | T       | F       | T        | T        | F        |
| T       | T       | T       | T        | T        | T        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2`
    - `Output 3 = Input 3 XOR (Input 1 NIMPLY Input 2)`
- Implementing Universal Set of Gates:
    - [T, F, x] => [T, F, NOT x]
    - [x, y, F] => [x, y, x NIMPLY y]

##### Toffoli-IMPLY

The Toffoli-IMPLY gate toggles its third input unless its first input is `true`
and its second input is `false`. In other words, it toggles its third input if
the [`IMPLY` ("implication")](https://en.wikipedia.org/wiki/Material_conditional)
of its first two arguments is `true`.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | T        |
| F       | F       | T       | F        | F        | F        |
| F       | T       | F       | F        | T        | T        |
| F       | T       | T       | F        | T        | F        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | F        | T        |
| T       | T       | F       | T        | T        | T        |
| T       | T       | T       | T        | T        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2`
    - `Output 3 = Input 3 XOR (Input 1 IMPLY Input 2)`
- Implementing Universal Set of Gates:
    - [x, y, x] => [x, y, x NAND y]

I think that the `IMPLY` gate has gotten a little bit of a raw deal. In the
world of non-reversible logic gates, the `IMPLY` gate is not considered to be
a universal gate on a little bit of a technicality. In non-reversible circuits,
a gate is not considered to be universal if it potentially requires additional
constant inputs beyond the user provided inputs to the circuit. `NAND` and `NOR`
can construct a `NOT` gate by feeding in copies of the same value into both
input slots; however `IMPLY` needs a value that is known to be `false`. As a
result `IMPLY` is not considered universal by itself.

In the world of reversible circuits, though, things have flipped completely. The
Toffoli-IMPLY gate is unique among all of the Toffoli variants in that it
ironically is the **only one** that has the property that it originally lacked
in the non-reversible world. Of Toffoli and its variants, Toffoli-IMPLY is the
only one that is universal using only copies of inputs and no ancilla bits, as
you can see in the "Implementing Universal Set of Gates" above.

However, in this new world of reversible circuits, this has ceased to be a
property that anyone cares about, because, in reversible circuits, fanouts are
no longer free; they require a `CNOT` gate, so it's much cheaper in practical
circuits to just feed constant bits in as additional inputs. Toffoli-IMPLY has
achieved the very thing that it was lacking for so long in the non-reversible
world, but the requirements have changed to favor the same old players. Not only
is Toffoli-IMPLY not considered to be an important gate, it is a gate that does
not even have a name. It's almost like the universe is playing a cruel joke on
material implication.

### Peres

The Peres gate is a small variation on the Toffoli gate, which is equivalent to
performing a Toffoli gate, then applying a 2-input `CNOT` gate to the first two
outputs, toggling the second output if the first output is `true`.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | T        | F        |
| T       | F       | T       | T        | T        | T        |
| T       | T       | F       | T        | F        | T        |
| T       | T       | T       | T        | F        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 1 XOR Input 2`
    - `Output 3 = Input 3 XOR (Input 1 AND Input 2)`
- Implementing Universal Set of Gates:
    - [T, T, x] => [T, F, NOT x]
    - [x, y, F] => [x, x XOR y, x AND y]

I identified most of these "interesting" gates by classifying the gates
according to their symmetries and enumerating gates that had interesting
symmetries. The Peres gate did not actually pop up in this enumeration process
at all, because it doesn't satisfy the code that I wrote to check if a gate was
"interesting". Rather, I found out about the Peres gate by looking into what
classical gates are commonly used in quantum computing. The Peres gate is
apparently used as a minor optimization over the Toffoli gate, because it is of
a similar cost to produce, but performs an extra `CNOT` which later computations
may be able to leverage.

The Peres gate's behavior typically isn't mapped onto anything intuitive; it's
just "Toffoli, then `CNOT`", which is a big part of the reason that it wasn't
initially on my radar. But there is actually a pretty unique way to interpret
this gate. If we interpret the third bit as the most-significant bit of a 2-bit
register, and the second bit as the least-significant bit of a 2-bit register,
then we can actually interpret the Peres gate as a kind of "conditional
increment" gate, which increments its 2-bit register if its first bit is `true`.

### MAJ gate

The MAJ gate is another gate that I did not specifically enumerate myself.
Instead, the MAJ gate is a gate that I encountered in [a paper](https://arxiv.org/pdf/quant-ph/0410184)
on implementing ripple carry adders in reversible circuits (along with the "UMA"
gate, which will be discussed next).

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | T        | T        | F        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | T        | F        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | F        | T        | T        |
| T       | T       | F       | T        | T        | T        |
| T       | T       | T       | F        | F        | T        |

- Value of Outputs:
    - `Output 1 = Input 1 XOR Input 3`
    - `Output 2 = Input 2 XOR Input 3`
    - `Output 3 = (Input 1 AND Input 2) OR (Input 2 AND Input 3) OR (Input 3 AND Input 1)`
- Implementing Universal Set of Gates:
    - [x, T, T] => [NOT x, F, T]
    - [x, y, F] => [x, y, x AND y]

The expression for the third output might seem a little complex, but it actually
has a much simpler interpretation: it will be `true` if the majority of the
inputs are `true`, and will be `false` if the majority of the inputs are
`false`. Thus, the name "MAJ", for "majority". Since these are the three bits
being added in the ripple carry adder, the majority ends up representing the
decision as to whether or not there is a carry.

The second half of that adder circuit is the "UMA" gate:

### UMA gate

The "UMA" gate, short for "Un-Majority and Add", is the other half of the ripple
carry adder in the paper from the MAJ gate section.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | T        | T        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | T        | F        | T        |
| T       | F       | F       | T        | T        | F        |
| T       | F       | T       | F        | F        | T        |
| T       | T       | F       | F        | T        | T        |
| T       | T       | T       | T        | F        | F        |

- Value of Outputs:
    - `Output 1 = Input 1 XOR (Input 2 XNOR Input 3)`
    - `Output 2 = (Input 2 XOR Input 3) XOR (Input 1 IMPLY Input 2)`
    - `Output 3 = Input 3 XOR (Input 2 AND Input 3)`
- Implementing Universal Set of Gates:
    - [x, y, F] => [x, x OR y, x AND y]
    - [T, T, x] => [x, NOT x, NOT x]

As another gate I didn't first come across myself, I'm not exactly sure how to
interpret this one; it's not clear what exactly is so "un-majority" about it.
The one thing that is clear is that if we apply the `MAJ` gate, followed by
applying the `UMA` gate, it will result in both the first and third bits being
`XOR`ed into the second bit; this seems to perform the function of performing
the sum of the arguments and the carry for a single bit of output from an adder.
The implementation of the adder is more clear in the original paper
[linked above](#maj-gate), but they may not have really been designed to ever be
considered as generic primitives in isolation.

### Fredkin

The Fredkin gate, named after [Edward Fredkin](https://en.wikipedia.org/wiki/Edward_Fredkin),
and also known as the "controlled swap" gate, is the main competitor of the
Toffoli gate as the central gate of the reversible circuit computational model.
As the alias "controlled swap" might imply, the Fredkin gate swaps its second
and third inputs if its first input is true.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | T        | F        |
| T       | T       | F       | T        | F        | T        |
| T       | T       | T       | T        | T        | T        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = (Input 1 AND Input 3) XOR ((NOT Input 1) AND Input 2)`
    - `Output 3 = (Input 1 AND Input 2) XOR ((NOT Input 1) AND Input 3)`
- Implementing Universal Set of Gates:
    - [x, F, y] => [x, x AND y, (NOT x) AND y]
        - As a special case, where y = T, this reduces to:
            - [x, F, T] => [x, x, NOT x]

Unlike the Toffoli gate, the Fredkin gate is a "population-preserving" gate. If
you look at the table above, you will see that the number of `true` values in
the inputs for each row is equal to the number of `true` values in the outputs
for that row. This property of population-preservation is a double-edged sword.
Because population-preservation is analogous to physical conservation laws,
Fredkin gates can be reproduced in a variety of unexpected real world contexts,
implemented via [billiard ball logic systems](https://en.wikipedia.org/wiki/Billiard-ball_computer);
there have even been circuits implemented using live crabs as the logical
elements. However, population-preservation also means that circuits tend to need
a large number of [ancilla bits](https://en.wikipedia.org/wiki/Ancilla_bit)
(additional inputs with specific initial values) in order to be able to simulate
non-population-preserving gates.

As you can see above, the implementation of `NOT` uses two ancilla bits that
both get filled with garbage data at the end of the circuit. Compare this to the
Toffoli implementation, which also uses two ancilla bits, but leaves their
values unchanged instead of filling them with garbage data.

I think the Fredkin gate is a good gate to use as a demonstration of the fact
that our high-level descriptions of these gates, such as calling this the
"controlled swap" gate ultimately are just "descriptions" rather than
"definitions". The Fredkin gate is usually described as a gate which swaps its
second and third arguments if its first argument is `true`. However, you could
also describe it as a gate that swaps its second and third arguments if exactly
two of its arguments are `true`. Both of these descriptions are valid because it's
ambiguous whether or not two bits are being "swapped" if their values are equal.

In that sense, the "nice" gates being identified in this post, are not "nice" in
any sort of absolute sense, they're just the gates that have some kind of
readily observable pattern that our brains are able to latch onto and compress
into something digestable.

The Fredkin gate, as the "Controlled Swap" gate, is the first of three
pretenders to the throne of the Swap gate, each generalizing the Swap gate in a
unique way, and beginning their own branch of the fractured Swap gate lineage.
The Fredkin gate generalizes the swap gate by adding conditionality, but is it
the true heir? As you read through these gate descriptions, you can come to your
own conclusion.

### Twist

As mentioned, the Fredkin gate is a "population-preserving" gate. When you
account for the various symmetries of the gates, there are only really three
distinct families of population-preserving gates. The first is the identity
gate, which passes its inputs straight through to its outputs without changing
then. The second is the Fredkin gate, as discussed above. And the third is what
I like to call the "twist" gate.

The Twist gate cyclically shifts all of its inputs to produce its outputs,
but it chooses which direction to cyclically shift the inputs based on the
parity of the number of inputs that are `true`. One possible version is shown
here, where the inputs are cyclically-shifted towards the end of the list if the
parity of the number of `true` inputs is odd, and cyclically-shifted toward the
start of the list if the parity of the number of `true` inputs is even.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | T        | F        | F        |
| F       | T       | F       | F        | F        | T        |
| F       | T       | T       | T        | T        | F        |
| T       | F       | F       | F        | T        | F        |
| T       | F       | T       | F        | T        | T        |
| T       | T       | F       | T        | F        | T        |
| T       | T       | T       | T        | T        | T        |

- Value of Outputs:
    - `Output 1 = (Input 1 AND Input 2) OR (Input 3 AND (NOT Input 1))`
    - `Output 2 = (Input 2 AND Input 3) OR (Input 1 AND (NOT Input 2))`
    - `Output 3 = (Input 3 AND Input 1) OR (Input 2 AND (NOT Input 3))`
- Implementing Universal Set of Gates:
    - [x, F, T] => [NOT x, x, x]
    - [x, y, T] => [y IMPLY x, x OR y, x]

Because of its population-preserving properties, this gate has been referenced
a few times in mainstream reversible computing research. It is referred to as
the "SMP" gate ("Symmetric Majority/Parity" Gate) by Norman Margolus in the
paper "Physics and Computation" (1987) and also mentioned by this name by Bill
Silver in "Conservative Logic" (1978). In a [retrospective on the life of Edward Fredkin](https://writings.stephenwolfram.com/2023/08/remembering-the-improbable-life-of-ed-fredkin-1934-2023-and-his-world-of-ideas-and-stories/),
the namesake of the Fredkin gate, Stephen Wolfram attributes the investigation
of this gate to Edward Fredkin.

The Twist gate is the second of the three pretenders to the throne of the Swap
gate. A swap is just a cyclic shift of two elements. A 2-element Twist gate with
the rule that it cyclically shifts its inputs with their parity is odd
corresponds exactly to the Swap gate. This arguably makes it a more direct
generalization than the Fredkin gate, which might be seen as more of a
parameterization than a generalization. However, maybe a parameterization is the
correct method of generalizing; that is what the Toffoli gate did for the `CNOT`
gate afterall.

There is another equivalent form of the Twist gate that is also interesting for
its own reasons, what we might call the "half-Twist" gate.

#### Half-Twist

If we cyclically shift all of the outputs of the Twist gate by one step, we can
actually cancel out one of the two twists, to end up with a gate that only
cyclically shifts its inputs when the population of its inputs is 2 (or 1,
depending on which direction you do the shift in). This "Half-Twist" gate is in
the same family as the ordinary Twist gate, so it is functionally equivalent.
I personally think that the full Twist gate is a funnier concept and it's been
referenced in real papers, which is why I gave it top-billing, but it would be
entirely valid to prefer Half-Twist gates, as they seem likely to be easier to
work with.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | T        | F        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | T        | F        |
| T       | T       | F       | F        | T        | T        |
| T       | T       | T       | T        | T        | T        |

- Value of Outputs:
    - `Output 1 = (Input 2 AND Input 3) XOR ((NOT Input 2) AND Input 1)`
    - `Output 2 = (Input 3 AND Input 1) XOR ((NOT Input 3) AND Input 2)`
    - `Output 3 = (Input 1 AND Input 2) XOR ((NOT Input 1) AND Input 3)`
- Implementing Universal Set of Gates:
    - [x, F, y] => [x, x AND y, (NOT x) AND y]
        - As a special case, where y = T, this reduces to:
            - [x, F, T] => [x, x, NOT x]

This variant is notable because the implementation of a universal set of gates
is identical to the constructions used for the Fredkin gate. This gate actually
shares all but two of its rows in common with the Fredkin gate, meaning that
many constructions in terms of the Fredkin gate also work with this gate.

### Read-Write gate

The Read-Write gate is a gate which operates as follows:

- If the first input is `false`, replace the second input with the `XOR` of the
  second and third inputs.
- If the first input is `true`, replace the third input with the `XOR` of the
  second and third inputs.

In other words, it's a `CNOT` gate with an extra control bit that determines
which direction the `CNOT` is applied in. Another possible name for it might be
the "Directed Controlled Not Gate".

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | T        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | F        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | F        | T        |
| T       | T       | F       | T        | T        | T        |
| T       | T       | T       | T        | T        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2 XOR ((NOT Input 1) AND Input 3)`
    - `Output 3 = Input 3 XOR (Input 1 AND Input 2)`
- Implementing Universal Set of Gates:
    - [T, T, x] => [T, T, NOT x]
    - [x, y, F] => [x, y, x AND y]

If you've been paying extremely close attention, you might notice that these
inputs and outputs for simulating the NOT and AND gates are EXACTLY the same
as those from the Toffoli gate. It's possible that, in many circumstances where
the Toffoli gate is only being used to construct non-reversible gates, the
Read-Write gate could be used as a drop-in replacement.

The Read-Write gate is unique among the gates on this list in that it is the
only one that I actually wrote out by hand prior to doing any enumeration. I was
investigating a simple system for creating reversible circuits, and it turned
out that, within that system, the Read-Write gate served as a simple single gate
memory circuit, thus the name.

### Controlled Antiswap

The swap gate is a gate that swaps its arguments, but you could also think of it
as a gate that negates both of its arguments if they are not equal. Thus, there
is a kind of counterpart gate to the swap gate that you might call the
"antiswap" gate, which negates both of its arguments if they **are** equal.
Earlier, we discussed the Fredkin gate, which is the "controlled swap" gate;
however, we could just as easily consider a "controlled antiswap" gate.

Here, if the first input is `true`, then the gate will negate the other two bits
as long as they are both equal.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | T        | T        |
| T       | F       | T       | T        | F        | T        |
| T       | T       | F       | T        | T        | F        |
| T       | T       | T       | T        | F        | F        |

- Value of Outputs:
    - `Output 1 = Input 1`
    - `Output 2 = Input 2 XOR (Input 1 AND (Input 2 XNOR Input 3))`
    - `Output 3 = Input 3 XOR (Input 1 AND (Input 2 XNOR Input 3))`
- Implementing Universal Set of Gates:
    - [x, y, x] => [x, y NIMPLY x, x NAND y]

Just as we have our three pretenders to the throne of the swap gate, we have two
gates competing to be successor to the antiswap gate. Controlled antiswap
generalizes it through parameterization, but its opponent may very well be the
simplest universal reversible logic gate that can be defined.

### Negate If Equal

You might imagine that the Toffoli and Fredkin gates are so widely used and
talked about just because maybe it turns out that they're the "simplest" gates
that are universal; after all, they are very simple. And when you compare them
to the Twist gate, for example, the Twist gate is a little bit fiddly, because
you have to remember which parity corresponds to which shift direction. Maybe
all of the other universal reversible gates are equally or even more fiddly than
the Twist gate.

However, there are some genuinely astonishingly simple universal reversible
logic gates, such as: the "Negate If Equal" gate.

The Negate If Equal gate, as its name implies, negates all of its inputs
if all of them are equal. Since negating all of the bits preserves their
status of being non-equal, this gate is both reversible and self-inverse.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | T        | T        | T        |
| F       | F       | T       | F        | F        | T        |
| F       | T       | F       | F        | T        | F        |
| F       | T       | T       | F        | T        | T        |
| T       | F       | F       | T        | F        | F        |
| T       | F       | T       | T        | F        | T        |
| T       | T       | F       | T        | T        | F        |
| T       | T       | T       | F        | F        | F        |

- Value of Outputs:
    - `Output 1 = (Input 1 AND (NOT Input 2)) OR (Input 1 AND (NOT Input 3)) OR ((NOT Input 2) AND (NOT Input 3))`
    - `Output 2 = (Input 2 AND (NOT Input 3)) OR (Input 2 AND (NOT Input 1)) OR ((NOT Input 3) AND (NOT Input 1))`
    - `Output 3 = (Input 3 AND (NOT Input 1)) OR (Input 3 AND (NOT Input 2)) OR ((NOT Input 1) AND (NOT Input 2))`
- Implementing Universal Set of Gates:
    - [x, y, F] => [y IMPLY x, x IMPLY y, x NAND y]

The rule is an obvious generalization of the anti-swap gate to three inputs;
both follow the same rule: if all inputs are equal, negate all inputs. And, just
as the simple antiswap gate is a counterpart to the equally simple swap gate,
Negate If Equal is also a counterpart to another equally simple gate.

### Negate Unless Equal

What follows after Negate If Equal? Well, it's obviously "Negate Unless Equal".
This gate negates all of its inputs unless all of them are equal. Since negating
all of the bits preserves their status of being equal, this gate is both
reversible and self-inverse.

| Input 1 | Input 2 | Input 3 | Output 1 | Output 2 | Output 3 |
| ------- | ------- | ------- | -------- | -------- | -------- |
| F       | F       | F       | F        | F        | F        |
| F       | F       | T       | T        | T        | F        |
| F       | T       | F       | T        | F        | T        |
| F       | T       | T       | T        | F        | F        |
| T       | F       | F       | F        | T        | T        |
| T       | F       | T       | F        | T        | F        |
| T       | T       | F       | F        | F        | T        |
| T       | T       | T       | T        | T        | T        |

- Value of Outputs:
    - `Output 1 = ((NOT Input 1) AND Input 2) OR ((NOT Input 1) AND Input 3) OR (Input 2 AND Input 3)`
    - `Output 2 = ((NOT Input 2) AND Input 3) OR ((NOT Input 2) AND Input 1) OR (Input 3 AND Input 1)`
    - `Output 3 = ((NOT Input 3) AND Input 1) OR ((NOT Input 3) AND Input 2) OR (Input 1 AND Input 2)`
- Implementing Universal Set of Gates:
    - [x, T, F] => [NOT x, F, T]
    - [x, y, T] =>  [x IMPLY y, y IMPLY x, x AND y]

The Negate Unless Equal gate is the third and final pretender to the throne of
the Swap gate. Negate Unless Equal lacks the parity-preserving property that
the Fredkin and Twist gates share with the Swap gate; however, it is arguably
the most exact generalization, because the Swap gate could be accurately
described as the 2-input "Negate Unless Equal" gate.

So, which of the three is the true heir to the throne? Well, the truth is that
it's kind of a meaningless question that I just made up while writing this post.
However, as discussed in the Fredkin section, really, everything discussed in
this post are just made up descriptions we've invented to try to understand
abstract mathematical behavior. Being willing and able to ask this kind of
meaningless question is critical to being able to make the kinds of connections
that are needed for mathematical thinking, recreational or otherwise.

## Wrapping Up

I would have liked to have been able to give a name to at least one gate from
each family, but I found the behavior of most families was extremely difficult
to summarize as anything other than "gate A, then gate B". No matter how I
tried, I couldn't think of anything worthwhile to say about them. I've looked
through hundreds of gates in the unrepresented families, but recognizing these
sorts of higher-order notable patterns is non-trivial, and I had to cut off my
exploration somewhere. If I ever find a big enough batch of reversible logic
gates to be worth discussing in the future, I might make a follow-up post; but,
more likely, the next logic-gate-related post will be a discussion of a novel
reversible circuit model I stumbled across that seems like a neat and completely
unexplored recreational mathematics topic.

---

#### Extra: Universal Reversible Three-Valued Logic Gates

Three-valued logic gates are also a fairly overlooked topic in mathematics, and
when you combine reversiblity with three-valued logic, you find a topic that
effectively no one is talking about. However, there are some interesting
questions that we can ask. For example, it's kind of just accepted as a given
that while you only need two inputs to create a universal non-reversible logic
gate, you simply have to have at least three for a universal reversible logic
gate. But does this requirement persist into higher-valued logics?

The answer, as it turns out, is no, and there's a very simple three-valued,
2-input reversible logic gate that can be fairly easily shown to be universal. I
like to call this the "increment if zero" gate.

```
IncrementIfZero(A, B)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 1        |
| 0       | 1       | 0        | 2        |
| 0       | 2       | 0        | 0        |
| 1       | 0       | 1        | 0        |
| 1       | 1       | 1        | 1        |
| 1       | 2       | 1        | 2        |
| 2       | 0       | 2        | 0        |
| 2       | 1       | 2        | 1        |
| 2       | 2       | 2        | 2        |

This gate increments its second bit (mapping `0` -> `1`, `1` -> `2`, `2` -> `0`)
if its first bit is `0`, and passes its first bit through unchanged. This is
basically the closest three-valued equivalent of the two-valued `CNOT` gate. But
while the `CNOT` gate is not universal, we can show that increment if zero
**is** universal.

We can use a constant `0` bit as the first argument to construct a pure increment
gate. *(For this little extra section, we'll be using a simple comma-separated
 syntax to represent constructing a gate from a sequence of other gates.)*

```
Increment(A) :=
  IncrementIfZero(0, A)
```

| Input A | Output A |
| ------- | -------- |
| 0       | 1        |
| 1       | 2        |
| 2       | 0        |

Two increments can be used to construct a decrement:

```
Decrement(A) :=
  Increment(A),
  Increment(A)
```

| Input A | Output A |
| ------- | -------- |
| 0       | 2        |
| 1       | 0        |
| 2       | 1        |

And decrements and increments can be used to construct variants of "increment if
zero": "increment if one" and "increment if two".

```
IncrementIfOne(A, B) :=
  Increment(A),
  Increment(A),
  IncrementIfZero(A, B),
  Increment(A)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 0        |
| 0       | 1       | 0        | 1        |
| 0       | 2       | 0        | 2        |
| 1       | 0       | 1        | 1        |
| 1       | 1       | 1        | 2        |
| 1       | 2       | 1        | 0        |
| 2       | 0       | 2        | 0        |
| 2       | 1       | 2        | 1        |
| 2       | 2       | 2        | 2        |

```
IncrementIfTwo(A, B) :=
  Increment(A),
  IncrementIfZero(A, B),
  Increment(A),
  Increment(A)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 0        |
| 0       | 1       | 0        | 1        |
| 0       | 2       | 0        | 2        |
| 1       | 0       | 1        | 0        |
| 1       | 1       | 1        | 1        |
| 1       | 2       | 1        | 2        |
| 2       | 0       | 2        | 1        |
| 2       | 1       | 2        | 2        |
| 2       | 2       | 2        | 0        |

And, as you might imagine, just as we can use increment to construct decrement,
we can use our conditional increments to construct conditional decrements:

```
DecrementIfZero(A, B) :=
  IncrementIfZero(A, B),
  IncrementIfZero(A, B)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 2        |
| 0       | 1       | 0        | 0        |
| 0       | 2       | 0        | 1        |
| 1       | 0       | 1        | 0        |
| 1       | 1       | 1        | 1        |
| 1       | 2       | 1        | 2        |
| 2       | 0       | 2        | 0        |
| 2       | 1       | 2        | 1        |
| 2       | 2       | 2        | 2        |

```
DecrementIfOne(A, B) :=
  IncrementIfOne(A, B),
  IncrementIfOne(A, B)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 0        |
| 0       | 1       | 0        | 1        |
| 0       | 2       | 0        | 2        |
| 1       | 0       | 1        | 2        |
| 1       | 1       | 1        | 0        |
| 1       | 2       | 1        | 1        |
| 2       | 0       | 2        | 0        |
| 2       | 1       | 2        | 1        |
| 2       | 2       | 2        | 2        |

```
DecrementIfTwo(A, B) :=
  IncrementIfTwo(A, B),
  IncrementIfTwo(A, B)
```

| Input A | Input B | Output A | Output B |
| ------- | ------- | -------- | -------- |
| 0       | 0       | 0        | 0        |
| 0       | 1       | 0        | 1        |
| 0       | 2       | 0        | 2        |
| 1       | 0       | 1        | 0        |
| 1       | 1       | 1        | 1        |
| 1       | 2       | 1        | 2        |
| 2       | 0       | 2        | 2        |
| 2       | 1       | 2        | 0        |
| 2       | 2       | 2        | 1        |

With these functions, we have what we need to implement basic logical
connectives. For the sake of not going on excessively long, we can limit this
to constructing a universal set of gates for "ternary-coded binary", where we
interpret two of our three values as being "false" and "true" and build a
universal set of 2-value logic gates over those two values. Let's assign `0` as
`false`, and `1` as `true`.

We can implement logical `NOT` in terms of two temporary trits, `TEMP0` and
`TEMP1`, both initially set to `0` as:

```
Not(A) :=
  IncrementIfZero(A, TEMP0),
  IncrementIfOne(A, TEMP1),
  DecrementIfOne(TEMP1, A),
  IncrementIfOne(TEMP0, A),
  DecrementIfOne(A, TEMP0),
  DecrementIfZero(A, TEMP1)
```

Our two temporary registers are guaranteed to be reverted to their initial value
of `0` by the end of the circuit.

We can use a similar approach to implement a `CNOT` gate:

```
CNot(A, B) :=
  IncrementIfOne(A, B),
  IncrementIfTwo(B, TEMP1),
  IncrementIfOne(A, B),
  IncrementIfTwo(B, TEMP0),
  IncrementIfOne(A, B),
  DecrementIfOne(TEMP1, B),
  IncrementIfOne(TEMP0, B),
  DecrementIfOne(A, B),
  DecrementIfTwo(B, TEMP1),
  DecrementIfOne(A, B),
  DecrementIfTwo(B, TEMP0),
  DecrementIfOne(A, B)
```

As with the previous circuit, our two temporary registers are guaranteed to be
reverted to their initial value of `0` by the end of the circuit.

And once we have `CNOT`, we can implement Toffoli in terms of `CNOT` by
conditionally incrementing a temporary trit `TEMP`, which is initially set to
`2`, based on each of the other inputs, and then using this trit to perform a
`CNOT`:

```
Toffoli(A, B, C) :=
  IncrementIfOne(A, TEMP),
  IncrementIfOne(B, TEMP),
  CNot(TEMP, C),
  DecrementIfOne(B, TEMP),
  DecrementIfOne(A, TEMP)
```

As with the previous circuits, our temporary register is guaranteed to be
reverted to its initial value of `2` by the end of the circuit.

This demonstrates the key reason that we only need 2 inputs for a universal
gate with three-valued logic. Since a single trit is able to act as an
accumulator to accept two conditional increments without overflowing, we can
store the total number of `true` inputs in just one output. The total number of
`true` inputs can be used to compute `OR` or `AND`, which are the main struggle
for normal two-valued reversible logic gates.
