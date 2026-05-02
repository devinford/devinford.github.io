---
layout: page
title: Corner Place
permalink: /browser-games/corner-place/
---

<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Ribeye+Marrow&family=Shizuru&family=Pacifico&display=swap" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/pikaday/1.8.2/css/pikaday.min.css">
<div class="puzzle-selector">
  <label for="puzzle-date-picker">Select a puzzle date:</label>
  <div class="date-input-container">
    <span class="date-arrow" id="left-arrow">←</span>
    <input type="text" id="puzzle-date-picker" placeholder="Click to select date" readonly />
    <span class="date-arrow" id="right-arrow">→</span>
  </div>
</div>

<style>
.mode-buttons {
  display: flex;
  justify-content: center;
}
.mode-button {
  flex-grow: 1;
  border: 2px solid #333;
  background: #f0f0f0;
  color: #333;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0;
  outline: none;
}
.mode-button:first-child {
  border-radius: 8px 0 0 8px;
  border-right: 1px solid #333;
}
.mode-button:last-child {
  border-radius: 0 8px 8px 0;
  border-left: 1px solid #333;
}
.mode-button:not(:first-child):not(:last-child) {
  border-left: 1px solid #333;
  border-right: 1px solid #333;
}
.mode-button:hover {
  background: #e0e0e0;
}
.mode-button.active {
  background: #666;
  color: white;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  transform: translateY(1px);
}
.mode-button.active:hover {
  background: #666;
}
#clear-puzzle:hover {
  background: #c82333 !important;
}
#game-canvas {
  touch-action: none;
}

#canvas-container {
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 800px) {
  #canvas-container {
    width: 80%;
    margin: 0 auto;
  }
}
</style>

<div id="puzzle-title"></div>
<div id="puzzle-description"></div>
<div id="puzzle-prompt"></div>
<div id="timer-display" style="text-align: center; margin: 10px 0; font-size: 18px; font-weight: bold;">00:00</div>

<div id="puzzle-title"></div>
<div>
  <div id="canvas-container">
    <canvas id="game-canvas" style="width: 100%; aspect-ratio: 0.86;"></canvas>
  </div>
  <div class="mode-buttons" style="width: 80%; margin: 0 auto;">
    <button id="mode-write" class="mode-button active">Write</button>
    <button id="mode-note" class="mode-button">Note</button>
  </div>
</div>
<div style="text-align: center; margin: 10px 0;">
  <button id="clear-puzzle" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear Puzzle</button>
</div>

<details>
  <summary><b>How to Play</b></summary>
  <div class="details-content">
    <p>
      A Corner Place puzzle is a 5x5 grid of squares, which are each divided
      into 4 quadrants. The goal is to fill one number from 1-5 into each
      quadrant of each square while obeying three rules:
    </p>
    <ol>
      <li>Each number must appear in each quadrant exactly once in each column.</li>
      <li>Each number must appear in each quadrant exactly once in each row.</li>
      <li>No two squares can share two quadrant numbers in common.</li>
    </ol>
    <p>
      In the example below, we have two squares that both have 1 in their
      northwest corner and both have 4 in their southeast corner.
    </p>
    <img src="/assets/images/corner-place-rule-3.png" style="width: 350px; height: auto;">
    <p>
      In order to place a number into the grid, you simply press on the quadrant
      of square you want to fill, then press the appropriate number button that
      appears. For example, here, we fill in a 2 into a space in the grid:
    </p>
    <img src="/assets/images/corner-place-placement.gif" style="width: 293px; height: auto;">
    <p>
      <i>(If you are playing on PC, you also have the option of pressing the
      corresponding numeric key on your keyboard.)</i>
    </p>
    <p>
      If you fill in a value incorrectly, you can remove it by simply pressing
      the same number again <i>(On PC, you can also use the Delete or Backspace
      keys to clear a value.)</i>
    </p>
    <h3 id="visual-aids">Visual Aids</h3>
    <p>
      There are a few visual aids that have been added to the game to help you
      track the constraints based on quadrants within a row and based on pairs
      of quadrants.
    </p>
    <p>
      As you can see from some of the other examples, each quadrant uses a
      distinctive font. This should make it easier to tell at a glance what
      quadrant a number is in.
    </p>
    <img src="/assets/images/corner-place-fonts.png" style="width: 350px; height: auto;">
    <p>
      To aid in identifying the elements of a single quadrant across a row or
      column, the game automatically highlights the shared quadrants of every
      square in the same row or column whenever you mouse over or press down on
      a quadrant of a square.
    </p>
    <img src="/assets/images/corner-place-hover.gif" style="width: 350px; height: auto;">
    <p>
      You can also see that when hovering directly over an already-filled
      number, that number gets highlihgted in blue, and all instances of the
      same number in the same quadrant are highlighted in blue. This can help in
      determining whether or not that number has been
    </p>
    <p>
      For cross-referencing quadrant pairs across different squares an extra
      "press-and-hold" feature was introduced. This feature can be activated by
      pressing on a quadrant and then dragging to another quadrant in the same
      square.
    </p>
    <img src="/assets/images/corner-place-spread.gif" style="width: 350px; height: auto;">
    <p>
      As you can see, every square that shares the same value in the quadrant
      you dragged to gets highlighted-- both the shared value (in blue), and the
      quadrant corresponding to the one that you initially pressed down on (in
      green, like the rows and columns). This makes it easy to get a visual read
      on what squares can cause a conflict. In this example, 1, 2 and 5 are in
      the same row or column, and the press-and-drag feature reveals a 3 that
      has already been paired with the northeast 1, meaning that 4 is the only
      valid option remaining.
    </p>
    <h3>Tips</h3>
    <p>
      Although there are only three explicit rules of the puzzle, it's possible
      to derive additional rules of thumb that can be used as deduction
      shortcuts.
    </p>
    <ul>
      <li>
        A quadrant of a square must not be filled with a number if:
        <ul>
          <li>The number already appears in the same quadrant in the same row or column.</li>
          <li>Doing so would create a pair of numbers in two quadrants that already appear together in the same quadrants of another square.</li>
        </ul>
        Cross-referencing these two rules can reveal required placements through process of elimination.
      </li>
      <li>
        A quadrant of a square must be filled with a number if:
        <ul>
          <li>The square is the only square missing that quadrant in its row or column in the row, and that number is the only unused number for that quadrant in the row or column.</li>
          <li>That number has already appeared in that quadrant of other squares 4 other times, and this is the only square that doesn't lie in the same row or column as the other instances.</li>
        </ul>
      </li>
      <li>
        Some special case scenarios:
        <ul>
          <li>If a number has already appeared in a particular quadrant three times, then this narrows it down to only four possible locations for the last two instances, and these four locations will lie at the corners of a rectangle. If one of those four locations is already occupied, the two remaining instances must be the two locations that share a row and a column respectively with the occupied space.</li>
        </ul>
      </li>
    </ul>
    <p>
      This is not a full list of deduction shortcuts and you may discover
      additional shortcuts on your own, but these cover most of the basic cases
      that you'll encounter.
    </p>
  </div>
