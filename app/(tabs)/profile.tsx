import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../../src/store/appStore";
import { COLORS, SPACING, RADIUS, getChallengeMode, COINS_TO_NAIRA_RATE, NAIRA_PER_UNIT, CHALLENGE_MODES } from "../../src/utils/theme";

export default function ProfileScreen() {
  const { user, stats, coinBalance, logout } = useAppStore((s) => ({
    user: s.user,
    stats: s.stats,
    coinBalance: s.coinBalance,
    logout: s.logout,
  }));

  const mode = getChallengeMode(stats.highestLevel || 0);
  const nextMode = CHALLENGE_MODES.find((m) => m.from > (stats.highestLevel || 0));
  const nairaTotal = Math.floor((stats.totalCoinsEarned / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);
  const levelsToNext = nextMode ? nextMode.from - (stats.highestLevel || 0) : 0;

  const handleLogout = () => {
    Alert.alert("Log out?", "Your progress is saved.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { borderColor: mode.color }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "P"}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || "Player"}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={[styles.modeBadge, { borderColor: mode.color }]}>
            <Text style={[styles.modeText, { color: mode.color }]}>{mode.icon} {mode.label}</Text>
          </View>
        </View>

        {/* Progress to next mode */}
        {nextMode && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next: {nextMode.icon} {nextMode.label}</Text>
              <Text style={styles.progressLevel}>Lv {nextMode.from.toLocaleString()}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, ((stats.highestLevel || 0) / nextMode.from) * 100)}%`,
                    backgroundColor: nextMode.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>{levelsToNext.toLocaleString()} levels to go</Text>
          </View>
        )}

        {/* Lifetime stats */}
        <Text style={styles.sectionTitle}>Lifetime Stats</Text>
        <View style={styles.statsGrid}>
          {[
            { label: "Highest Level", value: (stats.highestLevel || 0).toLocaleString(), icon: "📈", color: mode.color },
            { label: "High Score", value: (stats.highScore || 0).toLocaleString(), icon: "⭐", color: COLORS.nairaGold },
            { label: "Lines Cleared", value: (stats.totalLinesCleared || 0).toLocaleString(), icon: "✅", color: COLORS.emerald },
            { label: "Games Played", value: (stats.totalGamesPlayed || 0).toLocaleString(), icon: "🎮", color: COLORS.neonCyan },
            { label: "Coins Earned", value: (stats.totalCoinsEarned || 0).toLocaleString(), icon: "🪙", color: COLORS.nairaGold },
            { label: "Naira Earned", value: `₦${nairaTotal.toLocaleString()}`, icon: "💰", color: COLORS.nairaGold },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* All challenge modes */}
        <Text style={styles.sectionTitle}>Challenge Mode Tiers</Text>
        <View style={styles.tiersCard}>
          {CHALLENGE_MODES.map((m) => {
            const reached = (stats.highestLevel || 0) >= m.from;
            return (
              <View key={m.from} style={[styles.tierRow, reached && styles.tierReached]}>
                <Text style={styles.tierIcon}>{m.icon}</Text>
                <View style={styles.tierInfo}>
                  <Text style={[styles.tierName, { color: reached ? m.color : COLORS.textMuted }]}>{m.label}</Text>
                  <Text style={styles.tierLevel}>Level {m.from.toLocaleString()}+</Text>
                </View>
                {reached && <Text style={styles.tierCheck}>✓</Text>}
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TetrisEarn v1.0 · Made in Nigeria 🇳🇬</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.void },
  content: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.md },
  profileHeader: { alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  avatarText: { fontSize: 36, fontWeight: "900", color: COLORS.textPrimary },
  userName: { fontSize: 24, fontWeight: "900", color: COLORS.textPrimary },
  userPhone: { color: COLORS.textMuted, fontSize: 14 },
  modeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 2,
  },
  modeText: { fontWeight: "800", fontSize: 14, letterSpacing: 1 },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 14 },
  progressLevel: { color: COLORS.textMuted, fontSize: 13 },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.elevated,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSub: { color: COLORS.textMuted, fontSize: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  statCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: "center", fontWeight: "600" },
  tiersCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    opacity: 0.5,
    paddingVertical: 4,
  },
  tierReached: { opacity: 1 },
  tierIcon: { fontSize: 20, width: 28, textAlign: "center" },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 14, fontWeight: "800" },
  tierLevel: { color: COLORS.textMuted, fontSize: 11 },
  tierCheck: { color: COLORS.emerald, fontSize: 16, fontWeight: "900" },
  logoutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginTop: SPACING.sm,
  },
  logoutText: { color: COLORS.danger, fontWeight: "800", fontSize: 16 },
  version: { color: COLORS.textMuted, fontSize: 12, textAlign: "center" },
});
