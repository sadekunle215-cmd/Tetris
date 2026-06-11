# 🎮 TetrisEarn — Play-to-Earn Tetris App

A Nigerian mobile app where users earn Naira by playing Tetris up to **Level 1,000,000**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Install & Run
```bash
cd TetrisEarn
npm install
npx expo start
```
Scan the QR code with Expo Go — the app runs instantly on your phone.

---

## 📁 Project Structure

```
TetrisEarn/
├── app/
│   ├── _layout.tsx          # Root navigation layout
│   ├── index.tsx            # Splash screen → routes to auth/tabs
│   ├── game.tsx             # Full-screen Tetris game
│   ├── (auth)/
│   │   ├── login.tsx        # Phone + OTP login
│   │   └── register.tsx     # New user registration
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar with 5 tabs
│       ├── index.tsx        # Home dashboard
│       ├── game.tsx         # Game tab (redirects to /game)
│       ├── wallet.tsx       # Coin wallet + Naira withdrawal
│       ├── leaderboard.tsx  # Top players + prize pool
│       └── profile.tsx      # User stats + settings
├── src/
│   ├── game/
│   │   └── engine.ts        # Full Tetris engine (pieces, board, physics)
│   ├── store/
│   │   └── appStore.ts      # Zustand global state
│   └── utils/
│       └── theme.ts         # Design tokens, colors, level system
```

---

## 🎮 Game System

### Level Progression (1 → 1,000,000)
- Every **10 lines cleared** → advance one level (scales harder at higher levels)
- Every **1,000 levels** = new **Challenge Mode** with special rules:
  - **Street (1,000)** — faster pieces
  - **Hustle (2,000)** — even faster
  - **Legend (5,000)** — Mirror controls unlock
  - **God Mode (10,000)** — Invisible top rows
  - **Immortal (100,000)** — Garbage lines added
  - **TetrisEarn God (1,000,000)** — The ultimate tier

### Special Pieces
- Levels 1–4,999: Standard 7 Tetrominoes
- Level 5,000+: PLUS piece unlocked (+4 shape)
- Level 10,000+: U piece unlocked

---

## 💰 Coin & Naira System

| Action | Coins |
|--------|-------|
| Clear 1 line | 5 coins |
| Clear 4 lines (Tetris) | 30 coins |
| Level up | 10 coins |
| Every 100 levels | 50 bonus coins |
| Every 1,000 levels (Challenge) | level × 2 coins |

**Conversion Rate:** 1,000 coins = ₦50

**Minimum Withdrawal:** 5,000 coins (= ₦250)

---

## 🔧 Integrations to Add

### 1. OTP Authentication
Replace the mock OTP in `(auth)/login.tsx` with:
- **Termii** (Nigerian SMS OTP): https://termii.com
- **Twilio Verify**

### 2. Payment (Naira Withdrawals)
In `src/store/appStore.ts → withdrawCoins()`, replace the mock with:
- **Paystack Transfer API**: https://paystack.com/docs/transfers
- **Flutterwave Transfer**: https://developer.flutterwave.com

```typescript
// Example: Paystack Transfer
const response = await fetch("https://api.paystack.co/transfer", {
  method: "POST",
  headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  body: JSON.stringify({
    source: "balance",
    amount: nairaAmount * 100, // kobo
    recipient: recipientCode,
    reason: "TetrisEarn withdrawal",
  }),
});
```

### 3. Backend / Database
- **Firebase** (easiest): Auth + Firestore for user data
- **Supabase**: PostgreSQL + Auth
- Store: users, coin balances, transactions, leaderboard

### 4. Anti-Cheat
- Validate coin calculations server-side
- Store game sessions with timestamps
- Rate-limit withdrawal requests

---

## 🎨 Design System

**Palette:**
- `#0A0A1A` — Deep void background
- `#F5A623` — Naira Gold (primary accent)
- `#00F5FF` — Neon Cyan (I-piece, CTA)
- `#BF00FF` — Neon Purple (T-piece)
- `#00FF6A` — Neon Green (S-piece)

**Signature element:** Neon Tetris pieces used as decorative elements throughout the UI — not just in the game, but as color-coded identity markers.

---

## 📱 Publishing

### Android (Google Play)
```bash
npx expo build:android
# or with EAS
eas build --platform android
```

### iOS (App Store)
```bash
eas build --platform ios
```

---

## ⚖️ Legal Notes

- Ensure compliance with **CBN regulations** for fintech apps in Nigeria
- Add **Terms of Service** and **Privacy Policy** screens
- Consider obtaining a **FCCPC** registration if handling user funds
- 18+ age verification required for cash withdrawal features

---

Built with ❤️ in Nigeria 🇳🇬
