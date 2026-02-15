import { colors, parseNumeric, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

type TodayFabButtonProps = {
	onPress: () => void;
};

export function TodayFabButton({ onPress }: TodayFabButtonProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<Pressable
			testID="today-fab"
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.fab,
				{ backgroundColor: theme.surfaceRaised },
				pressed && styles.pressed,
			]}
		>
			<Text style={[styles.label, { color: theme.text }]}>今日</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		left: parseNumeric(spacing[5]),
		height: 48,
		paddingHorizontal: parseNumeric(spacing[3]),
		borderRadius: 18,
		borderCurve: "continuous",
		alignItems: "center",
		justifyContent: "center",
		elevation: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
	},
	pressed: {
		opacity: 0.8,
	},
});
