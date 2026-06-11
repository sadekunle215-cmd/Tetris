import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Alert, Vibration
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore, getCoinsPerLine, getLevelUpBonus } from "../../src/store/appStore";
import {
  BOARD_WIDTH, BOARD_HEIGHT, Board, Piece,
  createEmptyBoard, randomPiece, rotatePiece,
  isValidPosition, placePiece, clearLines, getGhostPiece,
  getDropInterval, calcScore, linesForNextLevel, getChallengeRules
} from "../../src/game/engine";
import { COLORS, SPACING, RADIUS, getChallengeMode } from "../../src/utils/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CELL_SIZE = Math.floor((SCREEN_W - 48 - 100) / BOARD_WIDTH);

type GameStatus = "idle" | "playing" | "paused" | "gameover";

export default function GameScreen() {
  const { stats, onGameEnd } = useAppStore((s) => ({
    stats: s.stats,
    onGameEnd: s.onGameEnd,
  }));

  const startLevel = Math.max(1, stats.highestLevel);

  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(startLevel);
  const [lines, setLines] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);
  const scoreRef = useRef(score);
  const coinsRef = useRef(coinsEarned);

  boardRef.current = board;
  pieceRef.current = piece;
  levelRef.current = level;
  linesRef.current = lines;
  scoreRef.current = score;
  coinsRef.current = coinsEarned;

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 1200);
  };

  const spawnPiece = useCallback((lvl: number, nextP?: Piece | null) => {
    const p = nextP || randomPiece(lvl);
    const next = randomPiece(lvl);
    setPiece(p);
    setNextPiece(next);
    return p;
  }, []);

  const lockPiece = useCallback(() => {
    const currentPiece = pieceRef.current;
    const currentBoard = boardRef.current;
    const currentLevel = levelRef.current;
    if (!currentPiece) return;

    const newBoard = placePiece(currentBoard, currentPiece);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

    let addedScore = calcScore(linesCleared, currentLevel);
    let addedCoins = linesCleared * getCoinsPerLine(currentLevel);

    const newLines = linesRef.current + linesCleared;
    const threshold = linesForNextLevel(currentLevel);
    let newLevel = currentLevel;

    if (newLines >= threshold * Math.floor(newLines / threshold)) {
      const levelsGained = Math.floor(newLines / threshold) - Math.floor(linesRef.current / threshold);
      if (levelsGained > 0) {
        newLevel = currentLevel + levelsGained;
        const bonus = getLevelUpBonus(newLevel);
        addedCoins += bonus;
        if (newLevel % 1000 === 0) {
          showFlash(`🏆 CHALLENGE MODE! Level ${newLevel.toLocaleString()}`);
          Vibration.vibrate([100, 50, 100, 50, 200]);
        } else if (newLevel % 100 === 0) {
          showFlash(`⬆️ Level ${newLevel.toLocaleString()}! +${bonus} coins`);
        }
      }
    }

    if (linesCleared === 4) {
      showFlash("TETRIS! 🔥 +30 coins");
      Vibration.vibrate(150);
    } else if (linesCleared > 0) {
      Vibration.vibrate(50);
    }

    setBoard(clearedBoard);
    setScore((s) => s + addedScore);
    setLines(newLines);
    setLevel(newLevel);
    setCoinsEarned((c) => c + addedCoins);

    // Spawn next
    const next = randomPiece(newLevel);
    const spawning = nextPiece || next;

    if (!isValidPosition(clearedBoard, spawning)) {
      setStatus("gameover");
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => {
        onGameEnd(scoreRef.current, newLevel, newLines, coinsRef.current);
        Alert.alert(
          "Game Over",
          `Score: ${scoreRef.current.toLocaleString()}\nLevel: ${newLevel.toLocaleString()}\nCoins Earned: ${coinsRef.current.toLocaleString()} 🪙`,
          [
            { text: "Play Again", onPress: startGame },
            { text: "Home", onPress: () => router.back() },
          ]
        );
      }, 300);
      return;
    }

    setPiece(spawning);
    setNextPiece(next);
  }, [nextPiece, onGameEnd]);

  const dropPiece = useCallback(() => {
    const p = pieceRef.current;
    const b = boardRef.current;
    if (!p || !b) return;

    if (isValidPosition(b, p, 0, 1)) {
      setPiece((prev) => prev ? { ...prev, y: prev.y + 1 } : prev);
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setCoinsEarned(0);
    const lvl = Math.max(1, stats.highestLevel);
    setLevel(lvl);
    const p = randomPiece(lvl);
    const next = randomPiece(lvl);
    setPiece(p);
    setNextPiece(next);
    setStatus("playing");
  }, [stats.highestLevel]);

  useEffect(() => {
    if (status === "playing") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(dropPiece, getDropInterval(level));
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, level, dropPiece]);

  // Controls
  const moveLeft = () => {
    const rules = getChallengeRules(level);
    const dir = rules.mirrorControls ? 1 : -1;
    if (piece && isValidPosition(board, piece, dir, 0))
      setPiece((p) => p ? { ...p, x: p.x + dir } : p);
  };

  const moveRight = () => {
    const rules = getChallengeRules(level);
    const dir = rules.mirrorControls ? -1 : 1;
    if (piece && isValidPosition(board, piece, dir, 0))
      setPiece((p) => p ? { ...p, x: p.x + dir } : p);
  };

  const rotate = () => {
    if (!piece) return;
    const rotated = rotatePiece(piece);
    if (isValidPosition(board, rotated)) setPiece(rotated);
    else if (isValidPosition(board, rotated, 1, 0)) setPiece({ ...rotated, x: rotated.x + 1 });
    else if (isValidPosition(board, rotated, -1, 0)) setPiece({ ...rotated, x: rotated.x - 1 });
  };

  const hardDrop = () => {
    if (!piece) return;
    let dropped = { ...piece };
    while (isValidPosition(board, dropped, 0, 1)) dropped = { ...dropped, y: dropped.y + 1 };
    setPiece(dropped);
    setTimeout(lockPiece, 0);
  };

  const softDrop = () => {
    if (piece && isValidPosition(board, piece, 0, 1))
      setPiece((p) => p ? { ...p, y: p.y + 1 } : p);
  };

  // Render board
  const ghost = piece && status === "playing" ? getGhostPiece(board, piece) : null;
  const rules = getChallengeRules(level);
  const mode = getChallengeMode(level);
  const challengeEvery = Math.floor(level / 1000);

  const renderBoard = () => {
    const display: (string | null)[][] = board.map((row) => [...row]);
    // Draw ghost
    if (ghost) {
      for (let r = 0; r < ghost.shape.length; r++)
        for (let c = 0; c < ghost.shape[r].length; c++)
          if (ghost.shape[r][c]) {
            const y = ghost.y + r, x = ghost.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH)
              if (!display[y][x]) display[y][x] = "ghost";
          }
    }
    // Draw piece
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++)
          if (piece.shape[r][c]) {
            const y = piece.y + r, x = piece.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH)
              display[y][x] = piece.color;
          }
    }
    return display;
  };

  const displayBoard = renderBoard();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => status === "playing" ? setStatus("paused") : router.back()} style={styles.pauseBtn}>
            <Text style={styles.pauseText}>{status === "playing" ? "⏸" : "←"}</Text>
          </TouchableOpacity>
          <View style={[styles.modePill, { borderColor: mode.color }]}>
            <Text style={styles.modePillText}>{mode.icon} {mode.label}</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {coinsEarned.toLocaleString()}</Text>
          </View>
        </View>

        {/* Flash message */}
        {flashMessage && (
          <View style={styles.flash}>
            <Text style={styles.flashText}>{flashMessage}</Text>
          </View>
        )}

        {/* Game area */}
        <View style={styles.gameRow}>
          {/* Side info */}
          <View style={styles.sidePanel}>
            <Text style={styles.sideLabel}>SCORE</Text>
            <Text style={styles.sideValue}>{score.toLocaleString()}</Text>
            <Text style={styles.sideLabel}>LEVEL</Text>
            <Text style={[styles.sideValue, { color: mode.color }]}>{level.toLocaleString()}</Text>
            <Text style={styles.sideLabel}>LINES</Text>
            <Text style={styles.sideValue}>{lines.toLocaleString()}</Text>

            {rules.mirrorControls && (
              <View style={styles.ruleTag}>
                <Text style={styles.ruleText}>🪞 Mirror</Text>
              </View>
            )}
            {rules.garbageLines && (
              <View style={styles.ruleTag}>
                <Text style={styles.ruleText}>🗑️ Garbage</Text>
              </View>
            )}
          </View>

          {/* Board */}
          <View style={styles.board}>
            {displayBoard.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((cell, ci) => (
                  <View
                    key={ci}
                    style={[
                      styles.cell,
                      cell === "ghost"
                        ? styles.ghostCell
                        : cell
                        ? [styles.filledCell, { backgroundColor: cell }]
                        : styles.emptyCell,
                      // Invisible rows challenge
                      rules.invisibleRows && ri < 4 ? { opacity: 0 } : {},
                    ]}
                  />
                ))}
              </View>
            ))}
            {/* Overlay for idle/paused/gameover */}
            {status !== "playing" && (
              <View style={styles.overlay}>
                {status === "idle" && (
                  <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                    <Text style={styles.startText}>▶ START</Text>
                    <Text style={styles.startSub}>Level {startLevel.toLocaleString()}</Text>
                  </TouchableOpacity>
                )}
                {status === "paused" && (
                  <View style={styles.pauseMenu}>
                    <Text style={styles.pauseTitle}>PAUSED</Text>
                    <TouchableOpacity style={styles.startBtn} onPress={() => setStatus("playing")}>
                      <Text style={styles.startText}>▶ RESUME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
                      <Text style={{ color: COLORS.textSecondary }}>Quit Game</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Next piece panel */}
          <View style={styles.nextPanel}>
            <Text style={styles.sideLabel}>NEXT</Text>
            <View style={styles.nextBox}>
              {nextPiece?.shape.map((row, ri) => (
                <View key={ri} style={styles.nextRow}>
                  {row.map((cell, ci) => (
                    <View
                      key={ci}
                      style={[
                        styles.nextCell,
                        cell ? { backgroundColor: nextPiece.color } : styles.emptyCell,
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <CtrlBtn label="◀" onPress={moveLeft} onLongPress={moveLeft} />
            <CtrlBtn label="↻" onPress={rotate} />
            <CtrlBtn label="▶" onPress={moveRight} onLongPress={moveRight} />
          </View>
          <View style={styles.controlRow}>
            <CtrlBtn label="▼" onPress={softDrop} onLongPress={softDrop} flex />
            <CtrlBtn label="⬇ DROP" onPress={hardDrop} flex accent />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CtrlBtn({ label, onPress, onLongPress, flex, accent }: any) {
  return (
    <TouchableOpacity
      style={[ctrlStyles.btn, flex && { flex: 1 }, accent && ctrlStyles.accent]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={100}
    >
      <Text style={[ctrlStyles.label, accent && ctrlStyles.accentLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const ctrlStyles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 64,
  },
  accent: { backgroundColor: COLORS.neonCyan, borderColor: COLORS.neonCyan },
  label: { fontSize: 20, color: COLORS.textPrimary, fontWeight: "900" },
  accentLabel: { color: COLORS.void },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.void },
  container: { flex: 1, padding: SPACING.sm, gap: SPACING.sm },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pauseBtn: { padding: SPACING.sm },
  pauseText: { fontSize: 22, color: COLORS.textPrimary },
  modePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  modePillText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: "800" },
  coinBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.nairaGoldDim,
  },
  coinText: { fontSize: 12, color: COLORS.nairaGold, fontWeight: "800" },
  flash: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: COLORS.nairaGold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    zIndex: 100,
  },
  flashText: { color: COLORS.void, fontWeight: "900", fontSize: 13 },
  gameRow: { flex: 1, flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start" },
  sidePanel: { width: 64, gap: 4, paddingTop: 4 },
  sideLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: "700", letterSpacing: 1 },
  sideValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: "900", marginBottom: 8 },
  ruleTag: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ruleText: { fontSize: 9, color: COLORS.neonRed, fontWeight: "700" },
  board: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    backgroundColor: "#0A0A14",
  },
  row: { flexDirection: "row" },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.03)" },
  emptyCell: { backgroundColor: "transparent" },
  filledCell: { borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  ghostCell: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: COLORS.neonCyan,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  startText: { color: COLORS.void, fontWeight: "900", fontSize: 18, letterSpacing: 2 },
  startSub: { color: "rgba(0,0,0,0.6)", fontSize: 11, fontWeight: "600", marginTop: 2 },
  pauseMenu: { alignItems: "center", gap: SPACING.md },
  pauseTitle: { fontSize: 28, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: 4 },
  nextPanel: { width: 56, gap: 4, paddingTop: 4 },
  nextBox: { backgroundColor: COLORS.surface, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  nextRow: { flexDirection: "row" },
  nextCell: { width: 10, height: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.05)" },
  controls: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  controlRow: { flexDirection: "row", gap: SPACING.sm, justifyContent: "center" },
});
