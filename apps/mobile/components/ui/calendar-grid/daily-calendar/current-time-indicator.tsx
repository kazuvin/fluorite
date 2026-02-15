import { colors, parseNumeric, radius } from "@fluorite/design-tokens";
import { StyleSheet, View, useColorScheme } from "react-native";

type CurrentTimeIndicatorProps = {
	slot: number;
	slotHeight: number;
	topOffset?: number;
};

export function CurrentTimeIndicator({
	slot,
	slotHeight,
	topOffset = 0,
}: CurrentTimeIndicatorProps) {
	const scheme = useColorScheme() ?? "light";
	const currentTimeColor = colors[scheme].destructive;
	const top = slot * slotHeight + topOffset;

	return (
		<View testID="current-time-indicator" style={[styles.container, { top }]}>
			<View
				testID="current-time-circle"
				style={[styles.circle, { backgroundColor: currentTimeColor }]}
			/>
			<View
				testID="current-time-line"
				style={[styles.line, { backgroundColor: currentTimeColor }]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		zIndex: 10,
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: parseNumeric(radius.full),
		marginLeft: -4,
	},
	line: {
		flex: 1,
		height: 2,
	},
});