</details>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pikaday/1.8.2/pikaday.min.js"></script>
<script type="module">
  import { apiAttemptPost, apiAttemptCompletionPut, apiAttemptCompletionGet } from '/assets/js/api-attempt.js';

  const apiBaseUrl = "{{ site.puzzle_api_base_url }}";

  const canvas = document.getElementById('game-canvas');
  const context = canvas.getContext('2d');

  const CellBlank = 0;
  const CellOccupied = 1;
  const CellHint = 2;
  const CellHeader = 3;

  // @todo The date field from here is accessed by the boilerplate.
  // I might need to explicitly pull it out and store it in its own field to
  // create a cleaner separation between puzzle-specific logic and boilerplate.
  let puzzleConfiguration;

  let gridHeight = 0;
  let gridWidth = 0;
  let headerLetters = [];

  let gameGrid = [];
  let notes = [];
  let hints = [];

  let selectedQuadrant = null;
  let hoveredSymbol = null;  // {quadrant, symbolIndex, row, col} or null
  let lockedCross = null;    // {quadrant, row, col} or null

  let cachedErrors = new Set();

  // 'write' | 'note'
  let currentMode = 'write';

  let selectedCell = null;
  let dragTarget = null;

  let gameStarted = false;
  let startTime = null;
  let completionTime = null;
  let timerInterval = null;

  let gridOffset = 0;
  let cellSize = 0;

  let theme = null;
  let gridColor = null;
  let chainStyles = null;

  let noteOffset = 0;
  let letterOffset = 0;

  let defaultTheme = null;

  // @@ Puzzle Logic

  function cellStatus(nonHeaderRow, column) {
    const originalLetter = puzzleConfiguration.grid[nonHeaderRow + 1][column];
    if(originalLetter !== ' ' && originalLetter === originalLetter.toUpperCase()) return CellHint;

    return gameGrid[nonHeaderRow][column] === -1 ? CellBlank : CellOccupied;
  }

  function isHintCell(row, column) {
    const originalLetter = puzzleConfiguration.grid[row][column];
    return originalLetter !== ' ' && originalLetter === originalLetter.toUpperCase();
  }

  function isBlankCell(row, column) {
    return gameGrid[row][column] === -1;
  }

  function recalculateCachedErrors() {
    cachedErrors.clear();

    // uniqueness in rows and columns
    for(let q = 0; q < 4; ++q) {
      for(let r = 0; r < 5; ++r) {
        const seen = new Set();
        for(let c = 0; c < 5; ++c) {
          const value = gameGrid[r][c][q];
          if(value !== -1) {
            if(seen.has(value)) {
              for(let c2 = 0; c2 < 5; ++c2) {
                if(gameGrid[r][c2][q] === value) cachedErrors.add(`${r},${c2},${q}`);
              }
            }

            seen.add(value);
          }
        }
      }

      for(let c = 0; c < 5; ++c) {
        const seen = new Set();
        for(let r = 0; r < 5; ++r) {
          const value = gameGrid[r][c][q];
          if(value !== -1) {
            if(seen.has(value)) {
              for(let r2 = 0; r2 < 5; ++r2) {
                if(gameGrid[r2][c][q] === value) cachedErrors.add(`${r2},${c},${q}`);
              }
            }

            seen.add(value);
          }
        }
      }
    }

    // orthogonality
    for(let q1 = 0; q1 < 4; ++q1) {
      for(let q2 = q1 + 1; q2 < 4; ++q2) {
        const pairMap = new Map();

        for(let r = 0; r < 5; ++r) {
          for(let c = 0; c < 5; ++c) {
            const v1 = gameGrid[r][c][q1];
            const v2 = gameGrid[r][c][q2];

            if(v1 !== -1 && v2 !== -1) {
              const key = `${v1},${v2}`;
              if(!pairMap.has(key)) pairMap.set(key, []);

              pairMap.get(key).push({row: r, column: c});
            }
          }
        }
        for(const [, cells] of pairMap) {
          if(cells.length <= 1) continue;

          for(const cell of cells) {
            cachedErrors.add(`${cell.row},${cell.column},${q1}`);
            cachedErrors.add(`${cell.row},${cell.column},${q2}`);
          }
        }
      }
    }
  }

  const quadrantKeys = ['nw', 'ne', 'sw', 'se'];
  const quadrantNames = ['NW', 'NE', 'SW', 'SE'];

  function handleSymbolInput(symbolIndex) {
    if(!selectedQuadrant) return;
    const { row, col, quadrant } = selectedQuadrant;
    if(hints[row][col][quadrant]) return;

    const cell = gameGrid[row][col];
    const qKey = quadrantKeys[quadrant];

    if(currentMode === 'write') {
      if(cell[quadrant] === symbolIndex) {
        cell[quadrant] = -1;
        notes[row][col][qKey].clear();
      } else {
        cell[quadrant] = symbolIndex;
        notes[row][col][qKey].clear();
      }
    } else if(currentMode === 'note') {
      if(cell[quadrant] !== -1) return;
      const noteSet = notes[row][col][qKey];

      if(noteSet.has(symbolIndex)) noteSet.delete(symbolIndex);
      else noteSet.add(symbolIndex);
    }

    saveGameState();

    recalculateCachedErrors();
    if(isPuzzleComplete()) {
      handlePuzzleCompletion();
    }

    drawGame();
  }

  function handleWrite(row, column0, column1) {
    if(isHintCell(row, column0)) return;

    if(!isBlankCell(row, column0)) return;

    if(column0 < 0 || column1 < 0) return;

    gameGrid[row][column0] = column1;
    removeNotes(row, column0, column1);

    saveGameState();
    recalculateCachedErrors();
    drawGame();

    if(isPuzzleComplete()) {
      handlePuzzleCompletion();
    }
  }

  function removeNotes(row, column0, column1) {
    notes[row][column0].clear();
    for(let column = 0; column < gridWidth; ++column) {
      notes[row][column].delete(column1);
    }
    for(let row0 = 0; row0 < gridHeight; ++row0) {
      notes[row0][column0].delete(column1);
    }
  }

  function findBackreferenceColumnIndex(row, column) {
    for(let backreferenceColumn = 0; backreferenceColumn < gridWidth; ++backreferenceColumn) {
      if(gameGrid[row][backreferenceColumn] === column) return backreferenceColumn;
    }
    return -1;
  }

  function columnIndexFromHeaderLetter(letter) {
    return headerLetters.indexOf(letter);
  }

  function clearNotesForPlacement(row, column0, column1) {
    notes[row][column0].clear();
    notes[row][column1].clear();

    for(let column = 0; column < gridWidth; ++column) {
      notes[row][column].delete(column0);
      notes[row][column].delete(column1);
    }

    for(let row = 0; row < gridHeight; ++row) {
      notes[row][column0].delete(column1);
      notes[row][column1].delete(column0);
    }
  }

  function handleNote(row, column0, column1) {
    if(!isBlankCell(row, column0)) return;
    if(isHintCell(row, column0)) return;

    if(column0 >= 0 && column1 >= 0) {
      notes[row][column0].add(column1);
      saveGameState();
    }
  }

  function isPuzzleComplete() {
    for(let r = 0; r < 5; ++r) {
      for(let c = 0; c < 5; ++c) {
        for(let q = 0; q < 4; ++q) {
          if(gameGrid[r][c][q] === -1) return false;
        }
      }
    }

    if(hasRuleViolations()) return false;

    return true;
  }

  function handlePuzzleCompletion() {
    console.log("Puzzle Completed");
    completionTime = Date.now() - startTime;

    const puzzleId = getPuzzleId(puzzleConfiguration);
    setPuzzleCompletion(gameName, puzzleId, true);
    saveGameState();

    timerStop();
    timerUpdateDisplay();

    completionAnimationStart();
    timeAnimationStart();
    if(puzzleScoreToken !== null) {
      apiAttemptCompletionPut(apiBaseUrl, puzzleScoreToken, completionTime, setPuzzleAttemptStats);
    }

    updatePuzzlePrompt();
  }

  function hasRuleViolations() {
    return cachedErrors.size > 0;
  }

  function updatePuzzlePrompt() {
    const puzzlePrompt = document.getElementById('puzzle-prompt');
    if(!puzzlePrompt || !puzzleConfiguration) {
      return;
    }

    const currentPuzzleId = getPuzzleId(puzzleConfiguration);
    const currentPuzzleIsComplete = getPuzzleCompletion(gameName, currentPuzzleId);
    const currentPuzzleIsTutorial = puzzleConfiguration.tutorial === true;
    const tutorialComplete = isTutorialComplete();

    let promptContent = '';
    if(!currentPuzzleIsTutorial && !tutorialComplete) {
      promptContent = puzzleData.text.promptTutorialEnter || '';
    } else if(currentPuzzleIsTutorial && tutorialComplete) {
      promptContent = puzzleData.text.promptTutorialLeave || '';
    } else if(currentPuzzleIsTutorial && !tutorialComplete && currentPuzzleIsComplete) {
      promptContent = puzzleData.text.promptTutorialNext || '';
    }

    puzzlePrompt.innerHTML = promptContent;
  }

  // @@@ Animations

  const CompletionAnimation = 0;
  const TimeAnimation = 1;
  const RankAnimation = 2;

  let animations = [];

  let animationTimerId;
  let animationTimerRunning = false;
  let animationTimerLastTime = null;

  function stopAnimationTimerIfNoneAreRunning() {
    let anyStillRunning = false;
    for(let i = 0; i < animations.length; ++i) {
      if(animations[i].running && animations[i].current < animations[i].duration) {
        anyStillRunning = true;
      }
    }

    if(!anyStillRunning) {
      stopAnimationTimer();
    }
  }

  function stopAnimationTimer() {
    if(animationTimerId) {
      cancelAnimationFrame(animationTimerId);
      animationTimerId = null;
      animationTimerRunning = false;
    }
  }

  function startAnimationTimer() {
    if(animationTimerRunning) return;

    animationTimerLastTime = performance.now();
    animationTimerId = requestAnimationFrame(animationTimerFrame);
    animationTimerRunning = true;
  }

  function animationTimerUpdate(timestamp) {
    const elapsed = timestamp - animationTimerLastTime;
    animationTimerLastTime = performance.now();

    let anyStillRunning = false;
    for(let i = 0; i < animations.length; ++i) {
      if(animations[i].running) {
        animations[i].current = Math.min(animations[i].current + elapsed, animations[i].duration);

        if(animations[i].current < animations[i].duration) {
          anyStillRunning = true;
        }
      }
    }

    return anyStillRunning;
  }

  function animationTimerFrame(timestamp) {
    const anyStillRunning = animationTimerUpdate(timestamp);

    drawGame();

    if(anyStillRunning) {
      animationTimerId = requestAnimationFrame(animationTimerFrame);
    } else {
      stopAnimationTimer();
    }
  }

  // @@@ Completion Animation

  const completionAnimationStripeDuration = 400;
  const completionAnimationTextDelay = 800;
  const completionAnimationTextDuration = 600;
  const completionAnimationTotalDuration = completionAnimationTextDelay + completionAnimationTextDuration;

  animations.push({ duration: completionAnimationTotalDuration, current: 0, running: false, });

  function completionAnimationStop() {
    animations[CompletionAnimation].running = false;
    animations[CompletionAnimation].current = 0;

    stopAnimationTimerIfNoneAreRunning();
  }

  function completionAnimationStart() {
    animations[CompletionAnimation].running = true;
    animations[CompletionAnimation].current = 0;

    startAnimationTimer();
  }

  function completionAnimationInstant() {
    animations[CompletionAnimation].running = true;
    animations[CompletionAnimation].current = animations[CompletionAnimation].duration;
  }

  // @@@ Time Animation

  const TimeAnimationStripeDuration = 400;
  const TimeAnimationTextDelay = 800;
  const TimeAnimationTextDuration = 600;
  const TimeAnimationTotalDuration = TimeAnimationTextDelay + TimeAnimationTextDuration;

  animations.push({ duration: TimeAnimationTotalDuration, current: 0, running: false, });

  function timeAnimationStop() {
    animations[TimeAnimation].running = false;
    animations[TimeAnimation].current = 0;

    stopAnimationTimerIfNoneAreRunning();
  }

  function timeAnimationStart() {
    animations[TimeAnimation].running = true;
    animations[TimeAnimation].current = 0;

    startAnimationTimer();
  }

  function timeAnimationInstant() {
    animations[TimeAnimation].running = true;
    animations[TimeAnimation].current = animations[CompletionAnimation].duration;
  }

  // @@@ Rank Animation

  const RankAnimationStripeDuration = 400;
  const RankAnimationTextDelay = 800;
  const RankAnimationTextDuration = 600;
  const RankAnimationTotalDuration = RankAnimationTextDelay + RankAnimationTextDuration;

  animations.push({ duration: RankAnimationTotalDuration, current: 0, running: false, });

  function rankAnimationStop() {
    animations[RankAnimation].running = false;
    animations[RankAnimation].current = 0;

    stopAnimationTimerIfNoneAreRunning();
  }

  function rankAnimationStart() {
    animations[RankAnimation].running = true;
    animations[RankAnimation].current = 0;

    startAnimationTimer();
  }

  function rankAnimationInstant() {
    animations[RankAnimation].running = true;
    animations[RankAnimation].current = animations[CompletionAnimation].duration;
  }

  // @@@ Timer Interval

  const timerElement = document.getElementById('timer-display');

  function timerStart() {
    startTime = Date.now();
    saveGameState();

    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(timerUpdateDisplay, 1000);
  }

  function timerStop() {
    if(!timerInterval) return;

    clearInterval(timerInterval);
    timerInterval = null;
  }

  function timerUpdateDisplay() {
    if(!gameStarted || !startTime) {
      timerElement.textContent = '00:00';
      return;
    }

    const elapsed = completionTime ?? (Date.now() - startTime);

    timerElement.textContent = formatMillisecondsAsTimerString(elapsed);
  }

  function formatMillisecondsAsTimerString(milliseconds) {
    const fullSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(fullSeconds / 60);
    const seconds = fullSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // @@@ Rendering

  function getDefaultStyleIndexForCell(row, column, theme) {
    if(row == 0) return theme.styleHeader;
    else return theme.styleCell;
  }

  function getStyleIndexForCell(row, column, gridColor, theme) {
    if(gridColor == null || gridColor[row] == null || gridColor[row][column] == null) {
      return getDefaultStyleIndexForCell(row, column, theme);
    }

    return gridColor[row][column];
  }

  function getSymbolForQuadrant(quadrant, index) {
    if(index === -1) return null;
    return theme.axis[quadrant][index];
  }

  function getQuadrantFont(q, size) {
    const quadrantFont = theme.quadrantFonts && theme.quadrantFonts[q];
    if(!quadrantFont) return `bold ${size}px "Roboto Mono", monospace`;
    const style  = quadrantFont.style  || 'normal';
    const weight = quadrantFont.weight || 'normal';
    const family = quadrantFont.family || 'Roboto Mono';
    return `${style} ${weight} ${size}px "${family}", monospace`;
  }

  function getQuadrantPosition(cx, cy, cellSize, quadrant) {
    const halfSize = cellSize / 2;
    if(quadrant === 0) return {x: cx, y: cy, w: halfSize, h: halfSize};
    if(quadrant === 1) return {x: cx + halfSize, y: cy, w: halfSize, h: halfSize};
    if(quadrant === 2) return {x: cx, y: cy + halfSize, w: halfSize, h: halfSize};

    return { x: cx + halfSize, y: cy + halfSize, w: halfSize, h: halfSize, };
  }

  // Computes shared layout for the input UI button row.
  function getButtonLayout() {
    const { padding, gridWidth, cellSize, gridY } = getGridLayout();
    const uiY = gridY + cellSize * 5 + padding;
    const uiHeight = cellSize * 0.72;
    const buttonSize = Math.min(uiHeight * 0.75, gridWidth / 6.5);
    const spacing = buttonSize * 0.15;
    const startX = padding + (gridWidth - (5 * buttonSize + 4 * spacing)) / 2;
    const startY = uiY + uiHeight * 0.35;
    return { startX, startY, buttonSize, spacing };
  }

  // Returns position of the i-th button given a precomputed layout.
  function getButtonPosition(layout, i) {
    return {
      x: layout.startX + i * (layout.buttonSize + layout.spacing),
      y: layout.startY,
      size: layout.buttonSize
    };
  }

  function drawInputUI(x, y, width, height) {
    if(!selectedQuadrant) return;

    const q = selectedQuadrant.quadrant;
    const qKey = quadrantKeys[q];

    // Label showing which quadrant is selected
    context.fillStyle = '#555';
    context.font = `bold ${height * 0.22}px "Roboto Mono", monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(quadrantNames[q], x + width / 2, y + height * 0.04);

    // Draw 5 symbol buttons
    const layout = getButtonLayout();
    for(let i = 0; i < 5; ++i) {
      const button = getButtonPosition(layout, i);

      const isSelected = gameGrid[selectedQuadrant.row][selectedQuadrant.col][q] === i;
      const isNote = notes[selectedQuadrant.row][selectedQuadrant.col][qKey].has(i);

      if(isSelected && currentMode === 'write') {
        context.fillStyle = '#4CAF50';
      } else {
        context.fillStyle = '#e0e0e0';
      }
      context.fillRect(button.x, button.y, button.size, button.size);

      if(isNote && currentMode === 'note') {
        context.strokeStyle = '#333';
        context.lineWidth = 3;
        context.strokeRect(button.x + 2, button.y + 2, button.size - 4, button.size - 4);
      }

      context.fillStyle = '#000';
      context.font = getQuadrantFont(q, button.size * 0.55);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(theme.axis[q][i], button.x + button.size / 2, button.y + button.size / 2);

      context.strokeStyle = '#999';
      context.lineWidth = 1;
      context.strokeRect(button.x, button.y, button.size, button.size);
    }
  }

  function getGridLayout() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const padding = w * 0.04;
    const gridWidth = w - 2 * padding;
    const cellSize = gridWidth / 5;
    return { padding, gridWidth, cellSize, gridX: padding, gridY: padding, };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawGame();
  }

  window.addEventListener('resize', resizeCanvas);

  function drawGrid(x, y, cellSize) {
    context.fillStyle = "#FFFFFF";
    context.fillRect(x, y, cellSize * 5, cellSize * 5);

    const quadrantCenters = (cx, cy) => [
      { x: cx + cellSize * 0.25, y: cy + cellSize * 0.25, },
      { x: cx + cellSize * 0.75, y: cy + cellSize * 0.25, },
      { x: cx + cellSize * 0.25, y: cy + cellSize * 0.75, },
      { x: cx + cellSize * 0.75, y: cy + cellSize * 0.75, },
    ];

    for(let r = 0; r < 5; ++r) {
      for(let c = 0; c < 5; ++c) {
        const cx = x + c * cellSize;
        const cy = y + r * cellSize;

        const cellHasSymbolMatch =
          hoveredSymbol && hoveredSymbol.symbolIndex !== -1 &&
          gameGrid[r][c][hoveredSymbol.quadrant] === hoveredSymbol.symbolIndex
        ;

        // Compute style for each quadrant
        const quadrantStyles = [0, 0, 0, 0];
        for(let q = 0; q < 4; ++q) {
          let styleIndex = theme.styleCell;

          if(
            hoveredSymbol &&
            hoveredSymbol.symbolIndex !== -1 &&
            theme.styleHover !== undefined &&
            gameGrid[r][c][q] === hoveredSymbol.symbolIndex &&
            q === hoveredSymbol.quadrant
          ) {
            styleIndex = theme.styleHover;
          } else if(
            selectedQuadrant &&
            selectedQuadrant.row === r &&
            selectedQuadrant.col === c &&
            selectedQuadrant.quadrant === q
          ) {
            styleIndex = theme.styleHighlight;
          } else if(
            lockedCross &&
            cellHasSymbolMatch &&
            theme.styleCross !== undefined &&
            q === lockedCross.quadrant
          ) {
            styleIndex = theme.styleCross;
          } else if(
            lockedCross &&
            theme.styleCross !== undefined &&
            q === lockedCross.quadrant &&
            (r === lockedCross.row || c === lockedCross.col)
          ) {
            styleIndex = theme.styleCross;
          } else if(
            !lockedCross &&
            hoveredSymbol &&
            theme.styleCross !== undefined &&
            q === hoveredSymbol.quadrant &&
            (r === hoveredSymbol.row || c === hoveredSymbol.col)
          ) {
            styleIndex = theme.styleCross;
          }

          if(cachedErrors.has(`${r},${c},${q}`)) {
            styleIndex = theme.styleError;
          }

          quadrantStyles[q] = styleIndex;
        }

        // Draw quadrant backgrounds
        for(let q = 0; q < 4; ++q) {
          const qPos = getQuadrantPosition(cx, cy, cellSize, q);
          context.fillStyle = theme.style[quadrantStyles[q]].background;
          context.fillRect(qPos.x, qPos.y, qPos.w, qPos.h);
        }

        // Draw quadrant dividers (middle 2/3 of each inner edge segment)
        context.strokeStyle = theme.colorGridline;
        context.lineWidth = 2;
        const centerX = cx + cellSize / 2;
        const centerY = cy + cellSize / 2;
        const halfCell = cellSize / 2;
        const segLen = halfCell * 2 / 3;
        const segStart = halfCell / 6;

        context.beginPath();
        context.moveTo(centerX, cy + segStart);
        context.lineTo(centerX, cy + segStart + segLen);
        context.stroke();

        context.beginPath();
        context.moveTo(centerX, cy + cellSize - segStart - segLen);
        context.lineTo(centerX, cy + cellSize - segStart);
        context.stroke();

        context.beginPath();
        context.moveTo(cx + segStart, centerY);
        context.lineTo(cx + segStart + segLen, centerY);
        context.stroke();

        context.beginPath();
        context.moveTo(cx + cellSize - segStart - segLen, centerY);
        context.lineTo(cx + cellSize - segStart, centerY);
        context.stroke();

        // Draw symbols or notes
        const centers = quadrantCenters(cx, cy);
        for(let q = 0; q < 4; ++q) {
          const val = gameGrid[r][c][q];
          const isHint = hints[r][c][q];
          const pos = centers[q];
          const quadStyle = theme.style[quadrantStyles[q]];

          if(val !== -1) {
            const symbol = getSymbolForQuadrant(q, val);
            context.fillStyle = isHint ? quadStyle.foregroundHint : quadStyle.foregroundAnswer;
            context.font = getQuadrantFont(q, cellSize * 0.4);
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(symbol, pos.x, pos.y);
          } else if(notes[r][c][quadrantKeys[q]].size > 0) {
            drawNotes(notes[r][c][quadrantKeys[q]], pos.x, pos.y, cellSize * 0.4, q, quadStyle);
          }
        }

        // Draw cell border
        context.strokeStyle = theme.colorGridline;
        context.lineWidth = 3;
        context.strokeRect(cx, cy, cellSize, cellSize);
      }
    }
  }

  function drawNotes(noteSet, centerX, centerY, size, quadrant, quadStyle) {
    const positions = [
      { x: centerX - size * 0.3, y: centerY - size * 0.3, },
      { x: centerX + size * 0.3, y: centerY - size * 0.3, },
      { x: centerX, y: centerY, },
      { x: centerX - size * 0.3, y: centerY + size * 0.3, },
      { x: centerX + size * 0.3, y: centerY + size * 0.3, },
    ];

    context.fillStyle = quadStyle.foregroundAnswer;
    context.font = getQuadrantFont(quadrant, size * 0.4);
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    noteSet.forEach(symbolIndex => {
      if(symbolIndex >= 0 && symbolIndex < 5) {
        const symbol = getSymbolForQuadrant(quadrant, symbolIndex);
        context.fillText(symbol, positions[symbolIndex].x, positions[symbolIndex].y);
      }
    });
  }

  function drawGame() {
    if(!puzzleConfiguration || !theme) return;

    const { padding, gridWidth, cellSize, gridX, gridY } = getGridLayout();

    context.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    drawGrid(gridX, gridY, cellSize);

    const uiY = gridY + cellSize * 5 + padding;
    const uiHeight = cellSize * 0.72;
    drawInputUI(gridX, uiY, gridWidth, uiHeight);

    if(animations[CompletionAnimation].running) {
      drawCompletionAnimation();
    }

    if(animations[TimeAnimation].running) {
      drawTimeAnimation();
    }

    if(animations[RankAnimation].running) {
      drawRankAnimation();
    }
  }

  function drawGridLines() {
    context.strokeStyle = puzzleConfiguration['grid-lines'] || '#000000';
    context.lineWidth = 1;

    // Draw vertical lines
    for(let column = 0; column <= gridWidth; ++column) {
      const x = gridOffset + column * cellSize;
      context.beginPath();
      context.moveTo(x, gridOffset);
      context.lineTo(x, gridOffset + gridWidth * cellSize);
      context.stroke();
    }

    // Draw horizontal lines
    for(let row = 0; row <= gridHeight; ++row) {
      const y = gridOffset + row * cellSize;
      context.beginPath();
      context.moveTo(gridOffset, y);
      context.lineTo(gridOffset + gridWidth * cellSize, y);
      context.stroke();
    }
  }

  const completionAnimationTextPuzzle = 'Puzzle';
  const completionAnimationTextComplete = 'Complete!';

  function drawCompletionAnimation() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const stripeColor = theme.colorCompletionStripe;
    const textColor = theme.colorCompletionText;

    const centerY = canvasHeight * 0.2;

    const animationCurrent = animations[CompletionAnimation].current;
    const completionAnimationStripeProgress = Math.min(animationCurrent / completionAnimationStripeDuration, 1);
    const completionAnimationTextProgress = Math.min(Math.max((animationCurrent - completionAnimationTextDelay) / completionAnimationTextDuration, 0), 1);

    if(completionAnimationStripeProgress > 0) {
      const stripeHeight = 60;
      const stripeY = centerY - stripeHeight / 2;

      const stripeX = lerp(canvasWidth, 0, completionAnimationStripeProgress);
      const stripeWidth = canvasWidth - stripeX;

      context.fillStyle = stripeColor;
      context.fillRect(stripeX, stripeY, stripeWidth, stripeHeight);
    }

    if(completionAnimationTextProgress > 0) {
      const centerX = canvasWidth / 2;

      const fontSize = Math.min(48, canvasWidth / 12);
      context.font = `bold ${fontSize}px Arial`;
      context.textBaseline = 'middle';
      context.fillStyle = textColor;
      context.textAlign = 'center';

      const spacing = 20;
      const puzzleTextWidth = context.measureText(completionAnimationTextPuzzle).width;
      const completeTextWidth = context.measureText(completionAnimationTextComplete).width;
      const totalTextWidth = puzzleTextWidth + spacing + completeTextWidth;

      const completionAnimationTextProgressEased = easeOutCubic(completionAnimationTextProgress);

      const puzzleStartX = -puzzleTextWidth;
      const puzzleFinalX = centerX - totalTextWidth / 2 + puzzleTextWidth / 2;
      const puzzleCurrentX = lerp(puzzleStartX, puzzleFinalX, completionAnimationTextProgressEased);
      context.fillText(completionAnimationTextPuzzle, puzzleCurrentX, centerY);

      const completeStartX = canvasWidth + completeTextWidth;
      const completeFinalX = centerX + totalTextWidth / 2 - completeTextWidth / 2;
      const completeCurrentX = lerp(completeStartX, completeFinalX, completionAnimationTextProgressEased);
      context.fillText(completionAnimationTextComplete, completeCurrentX, centerY);
    }
  }

  const timeAnimationTextTime = "Your Time: ";

  function drawTimeAnimation() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const stripeColor = theme.colorCompletionStripe;
    const textColor = theme.colorCompletionText;

    const centerY = canvasHeight * 0.4;

    const animationCurrent = animations[TimeAnimation].current;
    const completionAnimationStripeProgress = Math.min(animationCurrent / completionAnimationStripeDuration, 1);
    const completionAnimationTextProgress = Math.min(Math.max((animationCurrent - completionAnimationTextDelay) / completionAnimationTextDuration, 0), 1);

    if(completionAnimationStripeProgress > 0) {
      const stripeHeight = 60;
      const stripeY = centerY - stripeHeight / 2;

      const stripeX = lerp(canvasWidth, 0, completionAnimationStripeProgress);
      const stripeWidth = canvasWidth - stripeX;

      context.fillStyle = stripeColor;
      context.fillRect(stripeX, stripeY, stripeWidth, stripeHeight);
    }

    if(completionAnimationTextProgress > 0) {
      const scoreText = formatMillisecondsAsTimerString(completionTime);
      const centerX = canvasWidth / 2;

      const fontSize = Math.min(48, canvasWidth / 12);
      context.font = `bold ${fontSize}px Arial`;
      context.textBaseline = 'middle';
      context.fillStyle = textColor;
      context.textAlign = 'center';

      const spacing = 20;
      const puzzleTextWidth = context.measureText(timeAnimationTextTime).width;
      const completeTextWidth = context.measureText(scoreText).width;
      const totalTextWidth = puzzleTextWidth + spacing + completeTextWidth;

      const completionAnimationTextProgressEased = easeOutCubic(completionAnimationTextProgress);

      const puzzleStartX = -puzzleTextWidth;
      const puzzleFinalX = centerX - totalTextWidth / 2 + puzzleTextWidth / 2;
      const puzzleCurrentX = lerp(puzzleStartX, puzzleFinalX, completionAnimationTextProgressEased);
      context.fillText(timeAnimationTextTime, puzzleCurrentX, centerY);

      const completeStartX = canvasWidth + completeTextWidth;
      const completeFinalX = centerX + totalTextWidth / 2 - completeTextWidth / 2;
      const completeCurrentX = lerp(completeStartX, completeFinalX, completionAnimationTextProgressEased);
      context.fillText(scoreText, completeCurrentX, centerY);
    }
  }

  function drawRankAnimation() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const stripeColor = theme.colorCompletionStripe;
    const textColor = theme.colorCompletionText;

    const centerY = [
      canvasHeight * 0.6,
      canvasHeight * 0.8,
    ];

    const textPairs = [
      ["Average: ", formatMillisecondsAsTimerString(puzzleStats.averageScore)],
      ["Rank: ", `${puzzleStats.rank}`],
    ];

    const animationCurrent = animations[RankAnimation].current;
    const completionAnimationStripeProgress = Math.min(animationCurrent / completionAnimationStripeDuration, 1);
    const completionAnimationTextProgress = Math.min(Math.max((animationCurrent - completionAnimationTextDelay) / completionAnimationTextDuration, 0), 1);

    if(completionAnimationStripeProgress > 0) {
      for(let i = 0; i < centerY.length; ++i) {
        const stripeHeight = 60;
        const stripeY = centerY[i] - stripeHeight / 2;

        const stripeX = lerp(canvasWidth, 0, completionAnimationStripeProgress);
        const stripeWidth = canvasWidth - stripeX;

        context.fillStyle = stripeColor;
        context.fillRect(stripeX, stripeY, stripeWidth, stripeHeight);
      }
    }

    if(completionAnimationTextProgress > 0) {
      for(let i = 0; i < textPairs.length; ++i) {
        const centerX = canvasWidth / 2;

        const fontSize = Math.min(48, canvasWidth / 12);
        context.font = `bold ${fontSize}px Arial`;
        context.textBaseline = 'middle';
        context.fillStyle = textColor;
        context.textAlign = 'center';

        const spacing = 20;
        const puzzleTextWidth = context.measureText(textPairs[i][0]).width;
        const completeTextWidth = context.measureText(textPairs[i][1]).width;
        const totalTextWidth = puzzleTextWidth + spacing + completeTextWidth;

        const completionAnimationTextProgressEased = easeOutCubic(completionAnimationTextProgress);

        const puzzleStartX = -puzzleTextWidth;
        const puzzleFinalX = centerX - totalTextWidth / 2 + puzzleTextWidth / 2;
        const puzzleCurrentX = lerp(puzzleStartX, puzzleFinalX, completionAnimationTextProgressEased);
        context.fillText(textPairs[i][0], puzzleCurrentX, centerY[i]);

        const completeStartX = canvasWidth + completeTextWidth;
        const completeFinalX = centerX + totalTextWidth / 2 - completeTextWidth / 2;
        const completeCurrentX = lerp(completeStartX, completeFinalX, completionAnimationTextProgressEased);
        context.fillText(textPairs[i][1], completeCurrentX, centerY[i]);
      }
    }
  }


  // @@@ Event Handlers

  function tryStartGame() {
    if(gameStarted) return;
    gameStarted = true;

    apiAttemptPost(apiBaseUrl, getPuzzleId(puzzleConfiguration), gameApiIdentifier, setPuzzleAttemptToken);

    timerStart();
  }

  function getCellFromCoordinate(x, y) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scaledX = canvasX * scaleX;
    const scaledY = canvasY * scaleY;

    const column = Math.floor((scaledX - gridOffset) / cellSize);
    const row = Math.floor((scaledY - gridOffset) / cellSize);

    if(row >= 0 && row < gridHeight && column >= 0 && column < gridWidth) {
      return { row, column };
    }
    return null;
  }

  function getCellAndQuadrant(mouseX, mouseY) {
    const { gridWidth, cellSize, gridX, gridY } = getGridLayout();
    if(mouseX < gridX || mouseX >= gridX + gridWidth || mouseY < gridY || mouseY >= gridY + cellSize * 5) {
      return null;
    }

    const col = Math.floor((mouseX - gridX) / cellSize);
    const row = Math.floor((mouseY - gridY) / cellSize);
    if(row < 0 || row >= 5 || col < 0 || col >= 5) return null;

    const cellX = mouseX - (gridX + col * cellSize);
    const cellY = mouseY - (gridY + row * cellSize);
    const half = cellSize / 2;
    const quadrant = (cellX < half ? 0 : 1) + (cellY < half ? 0 : 2);

    return { row, col, quadrant, };
  }

  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check grid hover
    const hit = getCellAndQuadrant(mouseX, mouseY);
    if(hit) {
      const symbolIndex = gameGrid[hit.row][hit.col][hit.quadrant];
      if(
        !hoveredSymbol ||
        hoveredSymbol.quadrant !== hit.quadrant ||
        hoveredSymbol.symbolIndex !== symbolIndex ||
        hoveredSymbol.row !== hit.row ||
        hoveredSymbol.col !== hit.col
      ) {
        hoveredSymbol = { quadrant: hit.quadrant, symbolIndex, row: hit.row, col: hit.col };
        drawGame();
      }
      return;
    }

    // Check button hover
    if(selectedQuadrant) {
      const q = selectedQuadrant.quadrant;
      const layout = getButtonLayout();
      for(let i = 0; i < 5; ++i) {
        const button = getButtonPosition(layout, i);
        if(
          mouseX >= button.x &&
          mouseX < button.x + button.size &&
          mouseY >= button.y &&
          mouseY < button.y + button.size
        ) {
          if(
            !hoveredSymbol ||
            hoveredSymbol.quadrant !== q ||
            hoveredSymbol.symbolIndex !== i ||
            hoveredSymbol.row !== -1
          ) {
            hoveredSymbol = { quadrant: q, symbolIndex: i, row: -1, col: -1 };
            drawGame();
          }
          return;
        }
      }
    }

    if(hoveredSymbol) {
      hoveredSymbol = null;
      drawGame();
    }
  }

  function handlePointerUp(e) {
    lockedCross = null;
    drawGame();
  }

  function handlePointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const hit = getCellAndQuadrant(event.clientX - rect.left, event.clientY - rect.top);
    if(hit) {
      lockedCross = { quadrant: hit.quadrant, row: hit.row, col: hit.col, };
      selectedQuadrant = hit;
      tryStartGame();
      drawGame();
    }
  }

  function handleCanvasClick(event) {
    if(completionTime) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if(selectedQuadrant) {
      const layout = getButtonLayout();
      for(let i = 0; i < 5; ++i) {
        const button = getButtonPosition(layout, i);
        if(
          clickX >= button.x &&
          clickX < button.x + button.size &&
          clickY >= button.y &&
          clickY < button.y + button.size
        ) {
          handleSymbolInput(i);
          return;
        }
      }
    }
  }

  function handleKeyPress(event) {
    if(completionTime) return;
    if(event.ctrlKey || event.metaKey || event.altKey) return;

    if(event.key === 'Tab' && selectedQuadrant) {
      const delta = event.shiftKey ? 3 : 1;
      selectedQuadrant = { ...selectedQuadrant, quadrant: (selectedQuadrant.quadrant + delta) % 4 };
      startTimer();
      drawGame();
      event.preventDefault();
      return;
    }

    if(selectedQuadrant) {
      let { row, col, quadrant } = selectedQuadrant;
      let moved = true;

      if(event.key === 'ArrowUp' && row > 0) --row;
      else if(event.key === 'ArrowDown' && row < 4) ++row;
      else if(event.key === 'ArrowLeft' && col > 0) --col;
      else if(event.key === 'ArrowRight' && col < 4) ++col;
      else moved = false;

      if(moved) {
        selectedQuadrant = { row, col, quadrant };
        startTimer();
        drawGame();
        event.preventDefault();
        return;
      }
    }

    if(!selectedQuadrant) return;

    // Digit keys
    if(event.key >= '1' && event.key <= '5') {
      handleSymbolInput(parseInt(event.key) - 1);
      event.preventDefault();
      return;
    }

    // Backspace / Delete
    if(event.key === 'Backspace' || event.key === 'Delete') {
      const { row, col, quadrant } = selectedQuadrant;
      if(!hints[row][col][quadrant] && gameGrid[row][col][quadrant] !== -1) {
        gameGrid[row][col][quadrant] = -1;
        notes[row][col][quadrantKeys[quadrant]].clear();
        recalculateCachedErrors();
        saveGameState();
        drawGame();
      }
      event.preventDefault();
    }
  }

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('click', handleCanvasClick);
  document.addEventListener('keydown', handleKeyPress);
  canvas.addEventListener('mouseleave', () => {
    hoveredSymbol = null;
    lockedCross = null;
    drawGame();
  });

  window.addEventListener('resize', () => {
    if(gridWidth > 0) {
      resizeCanvas();
      drawGame();
    }
  });

  function setupModeButtons() {
    const modeButtons = {
      'mode-write': 'write',
      'mode-note': 'note'
    };

    Object.entries(modeButtons).forEach(([buttonId, mode]) => {
      const button = document.getElementById(buttonId);
      button.addEventListener('click', () => setMode(mode));
    });
  }

  function setMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-button').forEach(button => button.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
  }

  function setupClearButton() {
    document.getElementById('clear-puzzle').addEventListener('click', () => {
      if(confirm('Are you sure you want to clear this puzzle? This will reset all progress.')) {
        clearPuzzleState();
      }
    });
  }

  function clearPuzzleState() {
    if(!puzzleConfiguration) return;
    const puzzleId = getPuzzleId(puzzleConfiguration);
    clearPuzzleStateForPuzzleId(puzzleId);
  }

  // @@ Game State Serialization

  const saveVersion1 = '1';
  const saveVersionCurrent = saveVersion1;

  function saveGameState() {
    saveGameStateV1();
  }

  function saveGameStateV1() {
    const state = {
      version: saveVersionCurrent,
      grid: gameGrid,
      notes: notes.map(row => row.map(cell => ({
        nw: Array.from(cell.nw),
        ne: Array.from(cell.ne),
        sw: Array.from(cell.sw),
        se: Array.from(cell.se)
      }))),
      startTime: startTime,
      gameStarted: gameStarted,
      completionTime: completionTime,
      puzzleScoreToken: puzzleScoreToken
    };
    const puzzleId = getPuzzleId(puzzleConfiguration);
    setPuzzleState(gameName, puzzleId, state);
  }

  function loadGameState() {
    const puzzleId = getPuzzleId(puzzleConfiguration);
    const puzzleState = getPuzzleState(gameName, puzzleId);

    if(puzzleState) {
      switch(puzzleState.version) {
        case saveVersion1: {
          return loadGameStateV1(puzzleState);
        }
        default: {
          console.error(`Unknown puzzle save version ${JSON.stringify(puzzleState.version)}; reverting puzzle to initial state.`);
          return false;
        }
      }
    }
  }

  function loadGameStateV1(puzzleState) {
    if(!puzzleState.grid || !puzzleState.notes) return false;

    gameGrid = puzzleState.grid;
    notes = puzzleState.notes.map(
      row => row.map(
        cell => ({
          nw: new Set(cell.nw),
          ne: new Set(cell.ne),
          sw: new Set(cell.sw),
          se: new Set(cell.se),
        })
      )
    );

    if(puzzleState.startTime) {
      startTime = puzzleState.startTime;
      gameStarted = true;
    }

    if(puzzleState.completionTime) {
      completionTime = puzzleState.completionTime;
      // @todo Maybe pull out side-effects.
      completionAnimationInstant();
      timeAnimationInstant();
    } else {
      // @todo Maybe pull out side-effects.
      timerInterval = setInterval(timerUpdateDisplay, 1000);
      completionTime = null;
    }

    if(puzzleState.puzzleScoreToken) {
      puzzleScoreToken = puzzleState.puzzleScoreToken;
      if(puzzleState.completionTime) {
        // @todo Maybe pull out side-effects.
        apiAttemptCompletionGet(apiBaseUrl, puzzleScoreToken, setPuzzleAttemptStats);
      }
    } else {
      // @todo Maybe trigger automatic registration of existing attempts (for older or offline attempts)
      puzzleScoreToken = null;
    }

    return true;
  }

  function initializeHints() {
    hints = [];
    for(let r = 0; r < 5; ++r) {
      hints[r] = [];
      for(let c = 0; c < 5; ++c) {
        const cell = puzzleConfiguration.grid[r][c];
        hints[r][c] = [false, false, false, false];

        for(let q = 0; q < 4; ++q) {
          const symbol = cell[q];
          hints[r][c][q] = symbol !== -1;
        }
      }
    }
  }

  function initializeStartingGameState() {
    gameGrid = [];
    notes = [];
    for(let r = 0; r < 5; ++r) {
      gameGrid[r] = [];
      notes[r] = [];
      for(let c = 0; c < 5; ++c) {
        const cell = puzzleConfiguration.grid[r][c];
        gameGrid[r][c] = [-1, -1, -1, -1];
        notes[r][c] = {nw: new Set(), ne: new Set(), sw: new Set(), se: new Set()};

        for(let q = 0; q < 4; ++q) {
          const symbol = cell[q];
          gameGrid[r][c][q] = symbol;
        }
      }
    }
  }

  // @@ Called From Boilerplate

  function initializePuzzle(config) {
    puzzleConfiguration = config;

    timerStop();
    completionAnimationStop();
    timeAnimationStop();
    rankAnimationStop();
    gameStarted = false;
    startTime = null;
    completionTime = null;
    puzzleScoreToken = null;
    puzzleStats = null;

    theme = config.theme ? { ...defaultTheme, ...config.theme } : defaultTheme;
    gridColor = config.gridColor;
    chainStyles = theme.chain;

    headerLetters = config.grid[0];
    gridWidth = headerLetters.length;
    gridHeight = config.grid.length;

    selectedQuadrant = null;
    initializeHints();

    if(!loadGameState()) {
      initializeStartingGameState();
    }

    recalculateCachedErrors();
    timerUpdateDisplay();
    updatePuzzlePrompt();

    // @extract This probably should not happen here
    resizeCanvas();
    drawGame();
  }

  function initializeGamePlayer() {
    setupModeButtons();
    setupClearButton();
  }

  const gameName = 'corner-place';
  const gameApiIdentifier = gameName + '{{ site.environment_suffix }}';

  const tags = [];

  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');
  const pickerField = document.getElementById('puzzle-date-picker');

  let puzzleScoreToken = null;
  let puzzleStats = null;

  function setPuzzleAttemptToken(puzzleName, puzzleToken) {
    if(puzzleName === getPuzzleId(puzzleConfiguration)) {
      // @todo Known bug: if the user begins a puzzle and then swaps away BEFORE the response with their puzzle token returns,
      // then their puzzle token will not be written to their saved puzzle state in local storage; this will result in a
      // puzzle state that will not receive a score.
      // Fixing this in an absolute way may be a little complex, since we would need to associate each puzzle token request
      // with a particular instance of a puzzle attempt. Probably, given the time window, it would be safe to just patch the whatever
      // puzzle token comes back into whatever attempt currently exists for that puzzle in local storage, since a user would not
      // be able to create multiple meaningfully different attempts for the same puzzle in a fraction of a second.
      puzzleScoreToken = puzzleToken;
      saveGameState();
    }
  }

  function setPuzzleAttemptStats(stats) {
    if(stats.puzzleName === getPuzzleId(puzzleConfiguration)) {
      puzzleStats = stats;

      rankAnimationStart();
    }
  }

  // @@ Boilerplate

  let puzzleData;
  let puzzles = [];

  let minPuzzleIndex;
  let maxPuzzleIndex;
  let currentPuzzleIndex;

  let picker;

  // @@@ Local Storage

  function clearPuzzleStateForPuzzleId(puzzleId) {
    localStorage.removeItem(`${gameName}-${puzzleId}-state`);
    localStorage.removeItem(`${gameName}-${puzzleId}-completed`);

    initializePuzzle(puzzleConfiguration);
  }

  function setPuzzleCompletion(gameName, puzzleId, complete) {
    return localStorage.setItem(`${gameName}-${puzzleId}-completed`, complete.toString());
  }

  function getPuzzleCompletion(gameName, puzzleId) {
    return localStorage.getItem(`${gameName}-${puzzleId}-completed`) === 'true';
  }

  function setPuzzleState(gameName, puzzleId, state) {
    return localStorage.setItem(`${gameName}-${puzzleId}-state`, JSON.stringify(state));
  }

  function getPuzzleState(gameName, puzzleId) {
    const stateData = localStorage.getItem(`${gameName}-${puzzleId}-state`);
    return stateData ? JSON.parse(stateData) : null;
  }

  function isTutorialComplete() {
    for(let i = 0; i < puzzles.length; ++i) {
      if(!puzzles[i].tutorial) continue;

      const puzzleId = getPuzzleId(puzzles[i]);
      if(!getPuzzleCompletion(gameName, puzzleId)) return false;
    }

    return true;
  }

  // @@@ Animation Helpers

  function easeOutCubic(x) {
    const oneMinusX = 1 - x;
    return 1 - oneMinusX * oneMinusX * oneMinusX;
  }

  function lerp(a, b, t) {
    return a + t * (b - a);
  }

  // @@@ Date Formatting Helpers

  function dateFormat(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateParse(dateText) {
    const [year, month, day] = dateText.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function dateCompareAscending(date0, date1) {
    if(date0 > date1) return 1;
    else if(date0 < date1) return -1;
    else return 0;
  }

  // @@@ UI Initialization

  function initializeDatePicker() {
    minPuzzleIndex = 0;
    maxPuzzleIndex = puzzles.length - 1;
    while(maxPuzzleIndex >= 0 && puzzles[maxPuzzleIndex].date > currentDate) {
      --maxPuzzleIndex;
    }

    const minDate = dateParse(puzzles[minPuzzleIndex].date);
    const maxDate = maxPuzzleIndex >= 0 ? dateParse(puzzles[maxPuzzleIndex].date) : null;
    picker = new Pikaday({
      field: pickerField,
      minDate: minDate,
      maxDate: maxDate,
      disableDayFn: function(date) {
        return !dateHasPuzzle(date);
      },
      format: 'YYYY-MM-DD',
      defaultDate: maxDate,
      keyboardInput: false,
      onSelect: function(date) {
        const dateText = dateFormat(date);
        if(!puzzleConfiguration || puzzleConfiguration.date !== dateText) {
          const puzzleIndex = findPuzzleIndexForDate(dateText);
          if(puzzleIndex >= 0) {
            setPuzzleIndex(puzzleIndex);
          }
        }
      }
    });
  }

  function recalculateDateRange() {
    minPuzzleIndex = 0;
    maxPuzzleIndex = puzzles.length - 1;
    while(maxPuzzleIndex >= 0 && puzzles[maxPuzzleIndex].date > currentDate) {
      --maxPuzzleIndex;
    }

    const minDate = dateParse(puzzles[minPuzzleIndex].date);
    const maxDate = maxPuzzleIndex >= 0 ? dateParse(puzzles[maxPuzzleIndex].date) : null;

    picker.minDate = minDate;
    picker.maxDate = maxDate;
  }

  function setArrowVisibility() {
    leftArrow.style.visibility = (minPuzzleIndex < maxPuzzleIndex && currentPuzzleIndex > minPuzzleIndex) ? 'visible' : 'hidden';
    rightArrow.style.visibility = (minPuzzleIndex < maxPuzzleIndex && currentPuzzleIndex < maxPuzzleIndex) ? 'visible' : 'hidden';
  }

  // @@@ Puzzle Selection

  function getPuzzleId(puzzle) {
    return puzzle.id || puzzle.date;
  }

  function findPuzzleIndexForHash(hashContent) {
    let exactMatchPuzzleIndex = null;
    let firstMatchingIncompletePuzzleIndex = null;
    let lastMatchingPuzzleIndex = -1;
    for(let i = 0; i < puzzles.length; ++i) {
      if(puzzles[i].date > currentDate) continue;
      const puzzleId = getPuzzleId(puzzles[i]);

      if(puzzleId == hashContent) {
        exactMatchPuzzleIndex = i;
        break;
      }

      if(!puzzleId.startsWith(hashContent)) continue;

      lastMatchingPuzzleIndex = i;
      if(!getPuzzleCompletion(gameName, puzzleId) && firstMatchingIncompletePuzzleIndex == null) firstMatchingIncompletePuzzleIndex = i;
    }

    return exactMatchPuzzleIndex ?? firstMatchingIncompletePuzzleIndex ?? lastMatchingPuzzleIndex;
  }

  function findPuzzleIndexForDate(dateText) {
    let lastPuzzleIndexForDate = -1;
    for(let i = 0; i < puzzles.length; ++i) {
      if(puzzles[i].date !== dateText) continue;

      const puzzleId = getPuzzleId(puzzles[i]);
      if(!getPuzzleCompletion(gameName, puzzleId)) return i;

      lastPuzzleIndexForDate = i;
    }

    return lastPuzzleIndexForDate;
  }

  function dateHasPuzzle(date) {
    const dateText = dateFormat(date);
    return puzzles.some(puzzle => puzzle.date === dateText) && dateText <= currentDate;
  }

  // @@@ Puzzle Navigation

  function setPuzzleIndex(puzzleIndex) {
    if(puzzleIndex === currentPuzzleIndex) return;
    if(puzzles[puzzleIndex].date > currentDate) return;

    currentPuzzleIndex = puzzleIndex;
    setArrowVisibility();

    puzzleConfiguration = puzzles[currentPuzzleIndex];

    if(currentPuzzleIndex === maxPuzzleIndex) {
      history.replaceState("", document.title, window.location.pathname + window.location.search);
    } else {
      const puzzleId = getPuzzleId(puzzleConfiguration);
      const puzzleHash = `#${puzzleId}`;
      if(window.location.hash !== puzzleHash) {
        window.location.replace(puzzleHash);
      }
    }
    picker.setDate(dateParse(puzzleConfiguration.date));

    // @todo It may make sense to pull this out of the boilerplate,
    // or to pull the puzzle prompts in here, as they are very similar.
    const titleParts = ["<h3>"];
    if(puzzleConfiguration.date) titleParts.push(`[${puzzleConfiguration.date}]`);
    if(puzzleConfiguration.number != null && puzzleConfiguration.number > 0) {
      if(titleParts.length > 1) titleParts.push(" ");
      titleParts.push(`#${puzzleConfiguration.number}`);
    }
    if(puzzleConfiguration.title) {
      if(titleParts.length > 1) titleParts.push(" - ");
      titleParts.push(puzzleConfiguration.title);
    }
    titleParts.push("</h3>");

    const puzzleTitle = document.getElementById('puzzle-title');
    puzzleTitle.innerHTML = titleParts.join("");

    const puzzleDescription = document.getElementById('puzzle-description');
    puzzleDescription.innerHTML = puzzleConfiguration.description || '';

    initializePuzzle(puzzleConfiguration);
  }

  function moveToPreviousPuzzle() {
    if(currentPuzzleIndex != null && currentPuzzleIndex > 0) {
      setPuzzleIndex(currentPuzzleIndex - 1);
    }
  }

  function moveToNextPuzzle() {
    if(currentPuzzleIndex != null && currentPuzzleIndex < maxPuzzleIndex) {
      setPuzzleIndex(currentPuzzleIndex + 1);
    }
  }

  function setPuzzleFromHash(fullUrlHash) {
    if(puzzles.length == 0) return;

    if(fullUrlHash == '#latest' || fullUrlHash == '#today') {
      if(currentPuzzleIndex != maxPuzzleIndex) setPuzzleIndex(maxPuzzleIndex);
    } else if(fullUrlHash == '#next') {
      moveToNextPuzzle();
    } else if(fullUrlHash == '#previous') {
      moveToPreviousPuzzle();
    } else {
      let puzzleIndex;
      if(fullUrlHash && fullUrlHash.length > 1) {
        const hashContent = fullUrlHash.substring(1);
        puzzleIndex = findPuzzleIndexForHash(hashContent);
      }
      puzzleIndex ??= maxPuzzleIndex;

      if(puzzleIndex >= 0) setPuzzleIndex(puzzleIndex);
      else setArrowVisibility();
    }
  }

  // @@@ Run All Initialization Logic

  initializeGamePlayer();

  let currentDate = dateFormat(new Date());

  leftArrow.addEventListener('click', moveToPreviousPuzzle);
  rightArrow.addEventListener('click', moveToNextPuzzle);

  window.addEventListener('hashchange', function() {
    setPuzzleFromHash(window.location.hash);
  });

  const cacheBuster = "{{ site.time | date: '%s' }}";
  const puzzleFilePath = `../../assets/json/${gameName}.json`;
  const files = [`${puzzleFilePath}?v=${cacheBuster}`];
  Promise.all(
    [
      document.fonts.load('400 1em "Roboto Mono"'),
      document.fonts.load('700 1em "Roboto Mono"'),
      document.fonts.load('1em "Ribeye Marrow"'),
      document.fonts.load('1em "Shizuru"'),
      document.fonts.load('1em "Pacifico"'),
      ...files.map(file =>
        fetch(file)
          .then(response => response.json())
      )
    ]
  )
  .then(allData => {
    puzzleData = allData[5];

    for(let i = 6; i < allData.length; ++i) {
      puzzleData.puzzle.push(...allData[i].puzzle);
    }

    defaultTheme = puzzleData.theme;
    puzzles = puzzleData.puzzle;
    puzzles.sort((a, b) => dateCompareAscending(a.date, b.date));
    initializeDatePicker();

    setPuzzleFromHash(window.location.hash);
  })
  .catch(error => console.error('Error:', error));
</script>
