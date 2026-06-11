// TetrisEarn Game Engine
// Supports 1–1,000,000 levels with dynamic difficulty per 1000-level bracket

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type CellColor = string | null;
export type Board = CellColor[][];

// Tetromino definitions
export const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#00F5FF",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFE600",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#BF00FF",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00FF6A",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#FF2D55",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0A7EFF",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#FF6B00",
  },
};

// Extra pieces unlocked at challenge modes
export const ADVANCED_TETROMINOES = {
  PLUS: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "#F5A623",
    unlocksAt: 5000,
  },
  U: {
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: "#00C853",
    unlocksAt: 10000,
  },
};

export type TetrominoKey = keyof typeof TETROMINOES;

export interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
  type: string;
}

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const randomPiece = (level: number): Piece => {
  const keys = Object.keys(TETROMINOES) as TetrominoKey[];
  // Unlock advanced pieces at milestones
  let pool: string[] = [...keys];
  if (level >= 5000) pool.push("PLUS");
  if (level >= 10000) pool.push("U");

  const key = pool[Math.floor(Math.random() * pool.length)];
  const template =
    key === "PLUS"
      ? ADVANCED_TETROMINOES.PLUS
      : key === "U"
      ? ADVANCED_TETROMINOES.U
      : TETROMINOES[key as TetrominoKey];

  return {
    shape: template.shape,
    color: template.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(template.shape[0].length / 2),
    y: 0,
    type: key,
  };
};

export const rotatePiece = (piece: Piece): Piece => {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated = Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => piece.shape[rows - 1 - r][c])
  );
  return { ...piece, shape: rotated };
};

export const isValidPosition = (
  board: Board,
  piece: Piece,
  offsetX = 0,
  offsetY = 0
): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const newX = piece.x + c + offsetX;
      const newY = piece.y + r + offsetY;
      if (newX < 0 || newX >= BOARD_WIDTH) return false;
      if (newY >= BOARD_HEIGHT) return false;
      if (newY >= 0 && board[newY][newX] !== null) return false;
    }
  }
  return true;
};

export const placePiece = (board: Board, piece: Piece): Board => {
  const newBoard = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0) newBoard[y][x] = piece.color;
      }
    }
  }
  return newBoard;
};

export const clearLines = (
  board: Board
): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  const emptyRows = Array.from({ length: linesCleared }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
  return { newBoard: [...emptyRows, ...newBoard], linesCleared };
};

// Ghost piece — shows where piece will land
export const getGhostPiece = (board: Board, piece: Piece): Piece => {
  let ghost = { ...piece };
  while (isValidPosition(board, ghost, 0, 1)) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  return ghost;
};

// Drop interval in ms based on level (1–1,000,000)
// Caps at 80ms at level ~2000, then stays fast
export const getDropInterval = (level: number): number => {
  const bracket = Math.floor(level / 1000);
  if (bracket === 0) return Math.max(800 - level * 0.7, 200);
  if (bracket < 3)   return 180;
  if (bracket < 5)   return 130;
  if (bracket < 10)  return 100;
  return 80; // max speed — pure reflex territory
};

// Score calculation
export const calcScore = (linesCleared: number, level: number): number => {
  const base = [0, 100, 300, 500, 800];
  return (base[linesCleared] || 800) * (1 + Math.floor(level / 100));
};

// Lines needed to advance a level
export const linesForNextLevel = (level: number): number => {
  return Math.min(10 + Math.floor(level / 100), 40);
};

// Challenge mode special rules per 1000-level bracket
export interface ChallengeRules {
  invisibleRows: boolean;     // top rows go invisible
  garbageLines: boolean;      // random garbage lines added
  narrowBoard: boolean;       // board shrinks to 8 wide
  doubleSpeed: boolean;       // piece spawns 2 at once feeling
  mirrorControls: boolean;    // left/right swapped
  darkMode: boolean;          // board flashes dark randomly
  earthquakeMode: boolean;    // board shakes
}

export const getChallengeRules = (level: number): ChallengeRules => {
  const bracket = Math.floor(level / 1000);
  return {
    invisibleRows:  bracket >= 3,
    garbageLines:   bracket >= 4,
    narrowBoard:    false, // future implementation
    doubleSpeed:    false,
    mirrorControls: bracket >= 7,
    darkMode:       bracket >= 10,
    earthquakeMode: bracket >= 50,
  };
};
