import { colors, parseNumeric, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { IconSymbol } from "../../../../components/ui/icon-symbol";

type DeselectDateFabButtonProps = {
	onPress: () => void;
};

export function DeselectDateFabButton({ onPress }: DeselectDateFabButtonProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<Pressable
			testID="deselect-date-fab"
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.fab,
				{ backgroundColor: theme.surfaceRaised },
				pressed && styles.pressed,
			]}
		>
			<IconSymbol name="xmark" size={20} color={theme.icon} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		alignSelf: "center",
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		elevation: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	pressed: {
		opacity: 0.8,
	},
});
