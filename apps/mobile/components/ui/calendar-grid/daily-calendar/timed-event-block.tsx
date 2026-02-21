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

	const pixelHeight = height * slotHeight;
	const isCompact = pixelHeight < 40;

	return (
		<View
			testID="timed-event-block"
			style={[
				styles.container,
				isCompact ? styles.paddingCompact : styles.paddingNormal,
				{
					top: top * slotHeight + topOffset,
					height: pixelHeight,
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
		borderRadius: parseNumeric(radius["2xl"]),
		borderCurve: "continuous",
		overflow: "hidden",
	},
	paddingNormal: {
		paddingHorizontal: parseNumeric(spacing["3"]),
		paddingVertical: parseNumeric(spacing["2"]),
	},
	paddingCompact: {
		paddingHorizontal: parseNumeric(spacing["2"]),
		paddingVertical: parseNumeric(spacing["1"]),
	},
	title: {
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.medium,
	},
});
