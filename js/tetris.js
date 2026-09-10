(() => {
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 30;
  const LINES_PER_LEVEL = 10;

  const COLORS = {
    I: "#5ce1ff",
    O: "#ffd166",
    T: "#c77dff",
    S: "#80ed99",
    Z: "#ff5d7a",
    J: "#4ea8de",
    L: "#ff9f1c",
  };

  const SHAPES = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  };

  const KICKS = {
    JLSTZ: {
      "0>1": [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
      "1>0": [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      "1>2": [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      "2>1": [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
      "2>3": [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
      "3>2": [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      "3>0": [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      "0>3": [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
    },
    I: {
      "0>1": [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      "1>0": [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      "1>2": [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
      "2>1": [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
      "2>3": [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      "3>2": [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      "3>0": [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
      "0>3": [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
    },
  };

  const SCORE_TABLE = [0, 100, 300, 500, 800];

  const boardCanvas = document.getElementById("board");
  const nextCanvas = document.getElementById("next");
  const holdCanvas = document.getElementById("hold");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const startBtn = document.getElementById("start-btn");
  const scoreEl = document.getElementById("score");
  const linesEl = document.getElementById("lines");
  const levelEl = document.getElementById("level");

  const ctx = boardCanvas.getContext("2d");
  const nextCtx = nextCanvas.getContext("2d");
  const holdCtx = holdCanvas.getContext("2d");

  const state = {
    grid: createGrid(),
    bag: [],
    current: null,
    next: null,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    dropMs: 1000,
    acc: 0,
    lastTs: 0,
    playing: false,
    paused: false,
    over: false,
    anim: 0,
  };

  function createGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function cloneMatrix(matrix) {
    return matrix.map((row) => row.slice());
  }

  function rotate(matrix, dir) {
    const size = matrix.length;
    const next = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (dir > 0) next[x][size - 1 - y] = matrix[y][x];
        else next[size - 1 - x][y] = matrix[y][x];
      }
    }
    return next;
  }

  function refillBag() {
    const types = Object.keys(SHAPES);
    for (let i = types.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    state.bag.push(...types);
  }

  function takeFromBag() {
    if (state.bag.length === 0) refillBag();
    return state.bag.shift();
  }

  function spawnPiece(type) {
    const matrix = cloneMatrix(SHAPES[type]);
    return {
      type,
      matrix,
      rot: 0,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: type === "I" ? -1 : 0,
    };
  }

  function collide(piece, ox = 0, oy = 0, matrix = piece.matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const nx = piece.x + x + ox;
        const ny = piece.y + y + oy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && state.grid[ny][nx]) return true;
      }
    }
    return false;
  }

  function tryMove(dx, dy) {
    if (!collide(state.current, dx, dy)) {
      state.current.x += dx;
      state.current.y += dy;
      return true;
    }
    return false;
  }

  function tryRotate(dir) {
    const piece = state.current;
    if (piece.type === "O") return;
    const from = piece.rot;
    const to = (from + (dir > 0 ? 1 : 3)) % 4;
    const rotated = rotate(piece.matrix, dir);
    const table = piece.type === "I" ? KICKS.I : KICKS.JLSTZ;
    const tests = table[`${from}>${to}`];
    for (const [kx, ky] of tests) {
      if (!collide(piece, kx, -ky, rotated)) {
        piece.matrix = rotated;
        piece.rot = to;
        piece.x += kx;
        piece.y -= ky;
        return;
      }
    }
  }

  function lockPiece() {
    const { current } = state;
    for (let y = 0; y < current.matrix.length; y += 1) {
      for (let x = 0; x < current.matrix[y].length; x += 1) {
        if (!current.matrix[y][x]) continue;
        const gy = current.y + y;
        const gx = current.x + x;
        if (gy < 0) {
          gameOver();
          return;
        }
        state.grid[gy][gx] = current.type;
      }
    }
    clearLines();
    spawnNext();
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y -= 1) {
      if (state.grid[y].every(Boolean)) {
        state.grid.splice(y, 1);
        state.grid.unshift(Array(COLS).fill(null));
        cleared += 1;
        y += 1;
      }
    }
    if (!cleared) return;
    state.lines += cleared;
    state.score += SCORE_TABLE[cleared] * state.level;
    const newLevel = Math.floor(state.lines / LINES_PER_LEVEL) + 1;
    if (newLevel !== state.level) {
      state.level = newLevel;
      state.dropMs = Math.max(90, 1000 - (state.level - 1) * 85);
    }
    updateHud();
  }

  function spawnNext() {
    state.current = state.next;
    state.next = spawnPiece(takeFromBag());
    state.canHold = true;
    if (collide(state.current)) gameOver();
  }

  function holdPiece() {
    if (!state.canHold || !state.playing || state.paused) return;
    const held = state.hold;
    state.hold = spawnPiece(state.current.type);
    state.current = held ? spawnPiece(held.type) : state.next;
    if (!held) state.next = spawnPiece(takeFromBag());
    state.canHold = false;
    if (collide(state.current)) gameOver();
  }

  function hardDrop() {
    let dist = 0;
    while (tryMove(0, 1)) dist += 1;
    state.score += dist * 2;
    updateHud();
    lockPiece();
  }

  function ghostY() {
    const piece = state.current;
    let gy = 0;
    while (!collide(piece, 0, gy + 1)) gy += 1;
    return piece.y + gy;
  }

  function drop() {
    if (!tryMove(0, 1)) lockPiece();
    else {
      state.score += 1;
      updateHud();
    }
  }

  function updateHud() {
    scoreEl.textContent = state.score;
    linesEl.textContent = state.lines;
    levelEl.textContent = state.level;
  }

  function reset() {
    state.grid = createGrid();
    state.bag = [];
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.dropMs = 1000;
    state.acc = 0;
    state.hold = null;
    state.canHold = true;
    state.over = false;
    state.paused = false;
    state.next = spawnPiece(takeFromBag());
    state.current = spawnPiece(takeFromBag());
    updateHud();
  }

  function startGame() {
    reset();
    state.playing = true;
    overlay.classList.add("is-hidden");
    state.lastTs = performance.now();
    cancelAnimationFrame(state.anim);
    state.anim = requestAnimationFrame(loop);
  }

  function pauseGame() {
    if (!state.playing || state.over) return;
    state.paused = !state.paused;
    if (state.paused) {
      showOverlay("PAUSED", "Press P or the button to continue", "Resume");
    } else {
      overlay.classList.add("is-hidden");
      state.lastTs = performance.now();
    }
  }

  function gameOver() {
    state.playing = false;
    state.over = true;
    showOverlay("GAME OVER", `Score: ${state.score}`, "Play again");
  }

  function showOverlay(title, text, button) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = button;
    overlay.classList.remove("is-hidden");
  }

  function drawCell(target, x, y, color, alpha = 1, size = BLOCK) {
    target.save();
    target.globalAlpha = alpha;
    const px = x * size;
    const py = y * size;
    const grad = target.createLinearGradient(px, py, px + size, py + size);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, color);
    grad.addColorStop(1, "#0b1220");
    target.fillStyle = grad;
    target.fillRect(px + 1, py + 1, size - 2, size - 2);
    target.strokeStyle = "rgba(255,255,255,0.18)";
    target.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
    target.restore();
  }

  function drawBoard() {
    ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    ctx.fillStyle = "#05070e";
    ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    ctx.strokeStyle = "rgba(120, 220, 255, 0.06)";
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK, 0);
      ctx.lineTo(x * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK);
      ctx.lineTo(COLS * BLOCK, y * BLOCK);
      ctx.stroke();
    }

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const type = state.grid[y][x];
        if (type) drawCell(ctx, x, y, COLORS[type]);
      }
    }

    if (!state.current) return;
    const piece = state.current;
    const gy = ghostY();
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue;
        drawCell(ctx, piece.x + x, gy + y, COLORS[piece.type], 0.18);
      }
    }
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue;
        drawCell(ctx, piece.x + x, piece.y + y, COLORS[piece.type]);
      }
    }
  }

  function drawMini(target, piece) {
    target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    if (!piece) return;
    const size = 24;
    const w = piece.matrix[0].length;
    const h = piece.matrix.length;
    const ox = (target.canvas.width / size - w) / 2;
    const oy = (target.canvas.height / size - h) / 2;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (!piece.matrix[y][x]) continue;
        drawCell(target, ox + x, oy + y, COLORS[piece.type], 1, size);
      }
    }
  }

  function loop(ts) {
    if (state.playing && !state.paused) {
      const dt = ts - state.lastTs;
      state.lastTs = ts;
      state.acc += dt;
      if (state.acc >= state.dropMs) {
        if (!tryMove(0, 1)) lockPiece();
        state.acc = 0;
      }
    }
    drawBoard();
    drawMini(nextCtx, state.next);
    drawMini(holdCtx, state.hold);
    touchHoldBtn.classList.toggle("is-used", !state.canHold);
    pauseBtn.classList.toggle("is-paused", state.paused);
    state.anim = requestAnimationFrame(loop);
  }

  function onKey(e) {
    const key = e.key;
    if (key === "Enter") {
      if (!state.playing || state.over) startGame();
      return;
    }
    if (key === "p" || key === "P" || key === "Escape") {
      if (state.playing) pauseGame();
      return;
    }
    if (!state.playing || state.paused || state.over) return;

    const map = {
      ArrowLeft: () => tryMove(-1, 0),
      ArrowRight: () => tryMove(1, 0),
      ArrowDown: () => drop(),
      ArrowUp: () => tryRotate(1),
      x: () => tryRotate(1),
      X: () => tryRotate(1),
      z: () => tryRotate(-1),
      Z: () => tryRotate(-1),
      " ": () => hardDrop(),
      c: () => holdPiece(),
      C: () => holdPiece(),
      Shift: () => holdPiece(),
    };
    if (map[key]) {
      e.preventDefault();
      map[key]();
    }
  }

  startBtn.addEventListener("click", () => {
    if (state.paused) pauseGame();
    else startGame();
  });
  document.addEventListener("keydown", onKey);

  function canAct() {
    return state.playing && !state.paused && !state.over;
  }

  function bindRepeat(el, action, delay = 220, rate = 70) {
    let timeout = null;
    let interval = null;
    const fire = () => {
      if (canAct()) action();
    };
    const start = (e) => {
      e.preventDefault();
      fire();
      el.classList.add("is-active");
      timeout = setTimeout(() => {
        interval = setInterval(fire, rate);
      }, delay);
    };
    const stop = () => {
      clearTimeout(timeout);
      clearInterval(interval);
      el.classList.remove("is-active");
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointerleave", stop);
    el.addEventListener("pointercancel", stop);
  }

  function bindTap(el, action, guarded = true) {
    const start = (e) => {
      e.preventDefault();
      if (!guarded || canAct()) action();
      el.classList.add("is-active");
    };
    const stop = () => el.classList.remove("is-active");
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointerleave", stop);
    el.addEventListener("pointercancel", stop);
  }

  const touchHoldBtn = document.getElementById("tc-hold");
  const pauseBtn = document.getElementById("pause-btn");

  bindRepeat(document.getElementById("tc-left"), () => tryMove(-1, 0));
  bindRepeat(document.getElementById("tc-right"), () => tryMove(1, 0));
  bindRepeat(document.getElementById("tc-down"), () => drop());
  bindTap(document.getElementById("tc-rotate"), () => tryRotate(1));
  bindTap(touchHoldBtn, () => holdPiece());
  bindTap(document.getElementById("tc-drop"), () => hardDrop());
  bindTap(pauseBtn, () => pauseGame(), false);

  drawBoard();
  state.anim = requestAnimationFrame(loop);
})();
