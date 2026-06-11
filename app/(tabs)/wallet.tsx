import { useState } from "react";
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, TextInput, Alert, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../../src/store/appStore";
import {
  COLORS, SPACING, RADIUS, COINS_TO_NAIRA_RATE,
  NAIRA_PER_UNIT, MIN_WITHDRAWAL
} from "../../src/utils/theme";

const NIGERIAN_BANKS = [
  "Access Bank", "First Bank", "GTBank", "Zenith Bank", "UBA",
  "Sterling Bank", "Kuda Bank", "OPay", "PalmPay", "Moniepoint",
  "Wema Bank", "Fidelity Bank", "Union Bank", "Polaris Bank",
];

export default function WalletScreen() {
  const { coinBalance, transactions, user, withdrawCoins, updateBankDetails } = useAppStore((s) => ({
    coinBalance: s.coinBalance,
    transactions: s.transactions,
    user: s.user,
    withdrawCoins: s.withdrawCoins,
    updateBankDetails: s.updateBankDetails,
  }));

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankName, setBankName] = useState(user?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || "");
  const [accountName, setAccountName] = useState(user?.accountName || "");
  const [loading, setLoading] = useState(false);

  const nairaValue = Math.floor((coinBalance / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);
  const coinsToWithdraw = Number(withdrawAmount) || 0;
  const nairaToReceive = Math.floor((coinsToWithdraw / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT);
  const canWithdraw = coinsToWithdraw >= MIN_WITHDRAWAL && coinsToWithdraw <= coinBalance && !!user?.accountNumber;

  const handleWithdraw = async () => {
    if (!user?.accountNumber) {
      Alert.alert("Add Bank Details", "Please save your bank account before withdrawing.");
      setShowBankModal(true);
      return;
    }
    if (coinsToWithdraw < MIN_WITHDRAWAL) {
      Alert.alert(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} coins (₦${Math.floor((MIN_WITHDRAWAL / COINS_TO_NAIRA_RATE) * NAIRA_PER_UNIT).toLocaleString()})`);
      return;
    }
    Alert.alert(
      "Confirm Withdrawal",
      `Withdraw ${coinsToWithdraw.toLocaleString()} coins for ₦${nairaToReceive.toLocaleString()} to ${user.bankName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            const ok = await withdrawCoins(coinsToWithdraw);
            setLoading(false);
            if (ok) {
              setWithdrawAmount("");
              Alert.alert("✅ Withdrawal Submitted", `₦${nairaToReceive.toLocaleString()} will arrive in your account within 24 hours.`);
            } else {
              Alert.alert("Failed", "Could not process withdrawal. Check your balance.");
            }
          },
        },
      ]
    );
  };

  const saveBankDetails = () => {
    if (!bankName || accountNumber.length < 10 || !accountName) {
      Alert.alert("Fill in all bank details correctly.");
      return;
    }
    updateBankDetails({ bankName, accountNumber, accountName });
    setShowBankModal(false);
    Alert.alert("✅ Bank details saved!");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Wallet 💰</Text>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceCoins}>{coinBalance.toLocaleString()} <Text style={styles.coinUnit}>coins</Text></Text>
          <Text style={styles.balanceNaira}>≈ ₦{nairaValue.toLocaleString()}</Text>
          <View style={styles.rateRow}>
            <Text style={styles.rateText}>Rate: 1,000 coins = ₦{NAIRA_PER_UNIT}</Text>
          </View>
        </View>

        {/* Bank details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bank Account</Text>
            <TouchableOpacity onPress={() => setShowBankModal(true)}>
              <Text style={styles.editLink}>{user?.accountNumber ? "Edit" : "Add Details"}</Text>
            </TouchableOpacity>
          </View>
          {user?.accountNumber ? (
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{user.bankName}</Text>
              <Text style={styles.accountNumber}>{user.accountNumber}</Text>
              <Text style={styles.accountName}>{user.accountName}</Text>
            </View>
          ) : (
            <Text style={styles.noBankText}>No bank account added yet</Text>
          )}
        </View>

        {/* Withdraw */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Withdraw</Text>
          <Text style={styles.minText}>Minimum: {MIN_WITHDRAWAL.toLocaleString()} coins</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter coins to withdraw"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <TouchableOpacity onPress={() => setWithdrawAmount(String(coinBalance))} style={styles.maxBtn}>
              <Text style={styles.maxText}>MAX</Text>
            </TouchableOpacity>
          </View>

          {coinsToWithdraw > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewText}>You receive: <Text style={styles.previewAmount}>₦{nairaToReceive.toLocaleString()}</Text></Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.withdrawBtn, (!canWithdraw || loading) && styles.btnDisabled]}
            onPress={handleWithdraw}
            disabled={!canWithdraw || loading}
          >
            <Text style={styles.withdrawBtnText}>{loading ? "Processing..." : "Withdraw to Bank"}</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction history */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet. Play to earn coins!</Text>
          </View>
        ) : (
          transactions.slice(0, 30).map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txDot, { backgroundColor: tx.type === "earn" ? COLORS.emerald : tx.type === "withdraw" ? COLORS.nairaGold : COLORS.neonPurple }]} />
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.timestamp).toLocaleDateString("en-NG")}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txCoins, { color: tx.type === "withdraw" ? COLORS.danger : COLORS.emerald }]}>
                  {tx.type === "withdraw" ? "-" : "+"}{tx.coins.toLocaleString()} coins
                </Text>
                {tx.naira && <Text style={styles.txNaira}>₦{tx.naira.toLocaleString()}</Text>}
                <Text style={[styles.txStatus, { color: tx.status === "completed" ? COLORS.emerald : COLORS.nairaGold }]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bank details modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bank Account Details</Text>

            <Text style={styles.fieldLabel}>Bank Name</Text>
            <ScrollView style={styles.bankPicker} horizontal showsHorizontalScrollIndicator={false}>
              {NIGERIAN_BANKS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.bankChip, bankName === b && styles.bankChipActive]}
                  onPress={() => setBankName(b)}
                >
                  <Text style={[styles.bankChipText, bankName === b && styles.bankChipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="10-digit account number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <Text style={styles.fieldLabel}>Account Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="As on your bank statement"
              placeholderTextColor={COLORS.textMuted}
              value={accountName}
              onChangeText={setAccountName}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowBankModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveBankDetails}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.void },
  content: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.md },
  pageTitle: { fontSize: 28, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: 1 },
  balanceCard: {
    backgroundColor: "#1A1500",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.nairaGoldDim,
    gap: 4,
  },
  balanceLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  balanceCoins: { fontSize: 36, fontWeight: "900", color: COLORS.nairaGold },
  coinUnit: { fontSize: 16, color: COLORS.textMuted },
  balanceNaira: { fontSize: 18, color: COLORS.textSecondary, fontWeight: "600" },
  rateRow: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.nairaGoldDim },
  rateText: { color: COLORS.nairaGoldDim, fontSize: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  editLink: { color: COLORS.neonCyan, fontSize: 14, fontWeight: "700" },
  bankInfo: { gap: 2 },
  bankName: { color: COLORS.textSecondary, fontSize: 13 },
  accountNumber: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "900", letterSpacing: 2 },
  accountName: { color: COLORS.textMuted, fontSize: 12 },
  noBankText: { color: COLORS.textMuted, fontSize: 14 },
  minText: { color: COLORS.textMuted, fontSize: 12 },
  inputRow: { flexDirection: "row", gap: SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontWeight: "600",
  },
  maxBtn: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  maxText: { color: COLORS.neonCyan, fontWeight: "800", fontSize: 12 },
  preview: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: "center",
  },
  previewText: { color: COLORS.textSecondary, fontSize: 14 },
  previewAmount: { color: COLORS.nairaGold, fontWeight: "900" },
  withdrawBtn: {
    backgroundColor: COLORS.nairaGold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.4 },
  withdrawBtnText: { color: COLORS.void, fontWeight: "900", fontSize: 16, letterSpacing: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase" },
  emptyState: { alignItems: "center", padding: SPACING.xl },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: "center" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txDot: { width: 10, height: 10, borderRadius: 5 },
  txInfo: { flex: 1, gap: 2 },
  txDesc: { color: COLORS.textPrimary, fontSize: 13, fontWeight: "600" },
  txDate: { color: COLORS.textMuted, fontSize: 11 },
  txRight: { alignItems: "flex-end", gap: 2 },
  txCoins: { fontSize: 13, fontWeight: "800" },
  txNaira: { color: COLORS.nairaGold, fontSize: 12, fontWeight: "700" },
  txStatus: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    paddingBottom: 48,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: COLORS.textPrimary },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  bankPicker: { maxHeight: 48 },
  bankChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  bankChipActive: { backgroundColor: COLORS.nairaGold, borderColor: COLORS.nairaGold },
  bankChipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  bankChipTextActive: { color: COLORS.void },
  modalInput: {
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontWeight: "600",
  },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.sm },
  modalCancel: {
    flex: 1,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: "700" },
  modalSave: {
    flex: 1,
    backgroundColor: COLORS.nairaGold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  modalSaveText: { color: COLORS.void, fontWeight: "900", fontSize: 16 },
});
