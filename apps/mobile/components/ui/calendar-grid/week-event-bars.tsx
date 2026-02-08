import { fontWeight, parseNumeric, radius } from "@fluorite/design-tokens";
import { StyleSheet, Text, View } from "react-native";
import type { MonthEventLayout } from "./event-layout";
import type { CalendarDay } from "./utils";

const EVENT_BAR_HEIGHT = 14;
const EVENT_BAR_GAP = 1;
const EVENT_BAR_RADIUS = parseNumeric(radius.md);
const EVENT_BAR_FONT_SIZE = 9;
const MAX_VISIBLE_SLOTS = 3;

type WeekEventBarsProps = {
	week: CalendarDay[];
	layout: MonthEventLayout;
	cellWidth: number;
	eventAreaTop: number;
	mutedColor: string;
};

export function WeekEventBars({
	week,
	layout,
	cellWidth,
	eventAreaTop,
	mutedColor,
}: WeekEventBarsProps) {
	const bars: React.ReactElement[] = [];

	for (let slotIndex = 0; slotIndex < MAX_VISIBLE_SLOTS; slotIndex++) {
		for (let col = 0; col < 7; col++) {
			const day = week[col];
			const cellLayout = layout.get(day.dateKey);
			if (!cellLayout) continue;

			const slot = cellLayout.slots[slotIndex];
			if (!slot) continue;

			const top = eventAreaTop + slotIndex * (EVENT_BAR_HEIGHT + EVENT_BAR_GAP);
			const left = col * cellWidth + (slot.isStart ? 1 : 0);
			const barWidth =
				cellWidth * slot.spanInWeek - (slot.isStart ? 1 : 0) - (slot.isEnd ? 1 : 0);

			bars.push(
				<View
					key={`${day.dateKey}-slot-${slotIndex}`}
					style={{
						position: "absolute",
						top,
						left,
						width: barWidth,
						height: EVENT_BAR_HEIGHT,
						backgroundColor: slot.event.color,
						borderTopLeftRadius: slot.isStart ? EVENT_BAR_RADIUS : 0,
						borderBottomLeftRadius: slot.isStart ? EVENT_BAR_RADIUS : 0,
						borderTopRightRadius: slot.isEnd ? EVENT_BAR_RADIUS : 0,
						borderBottomRightRadius: slot.isEnd ? EVENT_BAR_RADIUS : 0,
						borderCurve: "continuous",
						paddingHorizontal: 3,
						justifyContent: "center",
					}}
				>
					<Text style={styles.eventText} numberOfLines={1}>
						{slot.event.title}
					</Text>
				</View>,
			);
		}
	}

	for (let col = 0; col < 7; col++) {
		const day = week[col];
		const cellLayout = layout.get(day.dateKey);
		if (!cellLayout || cellLayout.overflowCount <= 0) continue;

		const top = eventAreaTop + MAX_VISIBLE_SLOTS * (EVENT_BAR_HEIGHT + EVENT_BAR_GAP);
		const left = col * cellWidth;

		bars.push(
			<Text
				key={`${day.dateKey}-overflow`}
				style={[
					styles.overflowText,
					{
						position: "absolute",
						top,
						left,
						width: cellWidth,
						color: mutedColor,
					},
				]}
			>
				+{cellLayout.overflowCount}
			</Text>,
		);
	}

	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			{bars}
		</View>
	);
}

const styles = StyleSheet.create({
	eventText: {
		fontSize: EVENT_BAR_FONT_SIZE,
		color: "#FFFFFF",
		fontWeight: fontWeight.medium,
	},
	overflowText: {
		fontSize: EVENT_BAR_FONT_SIZE,
		textAlign: "center",
	},
});
