---
layout: post
title: "Reversible Programming Primer: Assignment"
date: "2025-09-26 12:00:00 -0400"
categories: post
tags: programming reversible_programming reversible_primer
excerpt_separator: <!--more-->
---

Assignment as it generally understood cannot exist in a reversible programming
language. However, assignment as a form of initialization is essential for
writing computer programs in general. And so, reversible programming languages
will need to introduce new concepts of initialization to serve the role of
assignment operators, which could be called "reversible assignment" operators.
In this second post on reversible programming, I will be going over some of the
most useful types of reversible assignment operators that can be defined.
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

## The Building Blocks of Reversible Assignment

When we assign a value to a variable, we inevitably erase whatever value it
previously held, as in the example in the [introduction](../../../2025/08/19/reversible-primer-introduction.html#what-is-reversible-computing):

```rust
int x = 5;
x = 3; // Here, the program is erasing the value `5` that was previously stored
       // in `x`, and overwriting it with `3`.
```

Reversible programming languages typically do not have a direct "assignment"
operator, and instead make use of "compound assignment" operators. "Compound
assignment" is an operation that updates the value of a variable "in-place" by
applying some operation to it. For example, if we have a variable storing the
value `5` and we want to set its value to `3`, rather than performing an
assignment, we can use compound assignment to subtract `2` from the variable
in-place.

```rust
int x = 5;
x -= 2;
```

Here `-=` is a "compound assignment" operator that directly subtracts the
value on the righthand side from the variable on the lefthand side. Since
subtraction is invertible, modifying the variable in this way is entirely
reversible. If we wanted to restore the value to `5`, we could just perform the
inverse operation and *add* `2` to the number.

However, most existing reversible programming languages don't use addition or
subtraction as their foundation for initializing variables. Instead, they
typically use a lower-level operation called a ["bitwise exclusive OR"](https://en.wikipedia.org/wiki/Bitwise_operation#XOR),
also called "bitwise XOR" (often written in code with the infix operator `^`, as
in `A ^ B`). If you don't work with bitwise operations very often, you only need
to understand the following properties of bitwise XOR to understand its
applications in this post:

1. Zero is the identity element of bitwise XOR.
  - `A ^ 0 = A`
  - `0 ^ A = A`
2. Bitwise XOR is self-inverse-- and thus, invertible-- so we can use it as an
  operation in a reversible program.
  - `(A ^ B) ^ B = A`
3. As a consequence of 1 and 2, performing bitwise XOR between two copies of the
  same value results in zero.
  - `A ^ A = 0`

Since `0 ^ A = A`, if we assume that a variable `x` initially has a value of
`0`, we can initialize it with the value `A` by writing:

```rust
x ^= A;
```

This compound assignment replaces the value of `x` with `x ^ A`, and since `x`
is initially `0`, it effectively sets the value of `x` to `A`.

This means that code like:

```rust
int x = 5;

do_something(x);
```

Can be written more reversibly as:

```rust
int x;
x ^= 5;

do_something(x);
```

In this case, we are assuming that the initial value of the variable `x` is
implicitly `0`. This is an important assumption that programmers need to be able
to make for both variables allocated on the stack and memory that is allocated
on the heap in reversible programming languages. If this was not the case-- and
memory could come pre-populated with existing junk data-- then a reversible
program would have no way to dispose of that existing data and make use of the
memory for any useful purpose.

However, ensuring that this remains true requires revising the rules around a
feature of non-reversible programming languages that is widely taken for
granted.

## Variables Going Out of Scope and Uninitialization

Typically, in non-reversible programming languages, when you are done with the
value of a variable, you simply stop using it, and the value of the variable
will be safely discarded automatically when the variable goes out of scope.

```rust
{
  int x = 5;

  do_something(x);
}
// After the closing brace, `x` has passed out of scope. The value is no longer
// usable and is cleaned up automatically.
```

However, in a reversible programming language, this kind of automatic cleanup
cannot happen, because it would require erasing the information being stored
in the variable. Instead, variables in reversible programming languages are
typically both "initialized" from an initial blank state before they are used,
and then "uninitialized" back to their initial blank state once they are no
longer needed. This ensures that the next scope that uses the memory will have
fresh, blank memory to work with, without needing to erase anything. This is how
the important assumption that the memory that a reversible program allocates
will always be blank is able to remain true over the entire lifetime of the
program: memory will always be blank when it's allocated, because it is all
initially blank and must become blank again before it's returned to the
allocator.

In the equivalent reversible code, we would use bitwise XOR compound assignment
to initialize the variable at the start of the scope, and then use bitwise XOR
compound assignment again to uninitialize the variable at the end of the scope.

```rust
{
  // Initialize the variable.
  int x;
  x ^= 5;

  do_something(x);

  // Uninitialize the variable.
  x ^= 5;
}
// The variable `x` is allowed to pass out of scope, because it is blank.
```

This technically works, but it doesn't clearly communicate the intention of the
operations. If initialization and uninitialization look the same, then it won't
be possible for other programmers or the compiler to tell what a particular line
of code was intended to do, or what the state of variables can be expected to be
at any specific point within a function.

So, we could consider designing some more specialized operators that communicate
the intended operation more clearly.

## `copy` (`<-`) / `uncopy` (`->`)

When we initialize a variable with bitwise XOR compound assignment, we assume
that the variable is blank, and use bitwise XOR to "copy" a value into that
variable. When we uninitialize a variable with bitwise XOR compound assignment,
we assume that the variable currently holds a particular value, and use bitwise
XOR to "uncopy" that value out of the variable.

However, if we introduce dedicated initialization and uninitialization
operators, we could upgrade these "assumptions" into "assertions". Consider the
following possible operator:

```rust
a <- b;

// This is equivalent to:

assert(a == 0);
a ^= b;
```

Here, `assert` is a function that raises an error if the condition it is
provided with is not `true`.

This statement (`a <- b`) is the "`copy`" operator, which raises an error if the
lefthand side variable is not blank, and then copies the value of its righthand
side into its lefthand side variable.

We can create a similar, inverse operation for uninitializing a variable-- an
"`uncopy`" operator:

```rust
a -> b;

// This is equivalent to:

assert(a == b);
a ^= b;

// Alternatively, it could written more symmetrically with copy's implementation as:

a ^= b;
assert(a == 0);
```

Introducing specific operators for this purpose has the benefits of:

1. Making the intention of each operation clear.
2. Providing guarantees about the outcome of each assignment operation.
3. Decoupling the intended behavior of the operator from the specific underlying implementation.

Point 3 would allow for a compiler to optimize the implementation based on the
compilation target. For example, for optimized runtimes running on
non-reversible hardware, a compiler may be able to simply do an ordinary
[`memcpy`](https://en.cppreference.com/w/cpp/string/byte/memcpy.html)
or [`memset`](https://en.cppreference.com/w/cpp/string/byte/memset.html) if it
can statically determine that a `copy` or `uncopy` is guaranteed to succeed.
Reversible compile targets might also substitute any other other pair of
invertible operations with `0` as an identity element.

For example, we could have defined the `copy` and `uncopy` operators like this,
and the result would be exactly equivalent:

```rust
a <- b;

// Is equivalent to:

assert(a == 0);
a += b;

// And,

a -> b;

// Is equivalent to:

a -= b;
assert(a == 0);
```

For remembering how this operator functions, you can remember that-- like most
assignment operators-- it modifies the variable on its lefthand side, and use the
visual mnemonic that the operator somewhat resembles a pencil. The pointy end
of a pencil can be used for writing things, whereas the flat end of a pencil can
be used for erasing things.

`copy` and `uncopy` can be used as the building blocks for constructing a number
of other useful reversible assignment operators, including one operator that
should be familiar from traditional non-reversible programming.

## `swap` (`>-<`)

The `swap` operation is a reversible operation that is commonly-used even in
non-reversible programs. "Swapping" two variables exchanges the values stored in
those two variables. We can actually implement a `swap` in terms of the `copy`
and `uncopy` operators above, along with a temporary variable, here called
`temp`, which is initially blank.

```rust
// Copy the value of `a` to `temp`:
temp <- a;
// Uncopy the value of `temp` out of `a`,:
a -> temp;
// Copy the value of `b` to `a`:
a <- b;
// Uncopy the value of `a` out of `b`,:
b -> a;
// Copy the value of `temp` to `b`:
b <- temp;
// Uncopy the value of `b` out of `temp`,:
temp -> b;
```

Here, `temp` is an initially blank variable, and, by the end of the `swap`, it
has become blank again. This means that, in spite of using some additional
memory, this swap process doesn't generate any "junk data". This sequence of six
operations is a little clunky, and having to declare a temporary variable for
each swap would be fairly clunky as well. So, instead, we can provide a
dedicated operator for performing swaps:

```rust
a >-< b;
```

Similar to the argument above, a dedicated operator allows the `swap` to be
implemented in whatever way is contextually the fastest-- for example, multiple
`swap`s used in the same function might share the same temporary swap space, or
in some cases it might be possible to optimize away a swap entirely.

We can use a mnemonic for this operator as well. Rather than the ends being
pointed like a pencil, the arrows point inwards, making this look like two
funnels which pipe each value to the opposite variable.

## `move` (`-<`) / `unmove` (`>-`)

Unlike `copy` and `uncopy`, `swap` does not perform any assertions; `swap` was
carefully implemented so that every `copy` and `uncopy` will always succeed,
and so it will successfully `swap` its values no matter what they are. However,
we could also imagine a sort of "checked `swap`" that first asserts that one of
the variables is blank, then swaps the two variables.

```rust
// For this copy to succeed, `a` must be blank.
a <- b;
// Here, we clear `b` by uncopying the value from `a`.
b -> a;
```

Whereas it takes a total of six `copy`/`uncopy` operations to implement a
swap, we can implement a checked swap in only two operations. We implicitly
assert that `a` is blank, then set it to the same value as `b` with the initial
`copy`, and `uncopy` clear the value of `b`. This combination of operations has
the effect of "moving" a value from `b` to `a`. So, we could call this the
`move` assignment operator.

This core distinction between "copy assignment" and "move assignment" is a
concept that already exists in many high-performance non-reversible programming
languages, as it can be an important concept for static memory-safety schemes
such as [unique pointers](https://en.wikipedia.org/wiki/Smart_pointer#Unique_pointers)
or Rust's borrow checker system.

As we did with `copy` and `uncopy`, we can assign a unique operator symbol for
`move` assignment, and also introduce a symbol for the inverse "`unmove`"
assignment where we move the value in the opposite direction:

```rust
a -< b

// Is equivalent to:

a <- b;
b -> a;

// And:

a >- b

// Is equivalent to:

b <- a;
a -> b;
```

Similar to `swap`, we can use the visual mnemonic that the operators resemble
funnels, and the value on the wide end of the funnel is being "moved" to the
variable on the narrow end of the funnel. The `swap` operator symbol can
consequently also be seen as a "double-move", moving the values from each
variable to the opposite variable.

## `in-place` meta operator (`@`)

There is a particular kind of common assignment pattern in non-reversible
programming languages that we haven't really fully addressed yet. Sometimes,
the value that we assign to a variable is calculated partially in terms of the
existing value of that variable. For example:

```rust
x = x + 1;
```

This particular assignment represents a valid reversible operation. However,
these sorts of assignments-- where the lefthand side of the assignment also
appears on the righthand side-- can potentially lead to issues with
reversibility. For example, consider something as simple as:

```rust
x = x - x;
```

After this assignment, the value of `x` will be `0`, and there will be no way
to retrieve its original value. It might seem like we need to go through a
complex process of mapping out exactly what patterns of using of the lefthand
variable within the righthand expression are acceptable, and to construct a
complex system for recognizing valid assignments. However, we can instead get
away with a fairly simple set of rules.

- In a plain `copy` or `uncopy` assignment with `<-` or `->`, the lefthand
  variable may **never** appear on the righthand side of the assignment.
- However, variables can be modified in-place via compound assignments, as long
  as two conditions are met:
    1. The destination variable must appear on only one side of the operator (as
      with plain `copy` assignments).
    2. The operator must be a bijection.

We already discussed compound assignments in the [first section](#the-building-blocks-of-reversible-assignment).
We can rewrite these two examples in terms of compound assignment as:

```rust
x += 1;
```

and

```rust
x -= x;
```

Here, you can see that in the first case, using a compound assignment has
removed `x` from the righthand side, but in the second case, which we ruled out
as non-reversible, using compound assignment has failed to eliminate the `x` on
the righthand side, so the rules properly eliminate this statement as illegal.

This is all well and good for binary operations; however, traditionally,
programming languages have never included a compound assignment syntax for unary
operations, even though, for example, the following statement is a valid
reversible operation:

```rust
x = -x;
```

Compound assignment also doesn't fully account for non-commutative operators,
where you may want the result to be stored in the right operand instead of the
left. For example, there is no way to write the following expression as a
compound assignment, even though it's reversible:

```rust
x = y - x
```

For these and other cases where the overall operation is reversible but
traditional compound assignment syntax doesn't work, we can still express these
statements in reversible terms with the `copy`, `uncopy`, and `swap` operators
and temporary variables. Here is an implementation of the reversible examples
above, with a temporary variable that is initially blank, called `temp`:

```rust
x = x + 1;

// Is equivalent to:

temp <- x + 1;
temp >-< x;
temp -> x - 1;

// And,

x = -x;

// Is equivalent to:

temp <- -x;
temp >-< x;
temp -> -x;

// And,

y = x - y;

// Is equivalent to:

temp <- x - y;
temp >-< y;
temp -> x - y;
```

There is a clear pattern here:

1. `copy` the expression into `temp`.
2. `swap` `temp` and `x`.
3. `uncopy` an "inverse" expression out of `temp` to clear it.

But, rather than writing this verbose pattern everywhere, we could instead
introduce a "meta-operator" that acts as a stand-in for this pattern being
applied to an operator. This would be a meta-operator that can turn any operator
into a compound assignment operator.

Take an expression that you would like to turn into a compound assignment,
such as:

```rust
y - x
```

Then, place an `@` symbol between the operator and the operand representing the
variable where the value should be stored:

```rust
y -@ x;
```

This would be equivalent to the non-commutative compound assignment we had
difficulty with earlier:

```rust
y -@ x;

// Is equivalent to:

x = y - x;
```

The same pattern can be applied to unary operators:

```rust
-@x;

// Is equivalent to:

x = -x;
```

Since this meta-operator allows us to perform these operations "in-place" in
a variable, we could refer to this as the `in-place` meta-operator. You can
remember how it works because `@` is the "at" symbol, and it marks the operand
that the result should be stored "at". It can also be verbalized pretty easily.
For something like `x += y`, people generally verbalize it as "x plus equals y",
but you can similarly verbalize `x @+ y` as "x at plus y".

### Bijective and Non-Bijective Operators

As mentioned, reversible compound assignments, including compound assignment
operators created by the `in-place` meta-operator, have 2 restrictions:

1. The destination must appear on only one side of the operator.
2. The operator must be a bijection.

So far, we've only talked about rule 1. So, we need to talk about what it means
for an operator to be a bijection.

"[Bijection](https://en.wikipedia.org/wiki/Bijection)" is the math term for a
1:1 mapping. A function is a bijection if every unique input to the function
produces a unique output. Bijections are the only functions that have true
inverses.

For the purpose of the compound assignment rules, we can treat all operands
other than the destination operand as constants. So, any operator can be used
with the `in-place` meta-operator as long as that operator is a bijection when
all arguments except one are constants

Some common operations that are bijections when all arguments except one are
constant include:

- Addition
- Subtraction
- Negation
- Bitwise Xor
- Bitwise Not
- Logical Xor
- Logical Not
- [Bitwise Rotate](https://en.wikipedia.org/wiki/Bitwise_operation#Rotate) Left or Right (when the shift amount is constant)

Some common operations that are not bijections when all arguments except one are
constant include:

- Multiplication
- Division
- Remainder
- Bitwise And
- Bitwise Or
- Logical And
- Logical Or
- Non-Circular Bit Shift Left or Right
- Min
- Max
- Abs

Neither of these lists are exhaustive.

Since the operations in the second list are not bijections, it is not possible
to use them with the `in-place` meta-operator, so using these operations will
almost always result in the generation of junk data. We can see why
multiplication fails, for example, by revisiting one of the first examples from
the [introduction](../../../2025/08/19/reversible-primer-introduction.html#what-is-reversible-computing)
with this new syntax:

```rust
int x = 5;
x @* 0;
```

Multiplying `x` by `0` is not a bijection, because it is not a 1:1 mapping; it
maps every possible value of `x` to `x * 0` which is always equal to `0`.

The inability to perform such basic operations in-place has a real impact on
some fairly standard programming operations, such as [reductions](https://en.wikipedia.org/wiki/Fold_(higher-order_function)),
which have different considerations in reversible programming languages when you
are reducing with a non-bijective operator.

It is possible to define special-case variants of multiplication and some other
non-bijective operations that can be performed in-place, but there's not an
obvious "correct" implementation; there are a number of options with different
applications and trade-offs.

Both of these topics, non-bijective reductions and reversible in-place
multiplication variants, will each likely receive their own posts in the future,
because there are practical trade-offs to be aware of in how you approach them.
For now, though, it's sufficient just to understand that you cannot perform any
of these non-bijective operations in-place on a variable in a reversible
programming language.

### Aliasing

Our rules run into one little hiccup in the form of ["aliased"](https://en.wikipedia.org/wiki/Aliasing_(computing))
variables. An aliased variable is a variable that can be referenced by two
different names, making the rule about ensuring that a variable can only occur
on one side of the assignment operator impossible to enforce. For example,
imagine that `x` and `y` are two names for the same variable. What would the
following code do?

```rust
x -> y
```

`uncopy`ing a variable with the same value should clear the variable, but
clearing `x` would be non-reversible, since it would also clear `y` (since they
are the same underlying variable), meaning that `y` could not be used to restore
`x`'s original value. Reversible runtimes might raise an error, corrupt the
program's state or have some sort of unintuitive behavior, whereas runtimes
written for non-reversible computers might just perform the non-reversible
`uncopy` as-directed, compromising the ability to correctly roll back the
changes when the program backtracks.

Since variable aliasing has the potential to cause failures of reversibility or
wildly unintuitive behavior in reversible programming languages, a proper
reversible programming language needs a strategy to deal with it. As a result,
reversible programming languages would make good candidates for Rust-like static
borrow-checking systems, not so much for ensuring memory-safety as for ensuring
that no unexpected aliasing occurs.

## Wrapping Up

Although it's a fairly basic concept to spend an entire post on, developing an
intuition for how to write reversible code requires a strong understanding of
how to reversibly manipulate values. In this post, we have defined all of these
new assignment operators in terms of a single pair of assignment operators, the
`copy` and `uncopy` operators, themselves implemented in terms of more familiar
bitwise XOR compound assignments and assertions.

The next post in this series will cover the reversible versions of the
conditional and looping control structures fundamental to most computer
programs. With both the initialization of variables and control flow, we will
start to be able to write a little bit of actual code with real uses, such as
basic algorithms, and dig more into how the considerations for reversible
algorithms differ somewhat from their non-reversible counterparts.

---

#### Extra: Non-Nullability and `replace`

There's one final potentially useful assignment operator worth talking about:
the 3-argument `replace` operator.

```rust
replace(&x, y, z);

// Is equivalent to:

x -> y;
x <- z;
```

This operator essentially has the effect of:

- Asserting that `x` is initially equal to `y`.
- Then replacing the value of `x` with `z`.

This operator, at first, seems very trivial, but it would have an important role
to play in languages that have strict rules around nullability. Imagine that we
have a variable storing a non-nullable pointer and we want to change the value
of that pointer. We can't overwrite the value, so normally we would `uncopy` it
to clear the value, then `copy` a new value into the variable. However, doing
this would leave the pointer temporary invalid in between the `uncopy` and the
`copy`, violating type safety. We would need a single assignment operation, like
`replace` that does both of these operations atomically, at least from the
perspective of the type system.
