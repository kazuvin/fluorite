import { parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { memo, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import { generateWeekFromDate } from "../../../features/calendar/utils/calendar-grid-utils";
import type {
	CalendarEvent,
	GlobalEventSlotMap,
} from "../../../features/calendar/utils/event-layout";
import { computeWeekEventLayout } from "../../../features/calendar/utils/event-layout";
import { CalendarDayCell } from "./calendar-day-cell";
import { CELL_HEIGHT } from "./constants";
import type { CalendarGridColors } from "./types";
import { WeekEventBars } from "./week-event-bars";

const DAY_NUMBER_HEIGHT = parseNumeric(spacing[6]);
const EVENT_AREA_TOP = DAY_NUMBER_HEIGHT - 2;

const SELECTION_BORDER_RADIUS = parseNumeric(radius.xl);

type WeekGridProps = {
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

export const WeekGrid = memo(function WeekGrid({
	dateKey,
	weekOffset,
	colors,
	events,
	width,
	selectedDateKey,
	onSelectDate,
	today,
	globalSlots,
}: WeekGridProps) {
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

	// --- Selection indicator animation ---
	const indicatorX = useSharedValue(selectedCol != null ? selectedCol * cellWidth : 0);
	const indicatorOpacity = useSharedValue(selectedCol != null ? 1 : 0);

	const lastEffectWeekRef = useRef({ dateKey, weekOffset });

	useEffect(() => {
		const isWeekChange =
			dateKey !== lastEffectWeekRef.current.dateKey ||
			weekOffset !== lastEffectWeekRef.current.weekOffset;
		lastEffectWeekRef.current = { dateKey, weekOffset };

		if (selectedCol != null) {
			const targetX = selectedCol * cellWidth;
			if (isWeekChange) {
				// Week changed: snap position, fade in
				indicatorX.value = targetX;
				indicatorOpacity.value = 0;
				indicatorOpacity.value = withTiming(1, ANIMATION.entering);
			} else if (indicatorOpacity.value === 0) {
				// First selection: snap position, then fade in
				indicatorX.value = targetX;
				indicatorOpacity.value = withTiming(1, ANIMATION.entering);
			} else {
				// Subsequent selection within same week: animate position
				indicatorX.value = withTiming(targetX, ANIMATION.layout);
			}
		} else {
			indicatorOpacity.value = withTiming(0, ANIMATION.exiting);
		}
	}, [selectedCol, cellWidth, dateKey, weekOffset, indicatorX, indicatorOpacity]);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }],
		opacity: indicatorOpacity.value,
	}));

	return (
		<View testID="week-page" style={[styles.weekRow, { width, height: CELL_HEIGHT }]}>
			<Animated.View
				testID="week-selection-indicator"
				style={[
					{
						position: "absolute",
						width: cellWidth,
						height: CELL_HEIGHT,
						borderRadius: SELECTION_BORDER_RADIUS,
						borderCurve: "continuous",
						backgroundColor: `${colors.muted}26`,
						zIndex: 0,
						pointerEvents: "none",
					},
					indicatorStyle,
				]}
			/>
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
