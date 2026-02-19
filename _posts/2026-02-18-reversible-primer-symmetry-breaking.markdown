---
layout: post
title: "Reversible Programming Primer: Symmetry-Breaking (Part 1)"
date: "2026-02-18 11:00:00 -0400"
categories: post
tags: programming reversible_programming reversible_primer
excerpt_separator: <!--more-->
mermaid: true
---

Reversible programming languages can run code "in reverse", but what does that
mean? You might have an intuitive idea that "running code in reverse" should be
equivalent to "running the inverse of the code", and this is a good default
assumption. However, when we look at some of the practical concerns of real
reversible programs, we discover that it's not always possible for this to be
the case, and that, even when it's possible, it's not always desirable. In this
fifth post on reversible programming, we will be examining the situations where
our intuition regarding reverse execution fails.

This is a bit of a difficult topic, and will be divided into two posts. In
this post, we will be exploring a motivating example and introducing some new
core primitives to address that motivating example. In the follow-up, we will
work towards establishing a more all-encompassing framework for these edgecases
to better understand how to integrate them into our existing reversible
programming patterns.
<!--more-->

#### A Disclaimer on Syntax

The code examples in this series use C-like imperative pseudocode. New
reversible programming primitives will be given distinct syntax and keywords
from the non-reversible primitives that they displace-- even if their
functionality is nearly identical-- because the existing non-reversible
primitives are still used throughout these posts to provide contrasting examples
or to make the behavior of reversible primitives explicit by giving concrete
implementations.

This syntax is also distinct from the syntax of existing reversible programming
languages, which often choose to reuse the syntax and keywords of non-reversible
programming languages for corresponding-but-not-equivalent concepts.

## Reversible User Input

I/O is an essential part of any real world software. I/O encompasses all of the
ways a computer program sends and receives data to and from external devices or
the user of the program. Throughout the series so far, we have been using I/O
operations, like reading user input or printing output, for examples without
examining them carefully. However, if we do examine them carefully, I/O
operations are the first place where our intuition about running code in reverse
breaks down.

Imagine that we have a statement that reads a line of user input:

```rust
string text <- readline();
```

This statement will pause to wait for a line of user input on the command line,
then write the result to the `text` variable, just like in a normal programming
language. However, once we start using backtracking alongside I/O functions
like `readline`, we end up with an unexpectedly difficult question: what does
this statement do if we run it in reverse?

```rust
undo {
  text <- readline();
}
```

For any other kind of function, this is how we would clean up the value that
was returned by the function. And that makes sense; as mentioned in the
introduction, our default intuitive assumption is that running code in reverse
is equivalent to running the inverse of that code. If the variable `text` was
initially blank and the statement caused it to become populated with a value,
then the reversed statement should cause the variable to become blank again.
This would be the "inverse" behavior.

However, in those other cases, we are cleaning up the value by "uncomputing" it.
To "uncompute" a value, the value needs to either be known ahead of time, or
needs to be correlated with the rest of the program state in a well-understood
way. For example, consider the following code:

```rust
int x <- y + z;
```

Here, we don't know ahead of time what the value of `x` will be, but we do know
how it relates to the variables `y` and `z`: it's their sum. This allows us
to revert `x` to a blank state by uncomputing the sum of `y` and `z`:

```rust
undo {
  x <- y + z;
}

// Is equivalent to:

x -> y + z;
```

However, user input does not satisfy this criteria. User input is inherently not
correlated with the program state in any predictable way, because it comes from
*outside of the program*. It comes from the user.

So if we wanted to get rid of the value in `text` in order to revert the variable
to its blank state, we have a problem. We cannot send the keystrokes back into
the user's fingers, so we cannot uncompute the text that they have entered. To
make the variable blank, we would have no choice but to erase the text. But we
also cannot erase things in a reversible programming language. This means that
the **true inverse behavior of reading user input does not exist in reversible
programming languages**.

