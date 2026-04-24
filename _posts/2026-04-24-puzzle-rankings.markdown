---
layout: post
title: "Puzzle Rankings"
date: "2026-04-24 11:00:00 -0400"
categories: post
tags: game_development
excerpt_separator: <!--more-->
---

The site currently has a few daily puzzle games running-- [Pair Place](/browser-games/pair-place/)
and [Triple Place](/browser-games/triple-place/). Today, I'm introducing a
ranking server that will let you see how well you performed compared to other
players on each daily puzzle.
<!--more-->

## What's Changed

After completing a puzzle, you will see a new addition to the puzzle completion
animation. Your completion time, the completion average time for the puzzle, and
the overall ranking of your attempt will now appear. If you later return to the
page and refresh, the average completion time and your ranking will update if
other players have completed the puzzle since.

You will not retroactively receive rankings for existing completions of existing
puzzles; however, if you return to an old puzzle and complete it now, after the
ranking server is in place, you will now receive a ranking for new completions
of older puzzles.

## Implementation

The server is implemented as a simple [ASP.NET](https://en.wikipedia.org/wiki/ASP.NET)
API server. Each attempt at a puzzle is associated with an anonymous token that
is generated on the server, and stored in the user's local storage in their
browser. This per-attempt token allows a user to retrieve the ranking of their
puzzle attempt without needing to create an account or anything like that. But
there are some downsides compared to requiring an account.

If you clear your browser history or switch computers, you lose your scores, and
there are very limited means available to prevent cheating (since I cannot
detect when a single player is attempting the same puzzle multiple times).
However, at the scale that this project is operating at, these seem unlikely to
be important problems.

That ASP.NET server is running on a small [Amazon EC2](https://en.wikipedia.org/wiki/Amazon_Elastic_Compute_Cloud)
instance that costs around $20 a month. The instance is almost certainly bigger
than is necessary for the amount of traffic these puzzle games are likely to
ever receive, but I plan to have additional projects share the same instance in
the future.

## Wrapping Up

This is a pretty simple update. If you'd like to try out the puzzles to see what
kind of rank you'll get, you can try playing the daily puzzle games [here](/browser-games/#daily-puzzles).
