import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { useAppStore } from "../src/store/appStore";
import { COLORS } from "../src/utils/theme";

export default function RootLayout() {
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={COLORS.void} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.void },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" options={{ animation: "slide_from_right" }} />
        <Stack.Screen
          name="game"
          options={{ animation: "slide_from_bottom", gestureEnabled: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