Given all of this, it is not really clear what "should" happen when we run this
`readline` statement in reverse, but the one thing that we know for sure is not
going to happen is the inverse behavior of the original statement.

This may seem somehow inherently wrong-- as if the most obvious principle for
how reversible programming languages *should* work is being violated. How can
running a function in reverse not undo its effects? Does such a function even
still qualify as being reversible? Isn't that what "reversibility" means?

However, that is *not* what "reversibility" means. This "most obvious principle"
that has become ingrained as intuition over the course of the series is actually
a more subtle property that is deeply important to reversible programming, but
does not represent the totality of reversibility.

## Undo Symmetry

"Undo symmetry" is the property that running code in reverse will always
perfectly undo the effects of running it forwards. For a given undo symmetric
function `f`, the following program results in no net change to the program
state:

```rust
f();
undo {
  f();
}
```

*(This is a bit of a simplification that does not account for functions that are
non-terminating or initiate backtracking, but you can generally assume that
anything built out of pieces that individually have undo symmetry will also have
undo symmetry.)*

The intuitive idea that executing a program in reverse should execute the
"inverse" program is exactly equivalent to this symmetry, and this is the
symmetry that reading user input lacks.

Up to this point in the series, every single reversible primitive that we have
discussed has possessed this symmetry, to the point where it would certainly be
reasonable to believe that *all* reversible code must have this symmetry. And
that's a good instinct. Code lacking this symmetry fundamentally breaks certain
important patterns we've discussed previously.

