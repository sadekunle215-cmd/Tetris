import { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../src/store/appStore";
import { COLORS, SPACING } from "../src/utils/theme";

export default function SplashScreen() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <LinearGradient colors={[COLORS.void, "#0D0D2B", COLORS.void]} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        {/* Tetris piece grid decoration */}
        <View style={styles.pieceGrid}>
          {["#00F5FF", "#BF00FF", "#FFE600", "#FF6B00"].map((c, i) => (
            <View key={i} style={[styles.miniBlock, { backgroundColor: c }]} />
          ))}
        </View>

        <Text style={styles.logo}>TETRIS</Text>
        <Text style={styles.logoAccent}>EARN</Text>
        <Text style={styles.tagline}>Play. Level Up. Get Paid.</Text>

        <View style={styles.nairaTag}>
          <Text style={styles.nairaText}>₦ Naira Rewards</Text>
        </View>
      </Animated.View>

      <Text style={styles.footer}>TetrisEarn v1.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  pieceGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: SPACING.md,
  },
  miniBlock: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  logo: {
    fontSize: 56,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 8,
  },
  logoAccent: {
    fontSize: 56,
    fontWeight: "900",
    color: COLORS.nairaGold,
    letterSpacing: 8,
    marginTop: -16,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: SPACING.sm,
  },
  nairaTag: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.nairaGold,
  },
  nairaText: {
    color: COLORS.nairaGold,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
