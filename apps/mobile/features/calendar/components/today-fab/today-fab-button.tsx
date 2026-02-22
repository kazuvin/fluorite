import { colors, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, useColorScheme } from "react-native";
import { AnimatedPressable } from "../../../../components/ui/animated-pressable";
import { textBase } from "../../../../constants/theme";

type TodayFabButtonProps = {
	onPress: () => void;
};

export function TodayFabButton({ onPress }: TodayFabButtonProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<AnimatedPressable
			testID="today-fab"
			accessibilityRole="button"
			onPress={onPress}
			style={[styles.fab, { backgroundColor: theme.surfaceRaised }]}
		>
			<Text style={[styles.label, { color: theme.text }]}>今日</Text>
		</AnimatedPressable>
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
		...textBase,
		fontSize: 16,
		fontWeight: "600",
	},
});
