import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COINS_TO_NAIRA_RATE, NAIRA_PER_UNIT, getCoinsPerLine, getLevelUpBonus } from "../utils/theme";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface Transaction {
  id: string;
  type: "earn" | "withdraw" | "bonus";
  coins: number;
  naira?: number;
  description: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
}

export interface GameStats {
  highScore: number;
  highestLevel: number;
  totalLinesCleared: number;
  totalGamesPlayed: number;
  totalCoinsEarned: number;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Coins & Wallet
  coinBalance: number;
  transactions: Transaction[];

  // Game progress
  currentLevel: number;
  stats: GameStats;

  // Leaderboard cache
  leaderboard: { name: string; level: number; coins: number }[];

  // Actions — Auth
  login: (user: User) => void;
  logout: () => void;
  updateBankDetails: (details: Partial<User>) => void;

  // Actions — Coins
  addCoins: (amount: number, description: string) => void;
  withdrawCoins: (coins: number) => Promise<boolean>;

  // Actions — Game
  setLevel: (level: number) => void;
  updateStats: (patch: Partial<GameStats>) => void;
  onGameEnd: (score: number, level: number, linesCleared: number, coinsEarned: number) => void;

  // Persist
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  coinBalance: 0,
  transactions: [],
  currentLevel: 1,
  stats: {
    highScore: 0,
    highestLevel: 0,
    totalLinesCleared: 0,
    totalGamesPlayed: 0,
    totalCoinsEarned: 0,
  },
  leaderboard: [
    { name: "ChiefAdekunle", level: 87430, coins: 2340000 },
    { name: "LagosGrinder",  level: 65210, coins: 1870000 },
    { name: "AbujaBoss",     level: 54000, coins: 1540000 },
    { name: "PH_Legend",     level: 42100, coins: 1200000 },
    { name: "KanoKing",      level: 31500, coins:  950000 },
  ],

  login: (user) => {
    set({ user, isAuthenticated: true });
    get().saveToStorage();
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateBankDetails: (details) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, ...details };
    set({ user: updated });
    get().saveToStorage();
  },

  addCoins: (amount, description) => {
    const tx: Transaction = {
      id: Date.now().toString(),
      type: "earn",
      coins: amount,
      description,
      timestamp: Date.now(),
      status: "completed",
    };
    set((state) => ({
      coinBalance: state.coinBalance + amount,
      transactions: [tx, ...state.transactions].slice(0, 200),
      stats: {
        ...state.stats,
        totalCoinsEarned: state.stats.totalCoinsEarned + amount,
      },
    }));
    get().saveToStorage();
  },

  withdrawCoins: async (coins) => {
    const state = get();
    if (coins > state.coinBalance) return false;
    if (!state.user?.accountNumber) return false;

    const naira = (coins / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT;
    const tx: Transaction = {
      id: Date.now().toString(),
      type: "withdraw",
      coins,
      naira,
      description: `Withdrawal → ₦${naira.toLocaleString()} to ${state.user.bankName}`,
      timestamp: Date.now(),
      status: "pending",
    };
    set((state) => ({
      coinBalance: state.coinBalance - coins,
      transactions: [tx, ...state.transactions].slice(0, 200),
    }));
    get().saveToStorage();

    // Simulate processing (in production: call Paystack/Flutterwave API)
    setTimeout(() => {
      set((s) => ({
        transactions: s.transactions.map((t) =>
          t.id === tx.id ? { ...t, status: "completed" } : t
        ),
      }));
    }, 3000);

    return true;
  },

  setLevel: (level) => set({ currentLevel: level }),

  updateStats: (patch) =>
    set((state) => ({ stats: { ...state.stats, ...patch } })),

  onGameEnd: (score, level, linesCleared, coinsEarned) => {
    const state = get();
    const newStats: GameStats = {
      highScore: Math.max(state.stats.highScore, score),
      highestLevel: Math.max(state.stats.highestLevel, level),
      totalLinesCleared: state.stats.totalLinesCleared + linesCleared,
      totalGamesPlayed: state.stats.totalGamesPlayed + 1,
      totalCoinsEarned: state.stats.totalCoinsEarned + coinsEarned,
    };
    set({ stats: newStats });
    if (coinsEarned > 0) {
      get().addCoins(coinsEarned, `Game ended at Level ${level}`);
    }
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem("tetrisearn_state");
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          user: saved.user || null,
          isAuthenticated: !!saved.user,
          coinBalance: saved.coinBalance || 0,
          transactions: saved.transactions || [],
          stats: saved.stats || get().stats,
          currentLevel: saved.currentLevel || 1,
        });
      }
    } catch (e) {
      console.log("Storage load error:", e);
    }
  },

  saveToStorage: async () => {
    try {
      const { user, coinBalance, transactions, stats, currentLevel } = get();
      await AsyncStorage.setItem(
        "tetrisearn_state",
        JSON.stringify({ user, coinBalance, transactions, stats, currentLevel })
      );
    } catch (e) {
      console.log("Storage save error:", e);
    }
  },
}));

// Coin calculation helpers (re-exported for game screen)
export { getCoinsPerLine, getLevelUpBonus };
