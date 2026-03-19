import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceGame,
  createInitialState,
  getNextFoodPosition,
  queueDirection,
  startGame
} from "../src/gameLogic.js";

test("snake moves one cell in the queued direction", () => {
  let state = createInitialState(() => 0);
  state = startGame(state);
  state = {
    ...state,
    queuedDirection: "right"
  };

  const next = advanceGame(state, () => 0);

  assert.deepEqual(next.snake[0], { x: 5, y: 8 });
  assert.equal(next.snake.length, 3);
});

test("snake grows and score increments after eating food", () => {
  let state = createInitialState(() => 0);
  state = startGame(state);
  state = {
    ...state,
    food: { x: 5, y: 8 },
    queuedDirection: "right"
  };

  const next = advanceGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 5, y: 8 });
  assert.notDeepEqual(next.food, { x: 5, y: 8 });
});

test("wall collisions end the game", () => {
  const state = {
    ...startGame(createInitialState(() => 0)),
    snake: [{ x: 15, y: 8 }, { x: 14, y: 8 }, { x: 13, y: 8 }],
    direction: "right",
    queuedDirection: "right"
  };

  const next = advanceGame(state, () => 0);

  assert.equal(next.gameOver, true);
});

test("self collisions end the game", () => {
  const state = {
    ...startGame(createInitialState(() => 0)),
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 }
    ],
    direction: "right",
    queuedDirection: "down",
    food: { x: 10, y: 10 }
  };

  const next = advanceGame(state, () => 0);

  assert.equal(next.gameOver, true);
});

test("food placement skips occupied cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];

  const food = getNextFoodPosition(snake, 2, () => 0);

  assert.deepEqual(food, { x: 1, y: 1 });
});

test("direction queue prevents immediate reversal", () => {
  const state = {
    ...startGame(createInitialState(() => 0)),
    direction: "right",
    queuedDirection: "right"
  };

  assert.equal(queueDirection(state, "left"), "right");
  assert.equal(queueDirection(state, "up"), "up");
});