The uninitialization performed by [`flash` blocks](/post/2025/11/24/reversible-primer-control-backtrack/#flash),
for example, does not work if we cannot assume that the setup code will be
perfectly undone when the `flash` block is rolled back.

```rust
string text;
flash {
  // Read a line of text
  text <- readline();

  expose {
    // Print the line of text
    printline("You wrote '{}'", text);
  }

  // Here, we roll back the readline statement; since `text <- readline();` in
  // reverse is not its own inverse, it's not clear exactly what happens, what
  // the state of `text` will be following the `flash` statement, or whether or
  // not the code following the `flash` statement will even be reached.
}

printline("The current value of `text` is: '{}'", text);
// It's unclear what this line should print, or if will even execute.
```

Since we don't know what `readline` does in reverse, there is no way to
determine what exactly this code would do. This kind of uncomputation pattern
is so vital to reversible programming, it's no wonder that code that
fundamentally breaks it never occurred as an obvious option before.

However, it's not a topic that we can avoid if we want to get to a point where
we can start writing real user-facing programs. We need to learn to wrangle
these symmetry-breaking I/O instructions, and it turns out that the best tools
for wrangling them are symmetry-breaking primitives. So, in our quest to answer
the question of "what does `readline` do in reverse?", the best place to start
is by looking at how symmetry-breaking works, and what we can use it for.

### `forward_half_toggle` / `reverse_half_toggle`

Symmetry-breaking is a difficult concept to wrap your head around, so I think
it's important to start from a set of primitives that are very easy to
understand. `forward_half_toggle` and `reverse_half_toggle` are quite possibly
the simplest symmetry-breaking primitives to describe, but they can also serve
as a very fundamental building block for writing more complex symmetry-breaking
code.

`forward_half_toggle` accepts a reference to a boolean, and negates the boolean
when it is executed forward, but does nothing when executed in reverse.

```rust
bool boolean_variable <- false;

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = false"

// executed forward: toggles the value of the boolean
forward_half_toggle(&boolean_variable);

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = true"

undo {
  // executed in reverse: does nothing
  forward_half_toggle(&boolean_variable);
}

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = true"
```

The `&` syntax is a widely-used syntax in C-like languages for creating a
reference to a variable. You can see here that the state of the boolean only
changes when the function is executed forward, clearly breaking symmetry.

Its counterpart, `reverse_half_toggle`, accepts a reference to a boolean, and
negates the boolean when it is executed in reverse, but does nothing when
executed forward.

```rust
bool boolean_variable <- false;

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = false"

// executed forward: does nothing
reverse_half_toggle(&boolean_variable);

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = false"

undo {
  // executed in reverse: toggles the value of the boolean
  reverse_half_toggle(&boolean_variable);
}

printline("boolean_variable = {}", boolean_variable);
// prints "boolean_variable = true"
```

I like to call these "half-toggle"s, because they each only toggle the variable
in one of the two directions. But, if you combine the two half-toggles, you get
a "whole" toggle:

```rust
forward_half_toggle(&boolean_variable);
reverse_half_toggle(&boolean_variable);

// Is equivalent to:

!@boolean_variable;
```

We can implement `forward_half_toggle` in terms of `reverse_half_toggle` in two
different ways:

```rust
reverse_half_toggle(&boolean_variable);
!@boolean_variable;

// or

undo {
  reverse_half_toggle(&boolean_variable);
}
```

Implementing `reverse_half_toggle` in terms of `forward_half_toggle` is also
possible by similar constructions.

The first question that these primitives help us to answer is: "Are
symmetry-breaking functions still reversible?". Although these two functions
both break symmetry, it's also easy to see that they are both still reversible.
The forward and reverse behaviors are not inverses of one another, but they are
each *self-inverse*: the inverse of negation is negation, and the inverse of
doing nothing is doing nothing. While our previous method of cleaning up
after a function-- running the function a second time in reverse-- does not work
for these functions, there is a method that does work: just run the function
again:

```rust
bool boolean_variable <- false;

printline("boolean_variable is initially {}", boolean_variable);
// prints "boolean_variable is initially false"

// Executed forward: toggles the value of the boolean to `true`
forward_half_toggle(&boolean_variable);

printline("boolean_variable has become {}", boolean_variable);
// prints "boolean_variable has become true"

// Executed forward again: toggles the value of the boolean back to `false`
forward_half_toggle(&boolean_variable);

printline("boolean_variable has returned to being {}", boolean_variable);
// prints "boolean_variable has returned to being false"

boolean_variable -> false;
```

This cleanup will also work if this sequence of statements is run in reverse, as
the boolean will never get toggled at all. And, if we wanted to "rewind" the
program, then doing so is still possible; we could just replace every instance
of `forward_half_toggle` with `reverse_half_toggle` and vice versa before
running the program in reverse, and it would rewind perfectly (as we would be
effectively swapping the forward and reverse behaviors).

But, by this point, you might be asking a second question: "That's all well and
good, but how do these primitives help us to wrangle symmetry-breaking?". And
the answer is that, by breaking symmetry, the half-toggles are able to act as
"detectors" that allow the program to check what direction code is executing in.
In fact, we've basically already seen this in action in the previous example,
but we can make it a little more clear:

```rust
bool direction <- false;
forward_half_toggle(&direction);

printline("Direction is forward: {}", direction);
// prints "Direction is forward: true" if the code is executed forward
// prints "Direction is forward: false" if the code is executed in reverse

forward_half_toggle(&direction);
direction -> false;
```

This ability to detect the direction of code execution serves as a critical
building block that can allow us to pick and choose which code executes when
code is running in each direction. In practice, it's useful to wrap this
symmetry-breaking control flow up into higher level constructs implemented in
terms of the half-toggles, such as the `fdo` and `rdo` statements.

### `fdo` / `rdo`

The half-toggles performed negation when executed in one direction and did
nothing when executed in the other direction, but what if we could extend this
to any behavior we chosoe? For example, what if we could make a block of code
that would only run if code was executing forward? This is what `fdo` and `rdo`
provide.

We can implement `fdo` as follows:

```rust
fdo {
  // body
}

// can be implemented as:

bool temp <- false;
forward_half_toggle(&temp);
given(temp) {
  // body
}
forward_half_toggle(&temp);
temp -> false;
```

Here, `temp` is a hidden variable that is accessible only to the `fdo`
statement.

The `fdo` statement executes its body only if code is executing forward when the
`fdo` statement is encountered. You can see that we use `forward_half_toggle`s
to initialize and uninitialize the condition for the `given` statement.

This functionality is powerful, but also has its own unique forms of fragility.
For example, the body of an `fdo` statement cannot initiate backtracking without
causing an error to be raised. Let's examine what happens, using the
implementation provided above. Since this example involves backtracking, I have
labeled each comment with its execution direction and numerical order in the
sequence of events:

```rust
bool some_boolean <- false;

// 1. [forward] `temp` is initialized to `false`.
// 5. [reverse] `false` is uncopied from `temp`, which has a value of `true`,
//    causing an error to be raised.
bool temp <- false;
// 2. [forward] The `forward_half_toggle` executes forward, toggling `temp` to
//    `true`.
// 4. [reverse] The `forward_half_toggle` executes in reverse, doing nothing and
//    leaving `temp` as `true`.
forward_half_toggle(&temp);
given(temp) {
  // 3. [forward] The inner toggle reflector initiates backtracking.
  turn(some_boolean) {
    !@some_boolean;
  }
}
forward_half_toggle(&temp);
temp -> false;
```

Since `forward_half_toggle` breaks symmetry, it doesn't clean up after itself
when you backtrack through it, which leads to an error-being raised when you
attempt to clear the `temp` variable.

However, it's to be expected to a certain extent that initiating backtracking
would not play well with symmetry-breaking primitives; their defining feature is
that they break the symmetry that backtracking relies on. However, in practice,
this does not generally cause problems. This error only occurs if backtracking
is initiated from inside of the `fdo` statement; backtracking past the statement
from the outside works entirely as expected: the statement is simply skipped
over.

We can also implement the reverse version of this concept, `rdo`:

```rust
rdo {
  // body
}

// Is equivalent to:

bool temp <- false;
reverse_half_toggle(&temp);
given(temp) {
  // body
}
reverse_half_toggle(&temp);
temp -> false;
```

And, `fdo` can also be implemented in terms of `undo` and `rdo`:

```rust
fdo {
  // body
}

// Is equivalent to:

undo {
  rdo {
    undo {
      // body
    }
  }
}
```

Implementing `rdo` in terms of `fdo` is also possible by a similar construction.

`rdo` comes with one possible pain point. Although it seems tempting to think of
it as "I will write the code snippet that I want to run when code is executing
in reverse", the code snippet that you write will *also* be executed in reverse.
For this reason, it can potentially be more intuitive to wrap the body of an
`rdo` block in an `undo` statement:

```rust
rdo {
  undo {
    // body
  }
}
```

With this combination, the `body` will be executed *exactly as-written* when
the `rdo` statement is encountered if code is executing in reverse. This
structure will be used whenever `rdo` is used throughout the series to make the
behavior easier to parse.

Alone, `fdo` and `rdo` allow us to write code that only executes when code is
running in one direction, but together, they allow us to write code that has
two independent behaviors: one that happens when code is running forward and
one that happens when code is running in reverse.

```rust
fdo {
  // forward behavior
}
rdo {
  undo {
  // reverse behavior
  }
}
```

These two behaviors are truly independent, and can be *anything*, even random
behaviors that have nothing to do with one another:

```rust
fdo {
  list.push("forward execution occurred");
}
rdo {
  undo {
    reverse_execution_count @+ 1;
  }
}
```

For more practical applications, we could potentially use `rdo` to attach
side-effects to the otherwise normal execution of the inverse, such as logging:

```rust
fdo {
  count @+ 1;
}
rdo {
  undo {
    count @- 1;
    // when this code is run in reverse, the count will be correctly decremented
    // as expected, but we'll also log that the decrement occurred.
    printline("count was decremented");
  }
}
```

Alternatively, we could use symmetry-breaking to enforce a rule that code can
only be called forward, by raising an error when the code is executed in
reverse.

```rust
fdo {
  count @+ 1;
}
rdo {
  undo {
    // decrementing count is not allowed!
    assert(false);
  }
}
```

`fdo` and `rdo` epitomize the flexibility that symmetry-breaking grants to
a reversible programmer. In future posts, we'll examine a number of more complex
techniques and primitives that are enabled by symmetry-breaking. But for our
purposes in this post, `fdo` and `rdo` provide us with the tools we need to
resolve our problems with I/O.

## Applying Symmetry-Breaking to I/O

Now that we've got more of a handle on symmetry-breaking, we can return to our
original topic: running `readline` in reverse.

It's not clear what `readline` *should* do when executed in reverse, and this is
a problem, because code is frequently run in reverse as a result of completely
normal reversible programming patterns, like the rollback that occurs during a
`flash` block. We've already seen, from an example in an earlier section, how
`readline` causes problems here.

```rust
string text;
flash {
  // Read a line of text
  text <- readline();

  expose {
    // Print the line of text
    printline("You wrote '{}'", text);
  }

  // Begin rollback.
}

printline("The current value of `text` is: '{}'", text);
// It's unclear what this line should print, or if will even execute.
```

We're stuck, because it's unclear what `text <- readline();` does in reverse.

However, the symmetry-breaking primitives we've discussed in this post give us
an approach to navigate this uncertainty: we can just avoid ever running the
`readline` statement in reverse by wrapping it in an `fdo` statement.

```rust
string text;
flash {
  // Read a line of text
  fdo {
    text <- readline();
  }

  expose {
    // Print the line of text
    printline("You wrote '{}'", text);
  }

  // Begin rollback.
}

printline("The current value of `text` is: '{}'", text);
// Prints 'The current value of `text` is: ', followed by the line of text.
```

Here, with the `readline` wrapped in `fdo`, it will not be executed during the
rollback of the flash block, so its undefined reverse behavior will not be
invoked, and `text` will retain its value after the `flash` block completes.

But, just doing nothing when executed backwards is neither the only nor the best
option for what a `readline` call should do when executed in reverse. The
`fdo`/`rdo` pattern discussed in the previous section gives us the ability to
fill in whatever reverse behavior we choose:

```rust
string text;
fdo {
  text <- readline();
}
rdo {
  undo {
    // Insert your reverse readline handler here.
  }
}
```

There are a few obvious options that come to mind to fill in the blank.

I/O is most likely to occur at a shallower location in the call stack, isolated
from algorithms, in code that orchestrates your program's external
communication. Since this code is not algorithmic, you may not want it to be
able to run in reverse in the first place. In this case, the most appropriate
behavior might be for the program to raise an error when you would otherwise
attempt to call `readline` in reverse:

```rust
string text;
fdo {
  text <- readline();
}
rdo {
  undo {
    // Raise an error.
    assert(false);
  }
}
```

However, for a more user-friendly abstraction for I/O, it could also make sense
to simulate the true "inverse" of reading user input by pretending to "erase"
the text when `readline` would be called in reverse. We can accomplish this by
creating a hidden garbage buffer for lines that were previously read from
`readline` and moving the text into that garbage buffer when we backtrack past
the `readline`.

```rust
// globals
List<string> previouslyReadLines = new List<string>();

string text;
fdo {
  text <- readline();
}
rdo {
  undo {
    // Push the text into a garbage buffer.
    previouslyReadLines.push(text);
    // Clear the text variable
    text -> previouslyReadLines.last();
  }
}
```

When this snippet is run in reverse, the text will be moved into the hidden
`previouslyReadLines` buffer, and `text` will become blank, as if its value had
been erased. This will cause the program to accumulate inaccessible garbage
data, but it provides an abstraction for I/O that aligns with undo symmetry a
little bit better.

There are a lot of different decisions we could make as to how to what behavior
to assign to reverse I/O, but the best choice is still really a topic of ongoing
investigation-- there's not a whole lot of practical reversible code out there
exercising the options to see which one works best. But this is a topic that I
plan to return to for a more extensive discussion in the future once I've had
more time to test the options in a hands on way, and once future posts have
introduced even more tools for building more sophisticated abstractions around
I/O.

## Wrapping Up

Symmetry-breaking is a powerful but overlooked tool in reversible computing. By
breaking with our intuitive assumptions, symmetry-breaking provides endless
flexibility for programmers to shape the forward and reverse behaviors of
functions independently and to make their own decisions about abstractions for
I/O, concurrency and other API features that have non-obvious interactions with
reversibility.

The biggest dilemma facing symmetry-breaking is precisely the fact that it
breaks so many patterns that we have come to rely on. The interactions of
symmetry-breaking code with `flash` statements is unintuitive, and without undo
symmetry as a universal rule of thumb, it feels less obvious exactly what kinds
of operations a reversible programming language should be expected to support.
In the next post in this series, we will be getting to the bottom of all this by
developing a more coherent mathematical model for symmetry-breaking code, and
isolating a subcategory of symmetry-breaking code that gives us both
symmetry-breaking functionality **and** compatibility with our existing
symmetry-abiding assumptions-- the best of both worlds.

---

#### Extra: Simulating Symmetry-Breaking

Most reversible instruction set architectures (ISA) and reversible programming
languages include a notion of a "direction bit", which is a special register
that stores the current direction of execution. It's called the direction "bit",
because the most common convention is to use a 1-bit register, which is `0` when
code is running forward, and `1` when it is running in reverse.

All of the symmetry-breaking structures defined in this post can be constructed
as long as `forward_half_toggle` or `reverse_half_toggle` can be implemented,
and `reverse_half_toggle` can be implemented as long as there is some way to
XOR the direction bit into a variable or something along those lines.

```rust
reverse_half_toggle(&x);

// Is equivalent to:

// Here, x is toggled only if `direction_bit` is `1` (meaning code is running in reverse).
x @^ direction_bit;
```

However, what about languages or ISAs that cannot read the direction bit
directly?

These languages cannot "break symmetry" in a real sense, because there is no
primitive way to "detect" the direction of execution. However, it *is* possible
to simulate symmetry-breaking by using a register or global variable as a sort
of "proxy direction bit" and ensuring that it gets toggled each time control
flow in the program reverses direction. `reverse_half_toggle` can then be
implemented as:

```rust
reverse_half_toggle(&x);

// Is equivalent to:

x @^ proxy_direction_bit;
```

From there, all of the remaining symmetry-breaking constructs can be
implemented. This leaves only the problem of how to ensure that the proxy
direction bit remains in sync with the true direction of execution.

Let's take the [Pendulum Instruction Set Architecture](https://esolangs.org/wiki/Pendulum_Instruction_Set_Architecture) ("PISA")
as an example, since it is a common compile target for reversible programming
languages. Reversal of control flow is accomplished in PISA using its
"reverse and branch" instructions, such as `RBRA`, which performs an
unconditional "jump and reverse" to a label, where there must be a matched
partner `RBRA`.

If we assume that the proxy direction bit will be stored in the register `$31`,
then all we need to do to ensure that it remains in sync with the real direction
bit is to ensure that, for every matching pair of `RBRA` instructions (and every
matching pair of every other variety of "reverse and branch" instruction), one
of the two matched instructions is sandwiched between two instructions that both
toggle the proxy direction bit:

```nasm
            XORI $31, 1
jumpstart:  RBRA jumpend
            XORI $31, 1

; ...

jumpend:    RBRA jumpstart
```

`XORI` is an instruction that performs a bitwise XOR of its right argument into
its left argument, here effectively toggling the least significant bit of
register `$31`.

The logic here is:

- We can only arrive at the sandwiched reverse-and-branch instruction to execute
  it by first executing one of the surrounding instructions that toggles the
  proxy direction bit.
- If the condition is not met, and the jump does not occur, then we reach the
  opposite side of the instruction and execute the other toggling instruction,
  which toggles the proxy direction bit again, returning it to its original
  value. Neither the direction bit nor the proxy direction bit become toggled.
- On the other hand, if we do jump and reverse, then there will not be a
  toggling instruction to execute at the destination, so when we reverse, the
  proxy direction bit will remain toggled. Both the direction bit and the proxy
  direction bit become toggled.

A similar argument can be made regarding jumping from the unsandwiched end.

This works for *any* type of "reverse and branch" instruction, but it must be
applied for *all* instances of all kinds of "reverse and branch" in your program
to maintain the integrity of the proxy direction bit.

This is a lot of work to do all of the time for something that is likely to be
used very infrequently. So, it would seem like the more convenient option would
be for reversible ISAs to simply provide direct instructions for XORing the
direction bit into a general purpose register, as a way of implementing the
`reverse_half_toggle` without this expensive emulation.

#### Extra: Perfect Reflection

The [previous post](/post/2025/11/24/reversible-primer-control-backtrack/#toggle-reflectors-and-backtracking)
introduced the concept of "toggle reflectors", statements that toggle a boolean,
and reflect the instruction pointer.

```rust
turn(some_boolean) {
  !@some_boolean;
}
```

Toggle reflectors are a useful building block for building backtracking-based
control structures, but symmetry-breaking brings along with it the much more
troublesome cousins of toggle reflectors: perfect reflectors.

A perfect reflector is a code structure that reflects the instruction pointer
without modifying any other element of the program state. A basic perfect
reflector can be implemented as:

```rust
reverse_half_toggle(&some_boolean);
turn(some_boolean) {
  !@some_boolean;
}
reverse_half_toggle(&some_boolean);
```

The trick here is that we sandwich a toggle reflector between two
symmetry-breaking half-toggles. This means that `some_boolean` will always be
toggled exactly twice: once by the toggle reflector, and once on either the way
in or the way out by the half-toggle. Since `some_boolean` will be toggled
twice, the program state will be exactly the same before and after the perfect
reflector executes, all aside from the direction of execution.

You might be wondering: if toggle reflectors are so useful, why should perfect
reflectors be so troublesome? After all, they both reflect the instruction
pointer, and, if anything, perfect reflectors seem cleaner, since they aren't
required to toggle an arbitrary variable to initiate backtracking.

However, toggling that variable is **important**; without it, backtracking
becomes dangerous. Consider the example code used to introduce toggle
reflectors:

```rust
bool error_encountered <- false;
bool handling_error <- false;

// On our first pass, this `given` statement will be skipped.
given(error_encountered) {
  // This toggle reflector terminates the backtracking
  // initiated by the error condition later in the program
  // and sets the `handling_error` flag.
  turn(handling_error) {
    !@handling_error;
  }
}

// Pre-backtracking we enter the `do_some_work` block.
// Post-backtracking, we enter the `handle_error` block.
given(!handling_error) {
  do_some_work();

  // Whoops, we encountered an error-- let's set the
  // `error_encountered` flag and initiate backtracking.
  given(some_error_condition) {
    turn(error_encountered) {
      !@error_encountered;
    }
  }
} else {
  handle_error();
}
```

Let's replace the toggle reflector that initiates backtracking with a perfect
reflector:

```rust
bool error_encountered <- false;
bool handling_error <- false;

// On our first pass, this `given` statement will be skipped.
// When backtracking, this `given` statement will still be skipped because the
// `error_encountered` flag is not set.
given(error_encountered) {
  turn(handling_error) {
    !@handling_error;
  }
}

given(!handling_error) {
  do_some_work();

  // Whoops, we encountered an error-- let's initiate backtracking without
  // setting a flag.
  given(some_error_condition) {
    reverse_half_toggle(&error_encountered);
    turn(error_encountered) {
      !@error_encountered;
    }
    reverse_half_toggle(&error_encountered);
  }
} else {
  handle_error();
}
```

Since we do not set the `error_encountered` flag, our recovery code is not able
to terminate the backtracking and the program will backtrack even further beyond
the start of the code snippet. In fact, **the entire program will perfectly
"rewind" to its initial state**, undoing all of its useful computation, and then
terminate.

Without some element of the program state being altered along with the
initiation of backtracking, there is nothing that can route the backwards path
of the backtracking onto a branch where the backtracking is terminated.

However, as always, reversible computing both causes the problem and provides
the solution. Our program will be powerless to recover from perfect reflection
*unless* it uses a symmetry-breaking primitive to detect the reversal itself:

```rust
bool error_encountered <- false;
bool should_recover <- false;
bool handling_error <- false;

// On our first pass, this `given` statement will be skipped.
// When backtracking, `should_recover` will become set to `true` by the
// `reverse_half_toggle`, triggering our rescue code and terminating
// backtracking.
reverse_half_toggle(&should_recover);
given(should_recover) {
  turn(handling_error) {
    !@handling_error;
  }
}
reverse_half_toggle(&should_recover);

given(!handling_error) {
  do_some_work();

  // Whoops, we encountered an error-- let's initiate backtracking without
  // setting a flag.
  given(some_error_condition) {
    reverse_half_toggle(&error_encountered);
    turn(error_encountered) {
      !@error_encountered;
    }
    reverse_half_toggle(&error_encountered);
  }
} else {
  handle_error();
}
```

Using perfect reflection to raise errors and symmetry-breaking to recover from
them was actually the earliest error-handling system that I investigated for
reversible programming languages. However, as time has gone by, I've gradually
refined and simplified my ideas around error-handling, and the latest and
greatest in error-handling abstractions will be the topic of a future post of
its own.

However, absent that motivation, the main reason to be aware of perfect
reflection is just so you can be on your guard about it, and to be careful not
to accidentally implement any without intending to. Luckily, perfect reflection
is somewhat hard to create accidentally. Perfect reflection can only be
constructed with either a primitive for perfect reflection, or a primitive for
symmetry-breaking. If neither of these are available or neither are used, then
perfect reflection cannot happen.

#### Extra: `gyro`

`fdo` and `rdo` have a quirky cousin which isn't quite as useful, but is no less
interesting. Whereas `fdo` and `rdo` break symmetry by only executing code *at
all* when code is executed in a particular direction, this variant control
structure instead *ignores* the direction that code is executing and always
executes its block forward. It's as if the block resists the flipping of the
direction of code execution and maintains an internal absolute "orientation",
so it might be appropriate to refer to this as a `gyro` statement.

The `gyro` statement can be implemented as follows:

```rust
gyro {
  // body
}

// Is equivalent to:

bool temp <- false;
reverse_half_toggle(&temp);
turn(temp) {
  // body
}
reverse_half_toggle(&temp);
temp -> false;
```

We can also implement `gyro` without `turn` by duplicating the `body`:

```rust
gyro {
  // body
}

// Is equivalent to:

fdo {
  // body
}
rdo {
  undo {
    // body
  }
}
```

Regardless of the direction of execution when a `gyro` statement is encountered,
its body will always be executed as-written, and will never be reversed:

```rust
int x <- 0;

// When code is executing forward, the body is executed forward and increments.
gyro {
  x @+ 1
}

printline("x = {}", x);
// prints "x = 1"

undo {
  // When code is executing in reverse, the body is *still* executed forward and
  // still increments.
  gyro {
    x @+ 1
  }
}

printline("x = {}", x);
// prints "x = 2"
```

`gyro` is a bit more of a novelty than something you would reach for for any
practical reason. But if you'd like a practical application: the `gyro`
statement can be used to convert a self-inverse symmetry-breaking code snippet
into a normal self-inverse statement.

```rust
gyro {
  // Since gyro forces the block to always run forward, we will always execute
  // `forward_half_toggle` forward, and the boolean will get toggled when this
  // snippet runs in either direction.
  forward_half_toggle(&some_boolean);
}

// Is equivalent to:

!@some_boolean;
```

This is a neat little pattern that allows us to use symmetry-breaking tools and
end up with something that seems not to break symmetry at all. You can consider
this a little sample of what's waiting for you in the next post.
