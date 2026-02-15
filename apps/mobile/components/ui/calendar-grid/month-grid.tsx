import { parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import { generateCalendarGrid } from "../../../features/calendar/utils/calendar-grid-utils";
import type { CalendarEvent } from "../../../features/calendar/utils/event-layout";
import {
	computeEventCellLayoutMap,
	computeGlobalEventSlots,
} from "../../../features/calendar/utils/event-layout";
import { CalendarDayCell } from "./calendar-day-cell";
import { CELL_HEIGHT } from "./constants";
import type { CalendarGridColors } from "./types";
import { WeekEventBars } from "./week-event-bars";

const DAY_NUMBER_HEIGHT = parseNumeric(spacing[6]);
const EVENT_AREA_TOP = DAY_NUMBER_HEIGHT - 2;

const SELECTION_BORDER_RADIUS = parseNumeric(radius.xl);

type MonthGridProps = {
	year: number;
	month: number;
	today: Date;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	width: number;
	selectedDateKey?: string | null;
	onSelectDate?: (dateKey: string) => void;
	nonSelectedRowOpacity?: SharedValue<number>;
};

export const MonthGrid = memo(function MonthGrid({
	year,
	month,
	today,
	colors,
	events,
	width,
	selectedDateKey,
	onSelectDate,
	nonSelectedRowOpacity,
}: MonthGridProps) {
	const selectedWeekIndex = useMemo(() => {
		if (!selectedDateKey) return -1;
		const grid = generateCalendarGrid(year, month, today);
		for (let row = 0; row < grid.length; row++) {
			if (grid[row].some((d) => d.dateKey === selectedDateKey)) return row;
		}
		return -1;
	}, [selectedDateKey, year, month, today]);

	const grid = useMemo(() => generateCalendarGrid(year, month, today), [year, month, today]);
	const globalSlots = useMemo(() => computeGlobalEventSlots(events), [events]);
	const layout = useMemo(
		() => computeEventCellLayoutMap(events, grid, globalSlots),
		[events, grid, globalSlots],
	);

	const cellWidth = width / 7;

	// --- Selection indicator animation ---
	const selectedPos = useMemo(() => {
		if (!selectedDateKey) return null;
		for (let row = 0; row < grid.length; row++) {
			for (let col = 0; col < grid[row].length; col++) {
				if (grid[row][col].dateKey === selectedDateKey) {
					return { row, col };
				}
			}
		}
		return null;
	}, [selectedDateKey, grid]);

	const indicatorX = useSharedValue(selectedPos ? selectedPos.col * cellWidth : 0);
	const indicatorY = useSharedValue(selectedPos ? selectedPos.row * CELL_HEIGHT : 0);
	const indicatorOpacity = useSharedValue(selectedPos ? 1 : 0);

	useEffect(() => {
		if (selectedPos) {
			const targetX = selectedPos.col * cellWidth;
			const targetY = selectedPos.row * CELL_HEIGHT;

			if (indicatorOpacity.value === 0) {
				// First selection: snap position, then fade in
				indicatorX.value = targetX;
				indicatorY.value = targetY;
				indicatorOpacity.value = withTiming(1, ANIMATION.entering);
			} else {
				// Subsequent selection: animate position
				indicatorX.value = withTiming(targetX, ANIMATION.layout);
				indicatorY.value = withTiming(targetY, ANIMATION.layout);
			}
		} else {
			indicatorOpacity.value = withTiming(0, ANIMATION.exiting);
		}
	}, [selectedPos, cellWidth, indicatorX, indicatorY, indicatorOpacity]);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }, { translateY: indicatorY.value }],
		opacity: indicatorOpacity.value,
	}));

	return (
		<View style={{ width, height: CELL_HEIGHT * 6 }}>
			{/* Selection indicator - below events, above cell background */}
			<Animated.View
				style={[
					{
						position: "absolute",
						width: cellWidth,
						height: CELL_HEIGHT,
						borderRadius: SELECTION_BORDER_RADIUS,
						borderCurve: "continuous",
						backgroundColor: `${colors.muted}26`,
						zIndex: 0,
					},
					indicatorStyle,
				]}
				pointerEvents="none"
			/>

			{grid.map((week, rowIndex) => {
				const isSelectedRow = rowIndex === selectedWeekIndex;
				const rowContent = (
					<View
						key={`week-${week[0].year}-${week[0].month}-${week[0].date}`}
						style={styles.weekRow}
					>
						{week.map((day) => (
							<CalendarDayCell
								key={`${day.year}-${day.month}-${day.date}`}
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

				if (nonSelectedRowOpacity && !isSelectedRow) {
					return (
						<NonSelectedRow
							key={`fade-${week[0].year}-${week[0].month}-${week[0].date}`}
							opacity={nonSelectedRowOpacity}
						>
							{rowContent}
						</NonSelectedRow>
					);
				}
				return rowContent;
			})}
		</View>
	);
});

function NonSelectedRow({
	opacity,
	children,
}: {
	opacity: SharedValue<number>;
	children: React.ReactNode;
}) {
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));
	return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
	weekRow: {
		flexDirection: "row",
		height: CELL_HEIGHT,
		position: "relative",
	},
});
