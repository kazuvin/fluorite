import { fontSize, fontWeight, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { memo, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import type { CalendarEvent } from "./event-layout";
import { computeMonthEventLayout } from "./event-layout";
import { generateCalendarGrid } from "./utils";
import { WeekEventBars } from "./week-event-bars";

export const CELL_HEIGHT = 80;

const DAY_NUMBER_HEIGHT = parseNumeric(spacing[6]);
const EVENT_AREA_TOP = DAY_NUMBER_HEIGHT - 2;

const SELECTION_BORDER_RADIUS = parseNumeric(radius.xl);

export type CalendarGridColors = {
	text: string;
	background: string;
	primary: string;
	muted: string;
};

type CalendarMonthPageProps = {
	year: number;
	month: number;
	today: Date;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	width: number;
	selectedDateKey?: string | null;
	onSelectDate?: (dateKey: string) => void;
};

export const CalendarMonthPage = memo(function CalendarMonthPage({
	year,
	month,
	today,
	colors,
	events,
	width,
	selectedDateKey,
	onSelectDate,
}: CalendarMonthPageProps) {
	const grid = useMemo(() => generateCalendarGrid(year, month, today), [year, month, today]);
	const layout = useMemo(() => computeMonthEventLayout(events, grid), [events, grid]);

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

			{grid.map((week) => (
				<View key={`week-${week[0].year}-${week[0].month}-${week[0].date}`} style={styles.weekRow}>
					{week.map((day) => {
						const isSelected = selectedDateKey === day.dateKey;
						return (
							<Pressable
								key={`${day.year}-${day.month}-${day.date}`}
								style={styles.dayNumberCell}
								onPress={() => onSelectDate?.(day.dateKey)}
							>
								<View
									style={[styles.dayCircle, day.isToday && { backgroundColor: colors.primary }]}
								>
									<Text
										style={[
											styles.dayText,
											{
												color: day.isCurrentMonth ? colors.text : colors.muted,
											},
											isSelected &&
												!day.isToday && {
													color: colors.primary,
													fontWeight: fontWeight.bold,
												},
											day.isToday && {
												color: colors.background,
												fontWeight: fontWeight.bold,
											},
										]}
									>
										{day.date}
									</Text>
								</View>
							</Pressable>
						);
					})}
					<WeekEventBars
						week={week}
						layout={layout}
						cellWidth={cellWidth}
						eventAreaTop={EVENT_AREA_TOP}
						mutedColor={colors.muted}
					/>
				</View>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	weekRow: {
		flexDirection: "row",
		height: CELL_HEIGHT,
		position: "relative",
	},
	dayNumberCell: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		paddingTop: parseNumeric(spacing[1]),
		zIndex: 1,
	},
	dayCircle: {
		width: 20,
		height: 20,
		borderRadius: parseNumeric(radius.md),
		alignItems: "center",
		justifyContent: "center",
	},
	dayText: {
		fontSize: parseNumeric(fontSize.xs),
	},
});
