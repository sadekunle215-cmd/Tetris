import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../../src/store/appStore";
import { COLORS, SPACING, RADIUS } from "../../src/utils/theme";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);

  const sendOtp = async () => {
    if (phone.length < 11) {
      Alert.alert("Enter a valid Nigerian phone number (e.g. 08012345678)");
      return;
    }
    setLoading(true);
    // TODO: integrate real OTP (e.g. Termii SMS API)
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    // TODO: verify with backend
    setTimeout(() => {
      setLoading(false);
      login({
        id: Date.now().toString(),
        name: "Player",
        phone,
      });
      router.replace("/(tabs)");
    }, 1000);
  };

  return (
    <LinearGradient colors={[COLORS.void, "#0D0D2B"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>TETRIS<Text style={{ color: COLORS.nairaGold }}>EARN</Text></Text>
            <Text style={styles.subtitle}>
              {step === "phone" ? "Enter your phone to start earning" : `OTP sent to ${phone}`}
            </Text>
          </View>

          {/* Piece decoration */}
          <View style={styles.decoration}>
            {["#00F5FF", "#BF00FF", "#FFE600", "#FF2D55", "#FF6B00", "#00FF6A"].map((c, i) => (
              <View key={i} style={[styles.decorBlock, { backgroundColor: c, opacity: 0.7 }]} />
            ))}
          </View>

          {/* Form */}
          <View style={styles.card}>
            {step === "phone" ? (
              <>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.prefix}>🇳🇬 +234</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="08012345678"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    maxLength={11}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={sendOtp}
                  disabled={loading}
                >
                  <Text style={styles.btnText}>{loading ? "Sending..." : "Send OTP"}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Enter 4-digit OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="- - - -"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={verifyOtp}
                  disabled={loading}
                >
                  <Text style={styles.btnText}>{loading ? "Verifying..." : "Verify & Play"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep("phone")} style={styles.backBtn}>
                  <Text style={styles.backText}>← Change number</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={styles.registerLink}>
              <Text style={styles.registerText}>New here? <Text style={{ color: COLORS.nairaGold }}>Create account</Text></Text>
            </TouchableOpacity>
          </View>

          {/* Earnings teaser */}
          <View style={styles.teaser}>
            <Text style={styles.teaserTitle}>💰 Top players earn</Text>
            <Text style={styles.teaserAmount}>₦50,000+ / month</Text>
            <Text style={styles.teaserSub}>Level up. Earn real Naira.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingTop: 80 },
  header: { marginBottom: SPACING.lg },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 6,
  },
  decoration: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.xl,
  },
  decorBlock: {
    width: 20,
    height: 20,
    borderRadius: 3,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  prefix: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingVertical: SPACING.md,
    fontWeight: "600",
  },
  otpInput: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.nairaGold,
    letterSpacing: 12,
    paddingVertical: SPACING.md,
  },
  btn: {
    backgroundColor: COLORS.nairaGold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    color: COLORS.void,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  backBtn: { alignItems: "center" },
  backText: { color: COLORS.textSecondary, fontSize: 14 },
  registerLink: { alignItems: "center", marginTop: SPACING.xs },
  registerText: { color: COLORS.textSecondary, fontSize: 14 },
  teaser: {
    marginTop: SPACING.xl,
    alignItems: "center",
    gap: SPACING.xs,
  },
  teaserTitle: { color: COLORS.textSecondary, fontSize: 14 },
  teaserAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.nairaGold,
    letterSpacing: 1,
  },
  teaserSub: { color: COLORS.textMuted, fontSize: 13 },
});
