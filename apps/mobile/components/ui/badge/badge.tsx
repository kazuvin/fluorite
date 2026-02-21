import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

export type BadgeProps = {
	label: string;
	selected?: boolean;
	color?: string;
	selectedColor?: string;
	onPress: () => void;
	testID?: string;
};

export function Badge({
	label,
	selected = false,
	color,
	selectedColor,
	onPress,
	testID,
}: BadgeProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const activeColor = selectedColor ?? color ?? theme.primary;

	return (
		<Pressable
			testID={testID}
			accessibilityRole="button"
			aria-selected={selected}
			onPress={onPress}
			style={[
				styles.badge,
				selected ? { backgroundColor: activeColor } : { backgroundColor: theme.surface },
			]}
		>
			{color != null && (
				<View
					testID={testID ? `${testID}-dot` : "badge-dot"}
					style={[styles.dot, { backgroundColor: selected ? theme.textOnPrimary : color }]}
				/>
			)}
			<Text
				style={[styles.label, selected ? { color: theme.textOnPrimary } : { color: theme.text }]}
			>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[2]),
		paddingHorizontal: parseNumeric(spacing[4]),
		paddingVertical: parseNumeric(spacing[2]),
		borderRadius: parseNumeric(radius.full),
	},
	label: {
		fontSize: parseNumeric(fontSize.sm),
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
});
