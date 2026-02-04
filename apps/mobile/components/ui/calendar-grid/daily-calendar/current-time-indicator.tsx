import { StyleSheet, View } from "react-native";

const CURRENT_TIME_LINE_COLOR = "#FF3B30";

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
	const top = slot * slotHeight + topOffset;

	return (
		<View testID="current-time-indicator" style={[styles.container, { top }]}>
			<View testID="current-time-circle" style={styles.circle} />
			<View testID="current-time-line" style={styles.line} />
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
		borderRadius: 4,
		backgroundColor: CURRENT_TIME_LINE_COLOR,
		marginLeft: -4,
	},
	line: {
		flex: 1,
		height: 2,
		backgroundColor: CURRENT_TIME_LINE_COLOR,
	},
});
