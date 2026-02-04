import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, View } from "react-native";
import type { DailyEventPosition } from "../daily-event-layout";

type TimedEventBlockProps = {
	position: DailyEventPosition;
	slotHeight: number;
	containerWidth: number;
	leftOffset: number;
	topOffset?: number;
};

export function TimedEventBlock({
	position,
	slotHeight,
	containerWidth,
	leftOffset,
	topOffset = 0,
}: TimedEventBlockProps) {
	const { event, top, height, column, totalColumns } = position;

	const availableWidth = containerWidth - leftOffset;
	const blockWidth = availableWidth / totalColumns;
	const blockLeft = leftOffset + column * blockWidth;

	return (
		<View
			testID="timed-event-block"
			style={[
				styles.container,
				{
					top: top * slotHeight + topOffset,
					height: height * slotHeight,
					left: blockLeft,
					width: blockWidth,
					backgroundColor: event.color,
				},
			]}
		>
			<Text style={styles.title} numberOfLines={2}>
				{event.title}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		borderRadius: 4,
		paddingHorizontal: parseNumeric(spacing["1"]),
		paddingVertical: 2,
		overflow: "hidden",
	},
	title: {
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.medium,
		color: "#FFFFFF",
	},
});
