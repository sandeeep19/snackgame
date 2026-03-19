export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 160;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialSnake() {
  return [
    { x: 4, y: 8 },
    { x: 3, y: 8 },
    { x: 2, y: 8 }
  ];
}

export function createInitialState(random = Math.random, gridSize = GRID_SIZE) {
  const snake = createInitialSnake();

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    queuedDirection: INITIAL_DIRECTION,
    food: getNextFoodPosition(snake, gridSize, random),
    score: 0,
    started: false,
    paused: false,
    gameOver: false
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state.direction;
  }

  const currentDirection = state.started ? state.queuedDirection : state.direction;
  if (OPPOSITES[currentDirection] === nextDirection) {
    return currentDirection;
  }

  return nextDirection;
}

export function togglePause(state) {
  if (!state.started || state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused
  };
}

export function advanceGame(state, random = Math.random) {
  if (!state.started || state.paused || state.gameOver) {
    return state;
  }

  const direction = state.queuedDirection;
  const vector = DIRECTION_VECTORS[direction];
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y
  };

  const willEat = positionsEqual(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize;
  const hitSelf = bodyToCheck.some((segment) => positionsEqual(segment, nextHead));

  if (hitWall || hitSelf) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!willEat) {
    snake.pop();
  }

  return {
    ...state,
    snake,
    direction,
    queuedDirection: direction,
    food: willEat ? getNextFoodPosition(snake, state.gridSize, random) : state.food,
    score: willEat ? state.score + 1 : state.score
  };
}

export function startGame(state) {
  return {
    ...state,
    started: true,
    paused: false
  };
}

export function getNextFoodPosition(snake, gridSize, random = Math.random) {
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function positionsEqual(a, b) {
  return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
}
