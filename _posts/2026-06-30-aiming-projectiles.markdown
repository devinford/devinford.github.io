---
layout: post
title: "Aiming Projectiles"
date: "2026-06-30 11:00:00 -0400"
categories: post
tags: programming game_development mathematics
excerpt_separator: <!--more-->
---

Shooting is a very common mechanic in video games; however, unless your
projectiles are entirely [hitscan](https://en.wikipedia.org/wiki/Hitscan)---meaning
that the player instantly hits whatever they are aiming at when pulling the
trigger---aiming projectiles is unexpectedly non-trivial from a mathematical
perspective. For players, this is part of the fun, and their aim is more driven
by physics intuition and muscle memory. But for AI-controlled characters, this
is a real problem, and there are a number of factors that can potentially make
it even more complicated. In this post, I will be discussing the solutions for
the most common category of projectile aiming problems in video games.
<!--more-->
<script type="text/javascript" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

## The Common "Projectile Aiming" Scenario

The projectile aiming scenario that we will be discussing today is as follows:

- The shooter has the ability to fire their projectile in any direction, but the
  projectile will always be launched at a particular constant speed, $$s$$.
- The target is initially at a particular relative displacement $$d_x$$ from the
  shooter. If the target's initial position is $$t_x$$ and the projectile's
  initial position is $$p_x$$, we can compute $$d_x$$ as $$d_x = t_x - p_x$$.
- The target may or may not be initially moving relative to the shooter at a
  particular relative velocity, $$d_v$$. How we compute $$d_v$$ depends on how
  the projectile behaves.
    - If the projectile inherits the velocity of its launcher, then we compute
      $$d_v$$ using the target's initial velocity $$t_v$$ and the velocity of
      the launcher $$p_v$$, as $$d_v = t_v - p_v$$.
    - If, as in most games, the projectile does not inherit the velocity of the
      launcher, then we remove the projectile component, leaving us with just
      $$d_v = t_v$$.
- Whether due to gravity or a constant acceleration of the target, there may or
  may not be a particular relative acceleration, $$d_a$$. If the target's
  acceleration is $$t_a$$ and the projectile's acceleration due to gravity is
  $$p_a$$, we can compute $$d_a$$ as $$d_a = t_a - p_a$$.
- As a constraint on how we are allowed to hit the target: our projectile cannot
  bounce or richochet. We must land a direct hit.

Our projectile's launch direction, $$n$$, is the main unknown, and it's what we
are attempting to solve for.

We can represent our condition, that the projectile, launched in that direction,
will reach the same position as the target at some future time $$t$$, as:

$$
n s t = d_x + d_v t + \tfrac{1}{2} d_a t^2
$$

Here, $$n s t$$ and $$d_x + d_v t + \tfrac{1}{2} d_a t^2$$ describe the
trajectories of the projectile and the target respectively (in a reference frame
where the projectile does not experience acceleration).

However, this introduces a second unknown, $$t$$, for the time of impact. We
have one equation, but two unknowns, which, at first glance, leaves the problem
underconstrained. However, we have a hidden assumption that can grant us an
additional constraint: our launch direction, $$n$$, must be a unit vector. So,
we have the additional equation:

$$
\lvert n \rvert = 1
$$

With this added constraint, we can transform the problem into a generally
solvable form.

## The General Projectile Quartic

We have our equation that must have solutions for $$n$$ and $$t$$ if it's
possible to actually hit the target.

$$
n s t = \tfrac{1}{2} d_a t^2 + d_v t + d_x
$$

However, we can take a step back here and ask the question: what exactly are
the two sides of this equation? $$n$$ is a vector, and $$s$$ and $$t$$ are
scalars being multiplied against the vector, so the entire $$n s t$$ term is
a vector quantity. In fact, both sides of the equations are vectors. Since both
sides of the equation are vectors, we can take the squared magnitude of both
sides the equation:

$$
\lvert n s t \rvert^2 = \lvert \tfrac{1}{2} d_a t^2 + d_v t + d_x \rvert^2
$$

Let's work through a few steps of simplifying this. We can separate out the
$$s$$ and $$t$$ terms in the lefthand side:

$$
\lvert n \rvert^2 \lvert s \rvert^2 \lvert t \rvert^2 = \lvert \tfrac{1}{2} d_a t^2 + d_v t + d_x \rvert^2
$$

And, since a squared scalar will always be positive, we can remove the absolute
value bars from $$s$$ and $$t$$.

$$
\lvert n \rvert^2 s^2 t^2 = \lvert \tfrac{1}{2} d_a t^2 + d_v t + d_x \rvert^2
$$

To work on the other side of the equation a little, we can resolve the squared
magnitude of a vector into the dot product of the vector against itself:

$$
\lvert n \rvert^2 s^2 t^2 = (\tfrac{1}{2} d_a t^2 + d_v t + d_x) \cdot (\tfrac{1}{2} d_a t^2 + d_v t + d_x)
$$

The dot product distributes over addition, so we can FOIL this out and clean it up a little:

$$
\lvert n \rvert^2 s^2 t^2 = \tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot d_v) t^3 + (d_a \cdot d_x + \lvert d_v \rvert^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2
$$

So far so good. But, we still have two unknowns: $$n$$ and $$t$$. This is where
our second constraint can come into play. We just discussed the constraint that
our direction must be a unit vector:

$$
\lvert n \rvert = 1
$$

We can substitute this into our equation above, which makes our $$n$$ variable
disappear:

$$
s^2 t^2 = \tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot d_v) t^3 + (d_a \cdot d_x + \lvert d_v \rvert^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2
$$

By subtracting the $$s^2 t^2$$ term from both sides, we can get a proper quartic
equation over $$t$$:

$$
\tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot d_v) t^3 + (d_a \cdot d_x + \lvert d_v \rvert^2 - s^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

By solving this quartic, we can solve for the time of the collision, $$t$$. Once
we have calculated the time of collision, we can return to our original equation
to work out the value of $$n$$.

$$
n s t = \tfrac{1}{2} d_a t^2 + d_v t + d_x
$$

All we have to do is divide through by $$s t$$ to isolate $$n$$, and we're done:

$$
n = \tfrac{\tfrac{1}{2} d_a t^2 + d_v t + d_x}{s t}
$$

So, all we have to do is solve a quartic. Quartic equations are well-studied
territory in mathematics, but their solutions are unexpectedly non-trivial. Just
take a look at the absolutely insane ["quartic formula"](https://en.wikipedia.org/wiki/Quartic_equation#/media/File:Quartic_Formula.svg)
that acts as the quartic equivalent to the familiar "quadratic formula" that
everyone learns in algebra class. Computers can churn through these calculations
fairly easily, but both performance and precision can be issues for computers
calculating quartic solutions. Luckily, there are quite a few special cases
where we can drop out of solving the full quartic and solve comparatively
trivial equations instead.

### Aiming with Relative Offset Only (Non-Arcing Projectile, Stationary Target)

The absolute simplest case for aiming is when there is no relative velocity or
relative acceleration at all. This is the case of firing a non-arcing projectile
at a stationary target. In this case, the magnitudes of the $$d_a$$ and $$d_v$$
terms are set to $$0$$:

$$
\tfrac{1}{4} \lvert 0 \rvert^2 t^4 + (0 \cdot 0) t^3 + (0 \cdot d_x + \lvert 0 \rvert^2 - s^2) t^2 + 2 (0 \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

Removing the zero terms leaves us with:

$$
-s^2 t^2 + \lvert d_x \rvert^2 = 0
$$

Then rearranging:

$$
t^2 = \frac{\lvert d_x \rvert^2}{s^2}
$$

And finally taking the square root:

$$
t = \pm \frac{\lvert d_x \rvert}{s}
$$

Here we get two solutions due to the square root. However, the time of impact
must be positive to be valid. Since both $$\lvert d_x \rvert$$ and $$s$$ will
always be positive, the unique valid solution to this equation is:

$$
t = \frac{\lvert d_x \rvert}{s}
$$

This is fairly intuitive. If the target isn't moving and the projectile travels
in a straight line, then the time it will take your projectile to reach them is
just the distance to the target divided by the speed. We could also derive this
without the square root complication from first principles as a basic linear
equation.

But, beyond this, for this simple case, we don't even need to solve for the time
in the first place. If we return to our original equation before we isolated
$$t$$:

$$
n s t = d_x + d_v t + \tfrac{1}{2} d_a t^2
$$

And replace $$d_v$$ and $$d_a$$ with $$0$$ and remove the zero terms:

$$
n s t = d_x
$$

If we compute the magnitude of both sides, we get:

$$
s t = \lvert d_x \rvert
$$

We skip the absolute value bars on the left side since $$s$$ and $$t$$ are
positive by-definition as mentioned previously. If we divide the previous
equation by this one, we get:

$$
n = \frac{d_x}{\lvert d_x \rvert}
$$

So, in this one specific case, the launch direction is actually independent of
the projectile speed and the time of collision. It's just the direction of the
displacement to the target. Or, in other words, you can always hit the target by
just aiming directly at it.

### Aiming with Relative Offset and Velocity Only (Non-Arcing Projectile, Moving Target)

When neither the projectile nor the target are accelerating, we get a simplified
case of firing a non-arcing projectile at a moving target. In this case, the
$$d_a$$ term will be set to $$0$$.

$$
\tfrac{1}{4} \lvert 0 \rvert^2 t^4 + (0 \cdot d_v) t^3 + (0 \cdot d_x + \lvert d_v \rvert^2 - s^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

Removing the zero terms leaves us with:

$$
(\lvert d_v \rvert^2 - s^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

This has substantially simplified the polynomial, from a quartic equation to a
more familiar quadratic equation. From this point, it's best to just plug these
coefficients into your quadratic solver, because writing out the quadratic
formula by hand does not reveal any special opportunities to reduce it to a
simpler form:

$$
t = \frac{-2 (d_v \cdot d_x) \pm \sqrt{4 (d_v \cdot d_x)^2 - 4 (\lvert d_v \rvert^2 - s^2) \lvert d_x \rvert^2}}{2 (\lvert d_v \rvert^2 - s^2)}
$$

We could simplify out the common factor of $$2$$, but nothing else appears to
cancel in a useful way.

The more pressing concerns might be:

- There may not be real solutions to the quadratic.
- If there *are* real solutions, which one should you actually use?

There will be no real solutions to the quadratic when the expression inside the
square root, $$4 (d_v \cdot d_x)^2 - 4 (\lvert d_v \rvert^2 - s^2) \lvert d_x \rvert^2$$,
evaluates to a negative number. In this case, there is no launch direction that
works; the projectile is actually *too slow* to hit the target given the
target's initial distance and how fast it is moving away from the shooter. In a
game, this would be the AI-controlled character's signal that it should probably
change targets.

If there are real solutions, you must use a positive solution. If there are no
positive real solutions, then, again, the projectile is too slow to hit the
target. On the other hand, there may be two positive real solutions in some
cases, such as if the target is on a trajectory that passes by the shooter
rather than running away from the shooter. In this case, you can pick whichever
solution you prefer---the smaller $$t$$ will hit the target before they pass,
and the larger $$t$$ will hit them after they pass.

In general, though, since your aiming calculation is likely operating on a
simplified model of the situation, it is probably best to prefer the smallest
positive solution for $$t$$, as this will minimize the time during which the
real situation can diverge from the predictions of the simplified model.

### Aiming with Relative Offset and Acceleration Only (Arcing Projectile, Stationary Target)

If the target is has no initial velocity but there is still relative
acceleration, then the acceleration forces the equation to remain a quartic, but
we can still simplify the quartic fairly substantially. In this case, the
$$d_v$$ term will be set to $$0$$.

$$
\tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot 0) t^3 + (d_a \cdot d_x + \lvert 0 \rvert^2 - s^2) t^2 + 2 (0 \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

Removing the zero terms leaves us with:

$$
\tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot d_x - s^2) t^2 + \lvert d_x \rvert^2 = 0
$$

The $$t^3$$ and $$t^1$$ terms have dropped out entirely, leaving us with a
[biquadratic equation](https://en.wikipedia.org/wiki/Quartic_function#Biquadratic_equation),
a special case of the quartic that is much easier to solve. To solve a
biquadratic, we can substitute in a new variable $$u = t^2$$:

$$
\tfrac{1}{4} \lvert d_a \rvert^2 u^2 + (d_a \cdot d_x - s^2) u + \lvert d_x \rvert^2 = 0
$$

This leaves us with a new equation that has the shape of a quadratic equation
over $$u$$. As in the previous case, at this point, we can just plug these
coefficients into a quadratic solver. Expanding the quadratic formula manually
does not reveal any special opportunities to simplify:

$$
u = \frac{-(d_a \cdot d_x - s^2) \pm \sqrt{(d_a \cdot d_x - s^2)^2 - \lvert d_a \rvert^2 \lvert d_x \rvert^2}}{\tfrac{1}{2} \lvert d_a \rvert^2}
$$

This will give us two possible values for $$u$$. Each of those two values of
$$u$$ produces two possible values for $$t$$ when we invert our equation
defining $$u$$ above to solve for $$t$$.

$$
t = \pm \sqrt{u}
$$

This gives us four total possible values for $$t$$, which is expected for a
quartic equation. Just as with the previous example, our best best is to pick
the smallest positive real value of $$t$$, and if there are no positive real
values, then there is no possible launch direction that can hit the target;
gravity is dragging the projectile down too quickly for it to cover the distance
given its initial speed.

### Aiming with Relative Offset, Velocity and Acceleration (Arcing Projectile, Moving Target)

In the worst case scenario, we will not be able to reduce the problem to a
special case and will be forced to contend with the entire quartic.

$$
\tfrac{1}{4} \lvert d_a \rvert^2 t^4 + (d_a \cdot d_v) t^3 + (d_a \cdot d_x + \lvert d_v \rvert^2 - s^2) t^2 + 2 (d_v \cdot d_x) t + \lvert d_x \rvert^2 = 0
$$

Solving quadratics is easy, and solving cubics is reasonable, but quartics are
truly unwieldy. Not only is the quartic formula extremely complex, but naive
numerical approximations with floating point numbers tend to be inaccurate
because the degree of the polynomial is so high.

The details of implementing a high-quality quartic solver are beyond the scope
of this post. Wikipedia provides a summary of how to implement a solution based
on [Ferrari's method](https://en.wikipedia.org/wiki/Quartic_equation#Summary_of_Ferrari's_method),
but this method can be numerically unstable with floating point numbers. I've
implemented a quick and dirty quartic solver based on Ferrari's method for the
example code for this post. And, speaking of which...

## Example Code

Math is helpful, but obviously most people are just going to want code they can
plug and play in their own game. To that end, I have put together some example
code in C# implementing all of the cases in this post (and the required
polynomial solutions).

You can take a look at the code in the github repository [here](https://github.com/devinford/projectile_aim_example_code).

This example code includes some basic linear algebra code that I'm using in a
number of my own projects. The full quartic case, as mentioned, uses Ferrari's
method, and just expands the calculation to double-precision to paper over some
of the numerical instability of the calculation. In practice, I've found it to
have good enough accuracy for common scales of values. However, it might not be
accurate or performant enough for more intense applications. If you're going to
be making heavy use of aim calculations, it might be worth looking into some
more robust approaches to solving polynomials. If any of my projects ever reach
the point where an upgraded solver is vital, I'll probably make a follow-up post
going over the available approaches and update the example code for this post.

## Wrapping Up

Projectile aim solving is a useful tool to have in your toolbox for a wider
variety of games than you might think. It's obviously useful for things like
shooting games, but, also for games that don't even include physics. In many RTS
or tower defense-like games, it's predetermined whether or not an attack will
hit at the time it's launched, but you can use aim-solving to make the cosmetic
projectile trajectory look plausible.

The math here should work for these and most other common applications, and
since it's derived in terms of vector operations, the same exact equations will
work in both 2D and 3D.

---

#### Extra: More Special Cases

There are a few additional special cases that actually break down to be even
simpler than the cases described by the quartic.

##### Stationary, Symmetric Arc

In the case where the projectile is affected by gravity, and both the source and
target are stationary at the same height (relative to the direction of gravity),
we can massively simplify our calculation of the launch direction.

Because the source and the target are at the same height within a parabolic arc,
the trajectory of the projectile is perfectly symmetrical. As a result, the
projectile's initial vertical velocity and final vertical velocity will be
inverses. We can express this mathematically as:

$$
s \sin(\theta) + g t = -s \sin(\theta)
$$

Here $$s$$ is the launch speed, $$g$$ is the vertical acceleration due to
gravity, $$t$$ is the time of impact, and $$\theta$$ is the launch angle. Thus,
$$\sin(\theta)$$ is the vertical component of the launch direction (and
$$\cos(\theta)$$ would be the horizontal component of the launch direction).

Here, we're using a launch angle for our calculation, which is different from
all of the derivations in the main body of the post. Because angles only specify
rotations in a 2D plane, it would seem like this would limit the applicability
of this derivation to 2 dimensions. However, the specific constraints of the
problem naturally allow any instance of this problem type in any number of
dimensions to be broken down into a problem in two effective dimensions: the
"vertical" dimension defined by the direction of gravity, and the "horizontal"
dimension, defined by the direction of the displacement to the target.

During the same timeframe, $$t$$, the horizontal component of the velocity,
$$s \cos(\theta)$$ will have covered the entire horizontal distance between the shooter
and the target, which we can call $$d_x$$:

$$
s \cos(\theta) t = d_x
$$

We still have just two unknowns: $$t$$ and now $$\theta$$ instead of $$n$$. We
can start our derivation with the vertical velocity equation:

$$
s \sin(\theta) + g t = -s \sin(\theta)
$$

We'll solve for $$t$$, by subtracting $$s \sin(\theta)$$ from both sides and
dividing both sides by $$g$$:

$$
t = \frac{-2 s \sin(\theta)}{g}
$$

Now, returning to our horizontal distance equation:

$$
s \cos(\theta) t = d_x
$$

Let's substitute the expression we just found for $$t$$ into this equation:

$$
\frac{-2 s^2 \cos(\theta) \sin(\theta)}{g} = d_x
$$

This eliminates $$t$$ from the problem.

And, finally, we'll divide by $$\frac{-s^2}{g}$$ in order to isolate
$$\cos(\theta) \sin(\theta)$$ on one side of the equation:

$$
2 \cos(\theta) \sin(\theta) = \frac{-g d_x}{s^2}
$$

According to the [double angle identity for sine](https://en.wikipedia.org/wiki/List_of_trigonometric_identities#Double-angle_formulae),
$$2 \sin(\theta) \cos(\theta) = \sin(2 \theta)$$. So, we can rewrite this as:

$$
\sin(2 \theta) = \frac{-g d_x}{s^2}
$$

Taking the arc sine:

$$
2 \theta = \arcsin(\frac{-g d_x}{s^2})
$$

And then dividing by $$2$$:

$$
\theta = \frac{\arcsin(\frac{-g d_x}{s^2})}{2}
$$

We end up at an explicit formula for the value of $$\theta$$. As with the cases
in the main body of the post, this formula also has failure states: if the
absolute value of $$\frac{-g d_x}{s^2}$$ is greater than $$1$$, then its arc sine will be a
complex number, and, in this case, there are no valid trajectories.

After solving for $$\theta$$, we can use its sine and cosine to compute the
vertical and horizontal components of the launch direction. Applying sine and
cosine directly to the expression for $$\theta$$ directly:

$$
vertical = \sin(\frac{\arcsin(\frac{-g d_x}{s^2})}{2})
$$

$$
horizontal = \cos(\frac{\arcsin(\frac{-g d_x}{s^2})}{2})
$$

However, this round trip through trigonometric functions is a little ugly.
Luckily, our old friend [Wolfram Alpha](https://www.wolframalpha.com/input?i=sin%28asin%28x%29%2F2%29)
can help us out here:

$$
vertical = \frac{\sqrt{1 - \frac{g d_x}{s^2}} - \sqrt{1 + \frac{g d_x}{s^2}}}{2}
$$

$$
horizontal = \frac{\sqrt{1 - \frac{g d_x}{s^2}} + \sqrt{1 + \frac{g d_x}{s^2}}}{2}
$$

I'm personally still working through how exactly Wolfram Alpha came up with
these expressions (probably something starting from applying the half-angle
identities), but extensive testing seems to validate that they produce the same
results.

In practice, this special case is not likely to be very common because it
requires the source and target to be on exactly level ground, which is not an
assumption that you can easily make in most action games. But, in certain
special cases, such as the cosmetic trajectories of projectiles in strategy
games, this could potentially be a valid approach.

##### "The Monkey and the Hunter"

There's a famous example of a "projectile aiming" problem in physics, apparently
called the ["the Monkey and the Hunter" problem](https://www.animations.physics.unsw.edu.au/jw/monkey_hunter.html).
However, I learned about this in a physics class in high school, so I'll use the
more animal-friendly "Throwing a Monkey a Banana" framing from my high school
class.

There's a monkey hanging stationary from a tree, and you want to throw the
monkey a banana. However, at the moment the banana leaves your hand, the monkey
will get so excited that it will let go of the tree and start accelerating
downwards due to gravity. The question is: what angle should you throw the
banana at in order to ensure that it reaches the monkey?

It might seem like there's a lot of information left out of this problem:

- The initial speed of the banana.
- The amount of acceleration due to gravity.
- The height and distance of the monkey.

However, this problem is actually a special case where you can give a very
direct answer to the question without specifically addressing any of these
factors. The key observation is that both the monkey and the banana are affected
by the same force of gravity for the entire duration of the projectile's travel.
This means that there is no relative acceleration between them.

Additionally, the monkey is initially stationary, so there is no initial
relative velocity between them. When we remove relative acceleration and
relative velocity, this resolves to: firing a non-arcing projectile at a
stationary target, which is the simplest special case that we outlined in the
main body of the post. All we have to do is throw the banana directly at the
monkey, and it is guaranteed to reach it (as long as it travels fast enough to
reach the monkey before it touches the ground).

I've always thought that this would be a neat little special attack for a
character in a show or game---they use some kind of melee attack to launch their
opponent directly upward into the air, and then fire their finishing projectile
attack at the opponent just as they reach the apex of their trajectory,
guaranteed to be perfectly accurate, regardless of all other factors.
