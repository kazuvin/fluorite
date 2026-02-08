import { parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { CalendarDayCell } from "./calendar-day-cell";
import type { CalendarGridColors } from "./calendar-month-page";
import type { CalendarEvent, GlobalEventSlotMap } from "./event-layout";
import { computeWeekEventLayout } from "./event-layout";
import { generateWeekFromDate } from "./utils";
import { WeekEventBars } from "./week-event-bars";

export const CELL_HEIGHT = 80;

const DAY_NUMBER_HEIGHT = parseNumeric(spacing[6]);
const EVENT_AREA_TOP = DAY_NUMBER_HEIGHT - 2;

const SELECTION_BORDER_RADIUS = parseNumeric(radius.xl);

type CalendarWeekPageProps = {
	dateKey: string;
	weekOffset: number;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	width: number;
	selectedDateKey?: string | null;
	onSelectDate?: (dateKey: string) => void;
	today?: Date;
	globalSlots?: GlobalEventSlotMap;
};

export const CalendarWeekPage = memo(function CalendarWeekPage({
	dateKey,
	weekOffset,
	colors,
	events,
	width,
	selectedDateKey,
	onSelectDate,
	today,
	globalSlots,
}: CalendarWeekPageProps) {
	const week = useMemo(
		() => generateWeekFromDate(dateKey, weekOffset, today),
		[dateKey, weekOffset, today],
	);
	const layout = useMemo(
		() => computeWeekEventLayout(events, week, globalSlots),
		[events, week, globalSlots],
	);

	const cellWidth = width / 7;

	const selectedCol = useMemo(() => {
		if (!selectedDateKey) return null;
		const idx = week.findIndex((d) => d.dateKey === selectedDateKey);
		return idx >= 0 ? idx : null;
	}, [selectedDateKey, week]);

	return (
		<View testID="week-page" style={[styles.weekRow, { width, height: CELL_HEIGHT }]}>
			{selectedCol != null && (
				<View
					testID="week-selection-indicator"
					style={{
						position: "absolute",
						left: selectedCol * cellWidth,
						top: 0,
						width: cellWidth,
						height: CELL_HEIGHT,
						borderRadius: SELECTION_BORDER_RADIUS,
						borderCurve: "continuous",
						backgroundColor: `${colors.muted}26`,
						zIndex: 0,
					}}
				/>
			)}
			{week.map((day) => (
				<CalendarDayCell
					key={day.dateKey}
					day={day}
					colors={colors}
					isSelected={selectedDateKey === day.dateKey}
					onPress={onSelectDate}
				/>
			))}
			<WeekEventBars
				week={week}
				layout={layout}
				cellWidth={cellWidth}
				eventAreaTop={EVENT_AREA_TOP}
				mutedColor={colors.muted}
			/>
		</View>
	);
});

const styles = StyleSheet.create({
	weekRow: {
		flexDirection: "row",
		position: "relative",
	},
});
