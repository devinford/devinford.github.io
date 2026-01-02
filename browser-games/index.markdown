---
layout: page
title: Browser Games
permalink: /browser-games/
---

This is a collection of simple games playable directly in the browser.

## Daily Puzzles

These are puzzle games that will be updated with new puzzles daily. Games may go
on hiatus and stop getting new puzzles during various periods as I get busy with
other things, but the entire history of daily puzzles for each game will remain
available.

- [Triple Place](triple-place/) (<span class="puzzle-status" data-puzzle-file="../assets/json/triple-place.json">Loading...</span>) - A puzzle game where letters must be put into three-element loops in each row.
- [Pair Place](pair-place/) (<span class="puzzle-status" data-puzzle-file="../assets/json/pair-place.json">Loading...</span>) - A puzzle game where letters must be unique paired up in each row.

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const cacheBuster = "{{ site.time | date: '%s' }}";

    const puzzleElements = document.querySelectorAll('.puzzle-status');
    puzzleElements.forEach(async (element) => {
      const puzzleFilePath = element.dataset.puzzleFile;
      try {
        const response = await fetch(`${puzzleFilePath}?v=${cacheBuster}`);
        const puzzles = (await response.json()).puzzle;

        const sortedPuzzles = puzzles.sort((a, b) => new Date(a.date) - new Date(b.date));
        const latestDate = sortedPuzzles[sortedPuzzles.length - 1]?.date;
        const currentOrNextDate = sortedPuzzles.find(puzzle => puzzle.date >= today)?.date;

        if (!latestDate) {
          element.textContent = 'Hiatus';
          element.className = 'puzzle-status status-hiatus';
        } else if (latestDate < today) {
          element.textContent = `Hiatus since ${latestDate}`;
          element.className = 'puzzle-status status-hiatus';
        } else if (currentOrNextDate === today) {
          element.textContent = 'New Puzzle Today';
          element.className = 'puzzle-status status-updated';
        } else {
          element.textContent = `Upcoming on ${currentOrNextDate}`;
          element.className = 'puzzle-status status-upcoming';
        }
      } catch (error) {
        element.textContent = 'Hiatus';
        element.className = 'puzzle-status status-hiatus';
        console.log(error);
      }
    });
  });
  </script>
