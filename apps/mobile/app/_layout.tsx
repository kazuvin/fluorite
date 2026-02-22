import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import { useVaultInit } from "@/features/vault/hooks/use-vault-init";
import { useColorScheme } from "@/hooks/use-color-scheme";

function VaultGate({ children }: { children: ReactNode }) {
	const isReady = useVaultInit();

	if (!isReady) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <>{children}</>;
}

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<JotaiProvider>
						<VaultGate>
							<Stack>
								<Stack.Screen name="index" options={{ headerShown: false }} />
								<Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
							</Stack>
						</VaultGate>
					</JotaiProvider>
					<StatusBar style="auto" />
				</ThemeProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
