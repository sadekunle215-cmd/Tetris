import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../../src/store/appStore";
import { COLORS, SPACING, RADIUS } from "../../src/utils/theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);

  const register = async () => {
    if (!name.trim() || phone.length < 11) {
      Alert.alert("Please fill in your name and a valid phone number.");
      return;
    }
    setLoading(true);
    // TODO: register with backend
    setTimeout(() => {
      setLoading(false);
      login({ id: Date.now().toString(), name, phone, email });
      router.replace("/(tabs)");
    }, 1200);
  };

  return (
    <LinearGradient colors={[COLORS.void, "#0D0D2B"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join millions earning Naira on TetrisEarn</Text>

          <View style={styles.card}>
            <Field label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Chukwuemeka Obi" />
            <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="08012345678" keyboardType="phone-pad" maxLength={11} />
            <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.5 }]}
              onPress={register}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Creating..." : "Create Account & Play"}</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By registering you agree to our Terms of Service and confirm you are 18+.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({ label, ...props }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  input: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontWeight: "500",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingTop: 60 },
  back: { marginBottom: SPACING.xl },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: 2, marginBottom: 6 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.xl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  btn: {
    backgroundColor: COLORS.nairaGold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  btnText: { color: COLORS.void, fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  terms: { color: COLORS.textMuted, fontSize: 11, textAlign: "center", lineHeight: 16 },
});
