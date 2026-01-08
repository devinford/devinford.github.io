---
layout: page
title: Triple Place
permalink: /browser-games/triple-place/
---

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
    <canvas id="game-canvas" style="width: 100%; aspect-ratio: 1;"></canvas>
  </div>
  <div class="mode-buttons" style="width: 80%; margin: 0 auto;">
    <button id="mode-write" class="mode-button active">Write</button>
    <button id="mode-erase" class="mode-button">Erase</button>
    <button id="mode-note" class="mode-button">Note</button>
    <button id="mode-note-erase" class="mode-button">Note Erase</button>
  </div>
</div>
<div style="text-align: center; margin: 10px 0;">
  <button id="clear-puzzle" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear Puzzle</button>
</div>

<details>
  <summary><b>How to Play</b></summary>
  <div class="details-content">
    <p>
      In Triple Place, you must fill the entire grid with letters while
      following two conditions:
    </p>
    <ol>
      <li>Each letter must appear at most once in each column.</li>
      <li>The letters in each row must be grouped into "triples", groups of 3 squares that contain one another's header letters in a cycle, as follows:</li>
    </ol>
    <img src="/assets/images/triple.png" style="width: 293px; height: auto;">
    <p>
      To place letters in the grid, press on the square you want to fill, then
      drag to the column of the letter that you want to fill into that square.
    </p>
    <img src="/assets/images/triple-place-drag-1.gif" style="width: 350px; height: auto;">
    <p>
      For convenience, once you fill in the second letter in a chain, the third
      letter will also be filled in to automatically complete the triple, since
      there will only be one way to complete it.
    </p>
    <img src="/assets/images/triple-place-drag-2.gif" style="width: 350px; height: auto;">
  </div>
