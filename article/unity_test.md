---
layout: default
title: "Dev Info R&D: 1K RTS"
---

# 1K RTS

## What is a 1K Prototype?

A "1K prototype" is a prototype of a game written in less than 1000 lines of fairly casual code, with a fairly informal plan for its features, and very basic art assets without animation-- just enough to make what's happening visible. It's kind of like a game jam, but you compress space instead of time, and it's an easier sort of thing to motivate yourself to do solo without an event backing it up. Building such a prototype generally requires relying on some engine or framework, or some existing personal codebase, to supply some basic rendering APIs that the prototype will be built on top of. 1000 lines of code doesn't sound like much; however, there seem to be very few genres that require much more than 1000 lines of code to effectively prototype. Most modern game genres are designed to be data driven, so the core update loops are relatively simple. The hardest games to squeeze into these constraints are games that are dependent on (even simple) AI or complex UI state machines.

The goal of a 1K prototype is not to serve as an example of how a professionally-made game *should* be programmed, or even to serve as the starting point to extend into a more complex codebase (although you could if you wanted). Instead, the objective is moreso to write such a prototype yourself in order to gain some perspective on the actual complexity of implementing a game. As it turns out, you can squeeze about 80% of the core appeal of a game into around 5% of the codebase. It's easy for this perspective to be lost when working on a protracted project, where efforts have shifted more towards invisible "engine work", where no amount of code changes seem to push the project forward at all.

The 1K number essentially serves as a guideline that naturally reduces scope creep and eliminates the possibility of excessive engine work. But the exact number isn't that important, so if you go a little bit over, you don't have to stress out about it.

Certain otherwise bad practices can be useful for reducing code count and building 1k prototypes more quickly. These include:

- Having overly-general base classes, to facilitate homogenous update loops, and pushing as much functionality as possible into this base class, even if that functionality is not used by most subclasses.
- Using conditional toggles to control the behavior of state machines, rather than just making more states, because different states will usually redundantly copy at least some parts of their functionality.

## A 1K Real-Time Strategy


### Defining Units

One approach to creating multiple units would be to define a base "Unit" class, and define multiple subclasses specializing the behavior of the units. However, defining lots of subclasses with different behaviors would take up a lot of space, so, instead, I took the approach of differentiating units only by stats. In fact, not just units, but both units and buildings are all instances of the same class, with differing stats controlling their behaviors.

This single general-purpose unit class has commands for path-finding and includes logic for automatically firing at nearby enemy units. There is also some specialized logic that is turned on by certain stats

- Units can be commanded to enter a mining mode if they have a mining capacity greater than 0.
- Units can be clicked to open a build menu if they have build options populated.
- Units can only be selected for commands if they have a movement speed greater than 0; units with a movement speed of 0 are considered buildings-- for example, turrets are effectively just regular combat units with a speed of 0.

This is where implementation of a game can inspire gameplay ideas-- for instance, this codebase makes it possible to create a mobile barracks unit that can spawn other units on-demand, or some sort of engineer who can build buildings at any location. I haven't explored any of those ideas in this prototype for the sake of keeping things simple

### Path-Finding



These sorts of heuristic-based search algorithms generally use a [priority queue](https://en.wikipedia.org/wiki/Priority_queue). Unfortunately, the version of C# used in Unity currently doesn't include a priority queue in its standard library. Writing a priority queue from scratch is kind of annoying ([I've done it already anyways](todo), but...), but the bigger issue is that a proper priority queue implementation is going to take up a lot of our line count, and moreover, it's going to take up a lot of the time that we would prefer to spend on just quickly implementing the RTS's gameplay.

So, instead, I subsituted list with sorted insertions, which is a fairly naive implementation of a priority queue. However, this approach can't necessarily be written off simply for being naive. In the case of this RTS, you are performing an A* search through a grid with very few obstructions. This means that the nearest neighbors of the current search node are guaranteed to be among the most promising remaining nodes. As long as our sort order places the most-promising nodes at the end of our sorted list, insertion becomes essentially constant-time in all but the most degenerate cases where players specifically lay out buildings in a maze-like structure to confuse the path-finding algorithm. This is as-opposed to a more "proper" heap-based priority queue, which will have logarithmic insertion time for our more common scenario.

### UI


#### Build Menu

#### Tutorializing

The first response I got when showing this prototype to someone is that they didn't really understand how to play. So, the final touch

### Final Code Count



## Clone It

The full Unity project for this game can be found on github [here](todo).

## Play It

{% include player_unity.html title="1K RTS" identifier="rts_webgl" aspect_width=600 aspect_height=960 %}
