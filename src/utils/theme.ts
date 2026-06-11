// TetrisEarn Design System
// Aesthetic: Deep space arcade — dark void background, neon Tetris pieces, 
// Naira-gold accents. Nigerian fintech energy meets retro gaming.

export const COLORS = {
  // Backgrounds
  void: "#0A0A1A",        // near-black deep space
  surface: "#12122A",     // card/panel background
  elevated: "#1A1A3A",    // modals, elevated panels

  // Neon Tetris Piece Colors (classic + vivid)
  neonCyan:   "#00F5FF",  // I-piece
  neonYellow: "#FFE600",  // O-piece
  neonPurple: "#BF00FF",  // T-piece
  neonGreen:  "#00FF6A",  // S-piece
  neonRed:    "#FF2D55",  // Z-piece
  neonBlue:   "#0A7EFF",  // J-piece
  neonOrange: "#FF6B00",  // L-piece

  // Brand
  nairaGold:  "#F5A623",  // Naira accent — primary reward color
  nairaGoldDim: "#7A5010",
  emerald:    "#00C853",  // success / earnings confirmed

  // Text
  textPrimary:   "#FFFFFF",
  textSecondary: "#8888BB",
  textMuted:     "#44446A",

  // UI
  border:    "#22224A",
  danger:    "#FF2D55",
  overlay:   "rgba(0,0,0,0.75)",
};

export const FONTS = {
  // Display: bold pixel-adjacent feel (use fontWeight 900 + letterSpacing)
  display: "System",
  body: "System",
  mono: "System",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const SHADOWS = {
  neonCyan: {
    shadowColor: "#00F5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  gold: {
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  purple: {
    shadowColor: "#BF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
};

// Challenge Modes — every 1000 levels
export const CHALLENGE_MODES = [
  { from: 1,       label: "Rookie",       color: "#8888BB", icon: "🎮" },
  { from: 1000,    label: "Street",       color: "#00F5FF", icon: "⚡" },
  { from: 2000,    label: "Hustle",       color: "#00FF6A", icon: "🔥" },
  { from: 3000,    label: "Grind",        color: "#FFE600", icon: "💎" },
  { from: 4000,    label: "Beast",        color: "#FF6B00", icon: "🦁" },
  { from: 5000,    label: "Legend",       color: "#BF00FF", icon: "👑" },
  { from: 10000,   label: "God Mode",     color: "#FF2D55", icon: "🌋" },
  { from: 50000,   label: "Ascended",     color: "#F5A623", icon: "✨" },
  { from: 100000,  label: "Immortal",     color: "#00F5FF", icon: "♾️" },
  { from: 500000,  label: "Millionaire",  color: "#F5A623", icon: "💰" },
  { from: 999000,  label: "TetrisEarn God", color: "#FFFFFF", icon: "🏆" },
];

export const getChallengeMode = (level: number) => {
  let mode = CHALLENGE_MODES[0];
  for (const m of CHALLENGE_MODES) {
    if (level >= m.from) mode = m;
  }
  return mode;
};

// Coin reward formula per level bracket
export const getCoinsPerLine = (level: number): number => {
  if (level < 1000)    return 5;
  if (level < 5000)    return 10;
  if (level < 10000)   return 20;
  if (level < 50000)   return 50;
  if (level < 100000)  return 100;
  if (level < 500000)  return 250;
  return 500; // 500k+
};

export const getLevelUpBonus = (level: number): number => {
  if (level % 1000 === 0) return level * 2;   // challenge mode milestone
  if (level % 100 === 0)  return level / 2;
  if (level % 10 === 0)   return 50;
  return 10;
};

// Naira conversion
export const COINS_TO_NAIRA_RATE = 1000; // 1000 coins = ₦50
export const NAIRA_PER_UNIT = 50;
export const MIN_WITHDRAWAL = 5000; // 5000 coins minimum
