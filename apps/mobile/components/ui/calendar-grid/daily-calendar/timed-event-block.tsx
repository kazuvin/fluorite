import {
	colors,
	fontSize,
	fontWeight,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import type { DailyEventPosition } from "../../../../features/calendar/utils/daily-event-layout";

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
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
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
			<Text style={[styles.title, { color: theme.textOnPrimary }]} numberOfLines={2}>
				{event.title}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		borderRadius: parseNumeric(radius.lg),
		borderCurve: "continuous",
		paddingHorizontal: parseNumeric(spacing["1"]),
		paddingVertical: parseNumeric(spacing["1"]),
		overflow: "hidden",
	},
	title: {
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.medium,
	},
});
