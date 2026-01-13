---
layout: page
title: Pair Place
permalink: /browser-games/pair-place/
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
      A Pair Place puzzle is represented as a grid with a "header row" at the
      top. To complete a Pair Place puzzle, you must fill in each square with
      a letter while obeying two rules:
    </p>
    <ol>
      <li>Each letter must appear once in each column.</li>
      <li>Letters must be placed into squares two at a time, with each square being filled with the header letter of the other square.</li>
    </ol>
    <p>
      To place letters in the grid, press on the first square you want to fill,
      then drag to another open square in the same row. This will fill each
      square with the other square's header letter.
    </p>
    <img src="../../assets/images/tutorial-drag.gif">
    <h3>Tips</h3>
    <p>
      Although there are only two explicit rules of the puzzle, it's possible to
      derive additional rules of thumb that can be used as deduction shortcuts.
      A few such rules of thumb are:
    </p>
    <ul>
      <li>
        A square must not be filled with a letter if:
        <ul>
          <li>The letter already appears in the row.</li>
          <li>The letter already appears in the column.</li>
        </ul>
      </li>
      <li>
        A square must be filled with a letter if:
        <ul>
          <li>Only two blank squares remain in the row; each must be filled with the other's header letter.</li>
          <li>The square is the only blank square in the column, and that letter is the only unused letter in the column.</li>
          <li>That letter does not appear in that square's column yet, but that square is the only blank square in the column in a row where the letter hasn't been used yet.</li>
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
<script>
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
  }

  function handleWrite(row, column0, column1) {
    if(isHintCell(row, column0) || isHintCell(row, column1)) return;
    if(!isBlankCell(row, column0) || !isBlankCell(row, column1)) return;

    if(column0 >= 0 && column1 >= 0) {
      gameGrid[row][column0] = column1;
      gameGrid[row][column1] = column0;

      clearNotesForPlacement(row, column0, column1);

      saveGameState();
      drawGame();
      recalculateCachedErrors();

      if(isPuzzleComplete()) {
        handlePuzzleCompletion();
      }
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
    if(!isBlankCell(row, column0) || !isBlankCell(row, column1)) return;
    if(isHintCell(row, column0) || isHintCell(row, column1)) return;

    if(column0 >= 0 && column1 >= 0) {
      notes[row][column0].add(column1);
      notes[row][column1].add(column0);
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

    const pairedIndex = gameGrid[row][column];
    if(pairedIndex >= 0) {
      gameGrid[row][pairedIndex] = -1;
      gameGrid[row][column] = -1;

      recalculateCachedErrors();

      saveGameState();
    }
  }

  function isPuzzleComplete() {
    for(let row = 1; row < gridHeight; ++row) {
      for(let column = 0; column < gridWidth; ++column) {
        if(isBlankCell(row, column)) return false;
      }
    }

    if(hasRuleViolations()) return false;

    return true;
  }

  function handlePuzzleCompletion() {
    const elapsedTime = Date.now() - startTime;
    completionTime = elapsedTime;

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
    completionAnimationUpdate(timestamp)

    drawGame();

    if(completionAnimationStripeProgress < 1 || completionAnimationTextProgress < 1) {
      completionAnimationAnimationId = requestAnimationFrame(completionAnimationFrame);
    }
  }

  // @@@ Timer Interval

  const timerElement = document.getElementById('timer-display');

  function timerStart() {
    if(gameStarted) return;
    gameStarted = true;

    startTime = Date.now();
    saveGameState();

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

    let elapsed;
    if(completionTime) {
      elapsed = Math.floor(completionTime / 1000);
    } else {
      elapsed = Math.floor((Date.now() - startTime) / 1000);
    }

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  }

  function drawGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for(let row = 0; row < gridHeight; ++row) {
      for(let column = 0; column < gridWidth; ++column) {
        let cellStyleIndex = getStyleIndexForCell(row, column, gridColor, theme);

        if(cachedErrors.has(`${row},${column}`)) {
          cellStyleIndex = theme.styleError;
        }

        let selectedCellFilled = false;
        if(selectedCell && selectedCell.row == row) {
          const partnerColumn = gameGrid[selectedCell.row][selectedCell.column];
          selectedCellFilled = partnerColumn >= 0;

          if(selectedCell.column == column || partnerColumn == column) {
            cellStyleIndex = theme.styleHighlight;
          }
        }
        if(dragTarget && dragTarget.row == row && dragTarget.column == column && !selectedCellFilled) {
          cellStyleIndex = theme.styleHighlight;
        }

        drawCell(row, column, cellStyleIndex);
      }
    }

    drawGridLines();

    if(completionAnimationActive) {
      drawCompletionAnimation();
    }
  }

  function drawCell(row, column, styleIndex) {
    const x = gridOffset + column * cellSize;
    const y = gridOffset + row * cellSize;

    const cellStyle = theme.style[styleIndex] || theme.style[theme.styleCell];

    context.fillStyle = cellStyle.background;
    context.fillRect(x, y, cellSize, cellSize);

    const originalLetter = puzzleConfiguration.grid[row][column];
    const isHint = originalLetter !== ' ' && originalLetter === originalLetter.toUpperCase();

    const letterIndex = gameGrid[row][column];
    if(letterIndex >= 0) {
      const letter = headerLetters[letterIndex];
      context.fillStyle = isHint ? cellStyle.foregroundHint : cellStyle.foregroundAnswer;
      context.font = `${cellSize * 0.6}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(letter, x + cellSize / 2, y + cellSize / 2);
    }

    if(notes[row][column] && notes[row][column].size > 0) {
      drawNotes(x, y, notes[row][column], cellStyle);
    }
  }

  function drawNotes(x, y, noteSet, cellStyle) {
    const noteArray = Array.from(noteSet).sort();
    const notesPerRow = Math.ceil(Math.sqrt(gridWidth));
    const noteSize = cellSize / (notesPerRow + 1);

    context.fillStyle = cellStyle.foregroundAnswer;
    context.font = `${noteSize * 1.2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    noteArray.forEach(noteColumnIndex => {
      if(noteColumnIndex >= 0 && noteColumnIndex < gridWidth) {
        // @todo Maybe balance the distribution to rows for very non-square column counts.
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
    context.strokeStyle = theme.colorGridline;
    context.lineWidth = 1;

    for(let column = 0; column <= gridWidth; ++column) {
      const x = gridOffset + column * cellSize;
      context.beginPath();
      context.moveTo(x, gridOffset);
      context.lineTo(x, gridOffset + gridHeight * cellSize);
      context.stroke();
    }

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

    if(completionAnimationStripeProgress > 0) {
      const stripeHeight = 60;
      const stripeY = (canvasHeight - stripeHeight) / 2;

      const stripeX = lerp(canvasWidth, 0, completionAnimationStripeProgress);
      const stripeWidth = canvasWidth - stripeX;

      context.fillStyle = stripeColor;
      context.fillRect(stripeX, stripeY, stripeWidth, stripeHeight);
    }

    if(completionAnimationTextProgress > 0) {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

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

  function getCellFromCoords(x, y) {
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

    const cell = getCellFromCoords(e.clientX, e.clientY);

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

    const cell = getCellFromCoords(e.clientX, e.clientY);
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

    const cell = getCellFromCoords(e.clientX, e.clientY);
    if(!cell || cell.row == 0) return;

    timerStart();

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
      completionAnimationInstant();
    } else {
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

    headerLetters = config.grid[0];
    gridWidth = headerLetters.length;
    gridHeight = config.grid.length;

    if(!loadGameState()) {
      initializeStartingGameState();
    }

    resizeCanvas();
    recalculateCachedErrors();
    drawGame();
    timerUpdateDisplay();
    updatePuzzlePrompt();
  }

  function initializeGamePlayer() {
    setupModeButtons();
    setupClearButton();
  }

  const gameName = 'pair-place';

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
