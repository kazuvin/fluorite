import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { useWindowDimensions } from "react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyEventLayout } from "../daily-event-layout";
import { AllDaySection } from "./all-day-section";
import { CurrentTimeIndicator } from "./current-time-indicator";
import { TIME_LABEL_WIDTH, TimeGrid } from "./time-grid";
import { TimedEventBlock } from "./timed-event-block";

const HOUR_HEIGHT = 60;
const SLOT_HEIGHT = HOUR_HEIGHT / 12; // 5px per 5 minutes
const GRID_PADDING_VERTICAL = 16;
const EVENT_LEFT_GAP = 4; // 時刻ラベルとイベントの間隔

type DailyCalendarProps = {
	dateKey: string;
	layout: DailyEventLayout;
	textColor: string;
	currentTimeSlot: number | null;
};

export function DailyCalendar({ dateKey, layout, textColor, currentTimeSlot }: DailyCalendarProps) {
	const { width: windowWidth } = useWindowDimensions();

	return (
		<View testID="daily-calendar" style={styles.container}>
			<View style={styles.header}>
				<Text style={[styles.dateText, { color: textColor }]}>{dateKey}</Text>
			</View>

			<AllDaySection events={layout.allDayEvents} textColor={textColor} />

			<ScrollView
				testID="daily-calendar-scroll"
				style={styles.scrollView}
				showsVerticalScrollIndicator={true}
			>
				<View style={styles.gridContainer}>
					<TimeGrid textColor={textColor} hourHeight={HOUR_HEIGHT} />

					{layout.timedEvents.map((position) => (
						<TimedEventBlock
							key={position.event.id}
							position={position}
							slotHeight={SLOT_HEIGHT}
							containerWidth={windowWidth - parseNumeric(spacing["4"]) * 2}
							leftOffset={TIME_LABEL_WIDTH + EVENT_LEFT_GAP}
							topOffset={GRID_PADDING_VERTICAL}
						/>
					))}

					{currentTimeSlot !== null && (
						<CurrentTimeIndicator
							slot={currentTimeSlot}
							slotHeight={SLOT_HEIGHT}
							topOffset={GRID_PADDING_VERTICAL}
						/>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: parseNumeric(spacing["4"]),
		paddingVertical: parseNumeric(spacing["2"]),
	},
	dateText: {
		fontSize: parseNumeric(fontSize.sm),
		fontWeight: fontWeight.medium,
	},
	scrollView: {
		flex: 1,
	},
	gridContainer: {
		position: "relative",
		paddingHorizontal: parseNumeric(spacing["4"]),
		paddingVertical: GRID_PADDING_VERTICAL,
	},
});