</details>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pikaday/1.8.2/pikaday.min.js"></script>
<script>
  "use strict";

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

  let cachedErrors = new Set();

  // 'write' | 'erase' | 'note' | 'note-erase'
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

  let completionAnimationActive = false;
  let completionAnimationStripeProgress = 0;
  let completionAnimationTextProgress = 0;
  let completionAnimationAnimationId = null;
  let completionAnimationStartTime = null;

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

    // Check for duplicates in columns
    for(let column = 0; column < gridWidth; ++column) {
      const columnIndexPositions = new Map();

      for(let row = 0; row < gridHeight; ++row) {
        const columnIndex = gameGrid[row][column];
        if(columnIndex >= 0) {
          if(!columnIndexPositions.has(columnIndex)) {
            columnIndexPositions.set(columnIndex, []);
          }
          columnIndexPositions.get(columnIndex).push(row);
        }
      }

      // Mark all duplicates as errors
      for(const positions of columnIndexPositions.values()) {
        if(positions.length > 1) {
          positions.forEach(row => {
            cachedErrors.add(`${row},${column}`);
          });
        }
      }
    }

    // Check for duplicates in rows
    for(let row = 0; row < gridHeight; ++row) {
      const rowIndexPositions = new Map();

      for(let column = 0; column < gridWidth; ++column) {
        const columnIndex = gameGrid[row][column];
        if(columnIndex >= 0) {
          if(!rowIndexPositions.has(columnIndex)) {
            rowIndexPositions.set(columnIndex, []);
          }
          rowIndexPositions.get(columnIndex).push(column);
        }
      }

      // Mark all duplicates as errors
      for(const positions of rowIndexPositions.values()) {
        if(positions.length > 1) {
          positions.forEach(column => {
            cachedErrors.add(`${row},${column}`);
          });
        }
      }
    }

    // Check for 3-cycle errors
    for(let row = 1; row < gridHeight; row++) {
      const cycles = find3CycleErrors(row);
      cycles.forEach(positions => {
        positions.forEach(({row, column}) => {
          cachedErrors.add(`${row},${column}`);
        });
      });
    }
  }

  function find3CycleErrors(row) {
    const violations = [];
    const chains = findChainsInRow(row);

    for(const chain of chains) {
      const chainIsError = isChainAnError(row, chain);

      if(chainIsError) {
        const violationCells = chain.map(column => ({row, column}));
        violations.push(violationCells);
      }
    }

    return violations;
  }

  const forwardReferenceLookup = new Map();
  const backReferenceLookup = new Map();

  function findChainsInRow(row) {
    forwardReferenceLookup.clear();
    backReferenceLookup.clear();

    for(let column = 0; column < gridWidth; ++column) {
      const targetColumn = gameGrid[row][column];
      if(targetColumn >= 0 && targetColumn !== column) {
        forwardReferenceLookup.set(column, targetColumn);
        backReferenceLookup.set(targetColumn, column);
      }
    }

    const visited = new Set();
    const components = [];

    for(let startColumn = 0; startColumn < gridWidth; ++startColumn) {
      if(visited.has(startColumn)) continue;

      const component = findComponent(startColumn, forwardReferenceLookup, backReferenceLookup, visited);
      if(component.length > 1) {
        components.push(component);
      }
    }

    return components;
  }

  function findComponent(startColumn, forwardReferenceLookup, backReferenceLookup, globalVisited) {
    const component = [];
    const toVisit = [startColumn];
    const localVisited = new Set();

    while(toVisit.length > 0) {
      const column = toVisit.pop();
      if(localVisited.has(column)) continue;

      localVisited.add(column);
      globalVisited.add(column);
      component.push(column);

      if(forwardReferenceLookup.has(column)) {
        const target = forwardReferenceLookup.get(column);
        if(!localVisited.has(target)) {
          toVisit.push(target);
        }
      }

      if(backReferenceLookup.has(column)) {
        const source = backReferenceLookup.get(column);
        if(!localVisited.has(source)) {
          toVisit.push(source);
        }
      }
    }

    return component;
  }

  function isChainAnError(row, chain) {
    const forwardReferenceLookup = new Map();
    for(const column of chain) {
      const targetColumn = gameGrid[row][column];
      if(targetColumn >= 0 && chain.includes(targetColumn)) {
        forwardReferenceLookup.set(column, targetColumn);
      }
    }

    const isCycle = chain.every(column => forwardReferenceLookup.has(column));

    if(isCycle) {
      return chain.length !== 3;
    } else {
      return chain.length > 3;
    }
  }

  function findParametersOfContainingChain(row, column) {
    let tail = column;
    let count = 1;
    while(true) {
      let next = gameGrid[row][tail];
      if(next == column) {
        return {
          cycle: true,
          count: count,
        };
      } else if(next >= 0) {
        tail = next;
        ++count;
      } else {
        break;
      }
    }

    let head = column;
    while(true) {
      let backReference = findBackreferenceColumnIndex(row, head);
      if(backReference == column) {
        console.log("found cycle via head (should be impossible)");
        return {
          cycle: true,
          count: count,
        };
      } else if(backReference >= 0) {
        head = backReference;
        ++count;
      } else {
        break;
      }
    }

    return {
      cycle: false,
      count: count,
      head: head,
      tail: tail,
    };
  }

  function handleWrite(row, column0, column1) {
    if(isHintCell(row, column0)) return;

    if(!isBlankCell(row, column0)) return;

    if(column0 < 0 || column1 < 0) return;

    gameGrid[row][column0] = column1;

    autoComplete3Chain(row, column0);

    notes[row][column0].clear();
    for(let column = 0; column < gridWidth; ++column) {
      notes[row][column].delete(column1);
    }
    for(let row0 = 0; row0 < gridHeight; ++row0) {
      notes[row0][column0].delete(column1);
    }

    saveGameState();
    drawGame();
    recalculateCachedErrors();

    if(isPuzzleComplete()) {
      handlePuzzleCompletion();
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

  function autoComplete3Chain(row, column) {
    let chain = findParametersOfContainingChain(row, column);
    if(!chain.cycle && chain.count == 3) {
      handleWrite(row, chain.tail, chain.head);
    }
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

  function handleNoteErase(row, column0, column1) {
    notes[row][column0].delete(column1);
    notes[row][column1].delete(column0);
    saveGameState();
  }

  function handleErase(row, column) {
    if(isHintCell(row, column)) return;

    const letterIndex = gameGrid[row][column];
    if(letterIndex >= 0) {
      gameGrid[row][column] = -1;

      eraseBackReferenceIfCycle(row, column);

      recalculateCachedErrors();

      saveGameState();
    }
  }

  function eraseBackReferenceIfCycle(row, column) {
    let backReferenceColumn = -1;
    for(let checkColumn = 0; checkColumn < gridWidth; checkColumn++) {
      if(gameGrid[row][checkColumn] === column) {
        backReferenceColumn = checkColumn;
        break;
      }
    }

    if(backReferenceColumn >= 0) {
      const backReferenceValue = gameGrid[row][backReferenceColumn];
      if(backReferenceValue >= 0) {
        const middleColumn = backReferenceValue;
        if(middleColumn >= 0) {
          const middleValue = gameGrid[row][middleColumn];
          if(middleValue === column) {
            if(!isHintCell(row, backReferenceColumn)) {
              gameGrid[row][backReferenceColumn] = -1;
            }
          }
        }
      }
    }
  }

  function isPuzzleComplete() {
    for(let row = 1; row < gridHeight; ++row) {
      for(let column = 0; column < gridWidth; ++column) {
        if(isBlankCell(row, column)) {
          return false;
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

  // @@@ Completion Animation

  const completionAnimationStripeDuration = 400;
  const completionAnimationTextDelay = 800;
  const completionAnimationTextDuration = 600;

  function completionAnimationStop() {
    if(completionAnimationAnimationId) {
      cancelAnimationFrame(completionAnimationAnimationId);
      completionAnimationAnimationId = null;
    }
    completionAnimationActive = false;
    completionAnimationStripeProgress = 0;
    completionAnimationTextProgress = 0;
    completionAnimationStartTime = null;
  }

  function completionAnimationStart() {
    completionAnimationStop();

    completionAnimationActive = true;
    completionAnimationStripeProgress = 0;
    completionAnimationTextProgress = 0;
    completionAnimationStartTime = performance.now();
    completionAnimationAnimationId = requestAnimationFrame(completionAnimationFrame);
  }

  function completionAnimationInstant() {
    completionAnimationStop();

    completionAnimationActive = true;
    completionAnimationStripeProgress = 1;
    completionAnimationTextProgress = 1;
  }

  function completionAnimationUpdate(timestamp) {
    const elapsed = timestamp - completionAnimationStartTime;

    completionAnimationStripeProgress = Math.min(elapsed / completionAnimationStripeDuration, 1);

    if(elapsed > completionAnimationTextDelay) {
      const textElapsed = elapsed - completionAnimationTextDelay;
      completionAnimationTextProgress = Math.min(textElapsed / completionAnimationTextDuration, 1);
    }
  }

  function completionAnimationFrame(timestamp) {
    completionAnimationUpdate(timestamp);

    drawGame();

    if(completionAnimationStripeProgress < 1 || completionAnimationTextProgress < 1) {
      completionAnimationAnimationId = requestAnimationFrame(completionAnimationFrame);
    }
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

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    canvas.width = size;
    canvas.height = size;

    const padding = size * 0.01;
    gridOffset = padding;
    cellSize = (size - 2 * padding) / gridWidth;

    noteOffset = cellSize * 0.2;
    letterOffset = cellSize * 0.1;
  }

  function drawGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const errorCells = cachedErrors;

    for(let row = 0; row < gridHeight; ++row) {
      const chains = findChainsInRow(row);
      const colorPalette = chainStyles[row % chainStyles.length];

      for(let column = 0; column < gridWidth; ++column) {
        let chainIndex = 0;
        for(let i = 0; i < chains.length; ++i) {
          if(chains[i].includes(column)) {
            chainIndex = i % colorPalette.length;
            break;
          }
        }

        let chainStyleIndex = null;
        let defaultCellStyle = getStyleIndexForCell(row, column, gridColor, theme);
        let bodyStyleIndex = defaultCellStyle;
        if(row !== 0) {
          let belongsToChain = false;
          let chainSize = 1;
          for(let i = 0; i < chains.length; ++i) {
            if(chains[i].includes(column)) {
              belongsToChain = true;
              chainSize = chains[i].length;
              chainIndex = i % colorPalette.length;
              break;
            }
          }

          const valueInCell = gameGrid[row][column] >= 0;
          chainStyleIndex = colorPalette[chainIndex];
          if(valueInCell) bodyStyleIndex = chainStyleIndex;
        }
        let backreferenceStyleIndex = findBackreferenceColumnIndex(row, column) >= 0 ? chainStyleIndex : defaultCellStyle;

        if(errorCells.has(`${row},${column}`)) {
          bodyStyleIndex = theme.styleError;
        }

        if(selectedCell && selectedCell.row == row && gameGrid[selectedCell.row][selectedCell.column] < 0) {
          if(selectedCell.column == column) {
            bodyStyleIndex = theme.styleHighlight;
          }

          if(
            dragTarget &&
            dragTarget.row == row &&
            dragTarget.column == column &&
            dragTarget.column != selectedCell.column &&
            findBackreferenceColumnIndex(dragTarget.row, dragTarget.column) < 0
          ) {
            backreferenceStyleIndex = theme.styleHighlight;
          }
        }

        drawCellWithCustomBackground(row, column, bodyStyleIndex, backreferenceStyleIndex);
      }
    }

    drawGridLines();

    if(completionAnimationActive) {
      drawCompletionAnimation();
    }
  }

  function drawCellWithCustomBackground(row, column, bodyStyleIndex, backreferenceStyleIndex) {
    const x = gridOffset + column * cellSize;
    const y = gridOffset + row * cellSize;

    const selectedStyleIndex = bodyStyleIndex;
    const selectedStyle = theme.style[selectedStyleIndex];

    context.fillStyle = selectedStyle.background;
    context.fillRect(x, y, cellSize, cellSize);

    const originalLetter = puzzleConfiguration.grid[row][column];
    const isHint = originalLetter !== ' ' && originalLetter === originalLetter.toUpperCase();

    if(row > 0) {
      drawBackReference(x, y, row, column, backreferenceStyleIndex);
    }

    const letterIndex = gameGrid[row][column];
    if(letterIndex >= 0) {
      const letter = headerLetters[letterIndex];
      context.fillStyle = isHint ? selectedStyle.foregroundHint : selectedStyle.foregroundAnswer;
      context.font = `${cellSize * 0.5}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const letterX = row > 0 ? x + cellSize / 2 + letterOffset / 2 : x + cellSize / 2;
      context.fillText(letter, letterX, y + cellSize / 2);
    }

    if(notes[row][column] && notes[row][column].size > 0) {
      const noteX = x + noteOffset;
      const noteY = y + noteOffset;
      drawNotes(noteX, noteY, notes[row][column], selectedStyle);
    }
  }

  function drawBackReference(x, y, row, column, styleIndex) {
    let backReferenceLetter = '';
    for(let checkColumn = 0; checkColumn < gridWidth; ++checkColumn) {
      if(gameGrid[row][checkColumn] === column) {
        backReferenceLetter = headerLetters[checkColumn];
        break;
      }
    }

    const squareSize = cellSize * 0.3;
    const squareX = x + 1;
    const squareY = y + 1;

    const selectedStyle = theme.style[styleIndex];

    context.fillStyle = selectedStyle.background;
    context.fillRect(squareX, squareY, squareSize, squareSize);

    context.strokeStyle = selectedStyle.foregroundAnswer;
    context.lineWidth = 1;
    context.beginPath();

    context.moveTo(squareX + squareSize, squareY);
    context.lineTo(squareX + squareSize, squareY + squareSize);

    context.moveTo(squareX, squareY + squareSize);
    context.lineTo(squareX + squareSize, squareY + squareSize);
    context.stroke();

    if(backReferenceLetter) {
      context.fillStyle = selectedStyle.foregroundAnswer;
      context.font = `${squareSize * 0.7}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(backReferenceLetter, squareX + squareSize / 2, squareY + squareSize / 2);
    }
  }

  function drawNotes(x, y, noteSet, cellTheme) {
    const noteArray = Array.from(noteSet).sort();
    const notesPerRow = Math.ceil(Math.sqrt(gridWidth));
    const noteSize = cellSize * 0.22;

    context.fillStyle = cellTheme.foregroundAnswer;
    context.font = `${noteSize * 1.2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    noteArray.forEach(noteColumnIndex => {
      if(noteColumnIndex >= 0 && noteColumnIndex < gridWidth) {
        const letter = headerLetters[noteColumnIndex];
        const noteRow = Math.floor(noteColumnIndex / notesPerRow);
        const noteColumn = noteColumnIndex % notesPerRow;
        const noteX = x + (noteColumn + 1) * noteSize;
        const noteY = y + (noteRow + 1) * noteSize;
        context.fillText(letter, noteX, noteY);
      }
    });
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

    const centerY = canvasHeight / 2;

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

  // @@@ Event Handlers

  function tryStartGame() {
    if(gameStarted) return;
    gameStarted = true;

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

  function handlePointerMove(e) {
    if(completionTime) {
      canvas.style.cursor = 'default';
      return;
    }

    const cell = getCellFromCoordinate(e.clientX, e.clientY);

    if(cell && cell.row != 0) {
      canvas.style.cursor = selectedCell ? 'grabbing' : 'grab';
    } else {
      canvas.style.cursor = 'default';
    }

    if(!selectedCell) return;

    if(!cell || cell.row !== selectedCell.row || (currentMode === 'write' && !isBlankCell(cell.row, cell.column))) {
      dragTarget = null;
    } else {
      dragTarget = cell;
    }

    drawGame();
  }

  function handlePointerUp(e) {
    if(completionTime) {
      canvas.style.cursor = 'default';
      return;
    }

    if(!selectedCell) return;

    const cell = getCellFromCoordinate(e.clientX, e.clientY);
    if(cell) {
      if(cell.row != 0) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }

      if(cell.row === selectedCell.row && cell.column !== selectedCell.column) {
        if(currentMode === 'write') {
          handleWrite(selectedCell.row, selectedCell.column, cell.column);
        } else if(currentMode === 'note') {
          handleNote(selectedCell.row, selectedCell.column, cell.column);
        } else if(currentMode === 'note-erase') {
          handleNoteErase(selectedCell.row, selectedCell.column, cell.column);
        }
      }
    } else {
      canvas.style.cursor = 'default';
    }

    selectedCell = null;
    dragTarget = null;
    drawGame();
  }

  function handlePointerDown(e) {
    if(completionTime) {
      canvas.style.cursor = 'default';
      return;
    }

    const cell = getCellFromCoordinate(e.clientX, e.clientY);
    if(!cell || cell.row == 0) return;

    tryStartGame();

    if(currentMode === 'erase') {
      handleErase(cell.row, cell.column);
      drawGame();
      return;
    }

    selectedCell = cell;
    dragTarget = null;

    drawGame();

    canvas.setPointerCapture(e.pointerId);

    if(cell.row != 0) {
      canvas.style.cursor = selectedCell ? 'grabbing' : 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  }

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);

  window.addEventListener('resize', () => {
    if(gridWidth > 0) {
      resizeCanvas();
      drawGame();
    }
  });

  function setupModeButtons() {
    const modeButtons = {
      'mode-write': 'write',
      'mode-erase': 'erase',
      'mode-note': 'note',
      'mode-note-erase': 'note-erase'
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
      notes: notes.map(row => row.map(cell => Array.from(cell))),
      startTime: startTime,
      gameStarted: gameStarted,
      completionTime: completionTime
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
    notes = puzzleState.notes.map(row => row.map(cell => new Set(cell)));

    if(puzzleState.startTime) {
      startTime = puzzleState.startTime;
      gameStarted = true;
    }

    if(puzzleState.completionTime) {
      completionTime = puzzleState.completionTime;
      // @todo Maybe pull out side-effects.
      completionAnimationInstant();
    } else {
      // @todo Maybe pull out side-effects.
      timerInterval = setInterval(timerUpdateDisplay, 1000);
      completionTime = null;
    }

    return true;
  }

  function initializeStartingGameState() {
    gameGrid = [];
    for(let row = 0; row < gridHeight; ++row) {
      gameGrid[row] = [];
      for(let column = 0; column < gridWidth; ++column) {
        const cell = puzzleConfiguration.grid[row][column];
        if(cell === cell.toUpperCase() && cell !== ' ') {
          gameGrid[row][column] = headerLetters.indexOf(cell);
        } else {
          gameGrid[row][column] = -1;
        }
      }
    }

    notes = Array(gridHeight).fill().map(() => Array(gridWidth).fill().map(() => new Set()));
  }

  // @@ Called From Boilerplate

  function initializePuzzle(config) {
    puzzleConfiguration = config;

    timerStop();
    completionAnimationStop();
    gameStarted = false;
    startTime = null;
    completionTime = null;

    theme = config.theme ? { ...defaultTheme, ...config.theme } : defaultTheme;
    gridColor = config.gridColor;
    chainStyles = theme.chain;

    headerLetters = config.grid[0];
    gridWidth = headerLetters.length;
    gridHeight = config.grid.length;

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

  const gameName = 'triple-place';

  const tags = [];

  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');
  const pickerField = document.getElementById('puzzle-date-picker');

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

  // @unused
  function findPuzzleIndexForEarliestIncompleteOrLatest() {
    let puzzleIndex = -1;
    for(let i = 0; i < puzzles.length; ++i) {
      if(puzzles[i].date > currentDate) continue;
      const puzzleId = getPuzzleId(puzzles[i]);

      puzzleIndex = i;
      if(!getPuzzleCompletion(gameName, puzzleId)) return i;
    }

    return puzzleIndex;
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
    files.map(file =>
      fetch(file)
        .then(response => response.json())
    )
  )
  .then(allData => {
    puzzleData = allData[0];

    for(let i = 1; i < allData.length; ++i) {
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
