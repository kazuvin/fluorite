import {
	categoryForeground,
	colors,
	fontSize,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../constants/theme";
import { AnimatedPressable } from "../animated-pressable";

const BORDER_WIDTH = 1.5;
const BORDER_GAP = 2;

export type BadgeProps = {
	label: string;
	selected?: boolean;
	color?: string;
	onPress: () => void;
	testID?: string;
};

export function Badge({ label, selected = false, color, onPress, testID }: BadgeProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const bgColor = color ?? theme.text;

	return (
		<AnimatedPressable
			testID={testID}
			accessibilityRole="button"
			aria-selected={selected}
			onPress={onPress}
			style={[styles.outer, selected && { borderColor: theme.textMuted }]}
		>
			<View style={[styles.inner, { backgroundColor: bgColor }]}>
				<Text style={[styles.label, { color: color ? categoryForeground : theme.textOnPrimary }]}>
					{label}
				</Text>
			</View>
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create({
	outer: {
		borderWidth: BORDER_WIDTH,
		borderColor: "transparent",
		borderRadius: parseNumeric(radius.full),
		padding: BORDER_GAP,
	},
	inner: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: parseNumeric(spacing[4]),
		paddingVertical: parseNumeric(spacing[2]),
		borderRadius: parseNumeric(radius.full),
	},
	label: {
		...textBase,
		fontSize: parseNumeric(fontSize.sm),
	},
});
