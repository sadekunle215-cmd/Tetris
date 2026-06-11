import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../../src/store/appStore";
import { COLORS, SPACING, RADIUS, getChallengeMode, COINS_TO_NAIRA_RATE, NAIRA_PER_UNIT } from "../../src/utils/theme";

export default function LeaderboardScreen() {
  const { leaderboard, user, stats, coinBalance } = useAppStore((s) => ({
    leaderboard: s.leaderboard,
    user: s.user,
    stats: s.stats,
    coinBalance: s.coinBalance,
  }));

  const myNaira = Math.floor((coinBalance / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Leaderboard 🏆</Text>
        <Text style={styles.subtitle}>Top earners this month</Text>

        {/* My rank card */}
        <View style={styles.myCard}>
          <View style={styles.myLeft}>
            <Text style={styles.myRank}>#?</Text>
            <View>
              <Text style={styles.myName}>{user?.name || "You"} <Text style={styles.youTag}>(You)</Text></Text>
              <Text style={styles.myLevel}>Level {(stats.highestLevel || 1).toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.myRight}>
            <Text style={styles.myCoins}>{coinBalance.toLocaleString()} coins</Text>
            <Text style={styles.myNaira}>≈ ₦{myNaira.toLocaleString()}</Text>
          </View>
        </View>

        {/* Prizes */}
        <View style={styles.prizeBanner}>
          <Text style={styles.prizeTitle}>Monthly Prize Pool</Text>
          <View style={styles.prizes}>
            {[
              { rank: "🥇 1st", prize: "₦500,000" },
              { rank: "🥈 2nd", prize: "₦200,000" },
              { rank: "🥉 3rd", prize: "₦100,000" },
              { rank: "4–10th", prize: "₦20,000" },
            ].map((p) => (
              <View key={p.rank} style={styles.prizeRow}>
                <Text style={styles.prizeRank}>{p.rank}</Text>
                <Text style={styles.prizeAmount}>{p.prize}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top players */}
        {leaderboard.map((player, i) => {
          const mode = getChallengeMode(player.level);
          const naira = Math.floor((player.coins / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <View key={i} style={[styles.playerRow, i === 0 && styles.topPlayer]}>
              <Text style={styles.rankNum}>{medals[i] || `#${i + 1}`}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.playerMeta}>
                  <Text style={[styles.playerMode, { color: mode.color }]}>{mode.icon} {mode.label}</Text>
                  <Text style={styles.playerLevel}>Lv {player.level.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.playerRight}>
                <Text style={styles.playerCoins}>{player.coins.toLocaleString()}</Text>
                <Text style={styles.playerNaira}>₦{naira.toLocaleString()}</Text>
              </View>
            </View>
          );
        })}

        <Text style={styles.footerNote}>
          Leaderboard resets monthly. Keep playing to climb the ranks and win real Naira prizes! 💪
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.void },
  content: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.md },
  pageTitle: { fontSize: 28, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: 1 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: -8 },
  myCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.neonCyan,
  },
  myLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  myRank: { fontSize: 28, fontWeight: "900", color: COLORS.textMuted },
  myName: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  youTag: { color: COLORS.neonCyan, fontSize: 12 },
  myLevel: { color: COLORS.textMuted, fontSize: 12 },
  myRight: { alignItems: "flex-end" },
  myCoins: { color: COLORS.nairaGold, fontWeight: "800", fontSize: 15 },
  myNaira: { color: COLORS.textMuted, fontSize: 12 },
  prizeBanner: {
    backgroundColor: "#1A1500",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.nairaGoldDim,
    gap: SPACING.sm,
  },
  prizeTitle: { fontSize: 15, fontWeight: "800", color: COLORS.nairaGold, letterSpacing: 1 },
  prizes: { gap: 8 },
  prizeRow: { flexDirection: "row", justifyContent: "space-between" },
  prizeRank: { color: COLORS.textSecondary, fontSize: 14 },
  prizeAmount: { color: COLORS.nairaGold, fontWeight: "900", fontSize: 14 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topPlayer: { borderColor: COLORS.nairaGold, backgroundColor: "#1A1500" },
  rankNum: { fontSize: 24, width: 36, textAlign: "center" },
  playerInfo: { flex: 1, gap: 3 },
  playerName: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary },
  playerMeta: { flexDirection: "row", gap: SPACING.sm, alignItems: "center" },
  playerMode: { fontSize: 11, fontWeight: "700" },
  playerLevel: { color: COLORS.textMuted, fontSize: 11 },
  playerRight: { alignItems: "flex-end" },
  playerCoins: { color: COLORS.nairaGold, fontWeight: "800", fontSize: 14 },
  playerNaira: { color: COLORS.textMuted, fontSize: 11 },
  footerNote: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
});
