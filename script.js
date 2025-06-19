const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let isDownPressed = false;
let downHoldTime = 0;

const SHAPES = [
  [[1, 1, 1, 1]],                         // I
  [[1, 1], [1, 1]],                       // O
  [[0, 1, 0], [1, 1, 1]],                 // T
  [[0, 1, 1], [1, 1, 0]],                 // S
  [[1, 1, 0], [0, 1, 1]],                 // Z
  [[1, 0, 0], [1, 1, 1]],                 // J
  [[0, 0, 1], [1, 1, 1]]                  // L
];
const COLORS = ["cyan", "yellow", "purple", "green", "red", "blue", "orange"];
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "black";
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawBlock() {
  ctx.fillStyle = current.color;
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      if (current.shape[r][c]) {
        ctx.fillRect((current.x + c) * BLOCK_SIZE, (current.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "black";
        ctx.strokeRect((current.x + c) * BLOCK_SIZE, (current.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function collide(x, y, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        let newX = x + c;
        let newY = y + r;
        if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      if (current.shape[r][c]) {
        board[current.y + r][current.x + c] = current.color;
      }
    }
  }
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function drop() {
  if (!collide(current.x, current.y + 1, current.shape)) {
    current.y++;
  } else {
    merge();
    clearLines();
    spawn();
  }
}

function rotateCurrent() {
  const rotated = rotate(current.shape);
  if (!collide(current.x, current.y, rotated)) {
    current.shape = rotated;
  }
}

function rotateCurrent() {
  const rotated = rotate(current.shape);
  if (!collide(current.x, current.y, rotated)) {
    current.shape = rotated;
  }
}

function move(dir) {
  if (!collide(current.x + dir, current.y, current.shape)) {
    current.x += dir;
  }
}

function clearLines() {
  outer: for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c]) continue outer;
    }
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(0));
    score += 10;
    document.getElementById("score").innerText = "Score: " + score;
  }
}

let nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

function spawn() {
  current = {
    shape: nextShape,
    color: COLORS[SHAPES.indexOf(nextShape)],
    x: 3,
    y: 0
  };
  nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  if (collide(current.x, current.y, current.shape)) {
    document.getElementById("restartButton").style.display = "block";
    return; // 新しいブロックを出さず、ゲームを止める
  }
}



let current;
spawn();
setInterval(() => {
  if (isDownPressed) {
    downHoldTime += 100;
    if (downHoldTime >= 500) {
      drop();
    }
  } else {
    downHoldTime = 0;
    drop();
  }
  
  drawBoard();
  drawNextBlock();
  drawBlock();
}, 600);

function drawNextBlock() {
  const nextCanvas = document.getElementById("nextCanvas");
  const nextCtx = nextCanvas.getContext("2d");
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  nextCtx.fillStyle = COLORS[SHAPES.indexOf(nextShape)];
  for (let r = 0; r < nextShape.length; r++) {
    for (let c = 0; c < nextShape[r].length; c++) {
      if (nextShape[r][c]) {
        nextCtx.fillRect(c * 20, r * 20, 20, 20);
        nextCtx.strokeStyle = "black";
        nextCtx.strokeRect(c * 20, r * 20, 20, 20);
      }
    }
  }
}


document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowDown") drop();
  else if (e.key === "ArrowUp") {
    const rotated = rotate(current.shape);
    if (!collide(current.x, current.y, rotated)) {
      current.shape = rotated;
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    isDownPressed = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowDown") {
    isDownPressed = false;
    downHoldTime = 0;
  }
});

document.getElementById("restartButton").addEventListener("click", () => {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("restartButton").style.display = "none";
  spawn();
});
