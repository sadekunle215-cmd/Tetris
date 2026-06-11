import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../../src/store/appStore";
import { COLORS, SPACING, RADIUS, COINS_TO_NAIRA_RATE, NAIRA_PER_UNIT, getChallengeMode } from "../../src/utils/theme";

export default function HomeScreen() {
  const { user, coinBalance, stats } = useAppStore((s) => ({
    user: s.user,
    coinBalance: s.coinBalance,
    stats: s.stats,
  }));

  const nairaValue = Math.floor((coinBalance / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);
  const mode = getChallengeMode(stats.highestLevel);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.name}>{user?.name || "Player"}</Text>
          </View>
          <View style={[styles.modeBadge, { borderColor: mode.color }]}>
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text style={[styles.modeLabel, { color: mode.color }]}>{mode.label}</Text>
          </View>
        </View>

        {/* Coin balance card */}
        <LinearGradient
          colors={["#1A1500", "#2A2000"]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Coin Balance</Text>
              <Text style={styles.balanceCoins}>{coinBalance.toLocaleString()}</Text>
              <Text style={styles.balanceNaira}>≈ ₦{nairaValue.toLocaleString()}</Text>
            </View>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => router.push("/(tabs)/wallet")}
          >
            <Text style={styles.withdrawText}>Withdraw Naira →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Play button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => router.push("/game")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.neonCyan, "#0088CC"]}
            style={styles.playGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.playIcon}>▶</Text>
            <View>
              <Text style={styles.playText}>PLAY NOW</Text>
              <Text style={styles.playSubtext}>Continue from Level {(stats.highestLevel || 1).toLocaleString()}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Highest Level" value={(stats.highestLevel || 0).toLocaleString()} icon="📈" />
          <StatCard label="High Score" value={(stats.highScore || 0).toLocaleString()} icon="⭐" />
          <StatCard label="Lines Cleared" value={(stats.totalLinesCleared || 0).toLocaleString()} icon="✅" />
          <StatCard label="Games Played" value={(stats.totalGamesPlayed || 0).toLocaleString()} icon="🎮" />
        </View>

        {/* Challenge mode progress */}
        <Text style={styles.sectionTitle}>Challenge Mode Progress</Text>
        <View style={styles.challengeCard}>
          <Text style={styles.challengeText}>
            Every <Text style={{ color: COLORS.nairaGold }}>1,000 levels</Text> = new challenge mode with harder rules and <Text style={{ color: COLORS.nairaGold }}>bigger coin rewards</Text>
          </Text>
          <View style={styles.modeList}>
            {[
              { level: "1",       label: "Rookie 🎮",         color: "#8888BB" },
              { level: "1,000",   label: "Street ⚡",          color: "#00F5FF" },
              { level: "5,000",   label: "Legend 👑",          color: "#BF00FF" },
              { level: "10,000",  label: "God Mode 🌋",        color: "#FF2D55" },
              { level: "100,000", label: "Immortal ♾️",        color: "#00F5FF" },
              { level: "1,000,000", label: "TetrisEarn God 🏆", color: "#F5A623" },
            ].map((m) => (
              <View key={m.level} style={styles.modeRow}>
                <Text style={[styles.modeRowLevel, { color: m.color }]}>Lv {m.level}</Text>
                <Text style={styles.modeRowLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Earn guide */}
        <Text style={styles.sectionTitle}>How You Earn</Text>
        <View style={styles.earnCard}>
          {[
            ["Clear 1 line", "5 coins"],
            ["Tetris (4 lines)", "30 coins"],
            ["Reach Level 1,000", "2,000 bonus coins"],
            ["Reach Level 10,000", "20,000 bonus coins"],
            ["Daily login", "10 coins"],
          ].map(([action, reward]) => (
            <View key={action} style={styles.earnRow}>
              <Text style={styles.earnAction}>{action}</Text>
              <Text style={styles.earnReward}>+{reward}</Text>
            </View>
          ))}
          <View style={styles.rateRow}>
            <Text style={styles.rateText}>1,000 coins = ₦50</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  icon: { fontSize: 22 },
  value: { fontSize: 18, fontWeight: "900", color: COLORS.textPrimary },
  label: { fontSize: 10, color: COLORS.textMuted, textAlign: "center", fontWeight: "600" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.void },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.md },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: COLORS.textMuted, fontSize: 13 },
  name: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  modeIcon: { fontSize: 14 },
  modeLabel: { fontSize: 11, fontWeight: "800" },
  balanceCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.nairaGoldDim,
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  balanceCoins: { fontSize: 36, fontWeight: "900", color: COLORS.nairaGold, letterSpacing: 1 },
  balanceNaira: { color: COLORS.textSecondary, fontSize: 15, fontWeight: "600" },
  coinEmoji: { fontSize: 48 },
  withdrawBtn: {
    marginTop: SPACING.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.nairaGold,
    alignSelf: "flex-start",
  },
  withdrawText: { color: COLORS.nairaGold, fontWeight: "700", fontSize: 13 },
  playBtn: { borderRadius: RADIUS.lg, overflow: "hidden" },
  playGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  playIcon: { fontSize: 32, color: COLORS.void },
  playText: { fontSize: 22, fontWeight: "900", color: COLORS.void, letterSpacing: 2 },
  playSubtext: { fontSize: 12, color: "rgba(0,0,0,0.6)", fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase" },
  statsGrid: { flexDirection: "row", gap: SPACING.sm },
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  challengeText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  modeList: { gap: 8 },
  modeRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  modeRowLevel: { fontSize: 13, fontWeight: "800", width: 80 },
  modeRowLabel: { fontSize: 13, color: COLORS.textSecondary },
  earnCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  earnRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  earnAction: { color: COLORS.textSecondary, fontSize: 14 },
  earnReward: { color: COLORS.nairaGold, fontWeight: "800", fontSize: 14 },
  rateRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  rateText: { color: COLORS.nairaGold, fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});
