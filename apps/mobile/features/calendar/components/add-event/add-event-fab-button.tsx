import { categoryForeground, colors, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, useColorScheme } from "react-native";
import { AnimatedPressable } from "../../../../components/ui/animated-pressable";
import { IconSymbol } from "../../../../components/ui/icon-symbol";

type AddEventFabButtonProps = {
	onPress: () => void;
};

export function AddEventFabButton({ onPress }: AddEventFabButtonProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<AnimatedPressable
			testID="add-event-fab"
			accessibilityRole="button"
			onPress={onPress}
			style={[styles.fab, { backgroundColor: theme.accent }]}
		>
			<IconSymbol name="plus" size={20} color={categoryForeground} />
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		right: parseNumeric(spacing[5]),
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
});
