import {
  GRID_SIZE,
  TICK_MS,
  advanceGame,
  createInitialState,
  positionsEqual,
  queueDirection,
  startGame,
  togglePause
} from "./gameLogic.js";

const board = document.querySelector("#board");
const scoreValue = document.querySelector("#score");
const bestScoreValue = document.querySelector("#best-score");
const statusValue = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let bestScore = 0;
let state = createInitialState();

createBoard(board, GRID_SIZE);
render();

const tickInterval = window.setInterval(() => {
  state = advanceGame(state);
  if (state.score > bestScore) {
    bestScore = state.score;
  }
  render();
}, TICK_MS);

window.addEventListener("keydown", (event) => {
  const direction = getDirectionFromKey(event.key);

  if (event.key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (!direction) {
    return;
  }

  event.preventDefault();

  if (!state.started) {
    state = startGame(state);
  }

  state = {
    ...state,
    queuedDirection: queueDirection(state, direction)
  };

  render();
});

pauseButton.addEventListener("click", () => {
  state = state.started ? togglePause(state) : startGame(state);
  render();
});

restartButton.addEventListener("click", resetGame);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;

    if (!state.started) {
      state = startGame(state);
    }

    state = {
      ...state,
      queuedDirection: queueDirection(state, direction)
    };

    render();
  });
});

window.addEventListener("beforeunload", () => {
  window.clearInterval(tickInterval);
});

function resetGame() {
  state = createInitialState();
  render();
}

function render() {
  const cells = board.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);
    const isHead = positionsEqual(state.snake[0], { x, y });
    const isSnake = state.snake.some((segment) => segment.x === x && segment.y === y);
    const isFood = positionsEqual(state.food, { x, y });

    cell.className = "cell";
    if (isSnake) {
      cell.classList.add("cell--snake");
    }
    if (isHead) {
      cell.classList.add("cell--head");
    }
    if (isFood) {
      cell.classList.add("cell--food");
    }
  });

  scoreValue.textContent = String(state.score);
  bestScoreValue.textContent = String(bestScore);
  statusValue.textContent = getStatusMessage(state);
  pauseButton.textContent = state.paused ? "Resume" : "Pause";
}

function createBoard(container, gridSize) {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < gridSize * gridSize; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
  }

  container.appendChild(fragment);
}

function getDirectionFromKey(key) {
  const normalized = key.toLowerCase();
  const keyMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  return keyMap[normalized] ?? null;
}

function getStatusMessage(currentState) {
  if (currentState.gameOver) {
    return "Game over. Press restart to play again.";
  }

  if (!currentState.started) {
    return "Press any arrow key to start.";
  }

  if (currentState.paused) {
    return "Paused.";
  }

  return "Collect food and avoid the walls.";
}
