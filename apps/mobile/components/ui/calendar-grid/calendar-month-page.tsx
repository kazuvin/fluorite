import { fontSize, fontWeight, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CalendarEvent } from "./event-layout";
import { computeMonthEventLayout } from "./event-layout";
import { generateCalendarGrid } from "./utils";
import { WeekEventBars } from "./week-event-bars";

export const CELL_HEIGHT = 80;

const DAY_NUMBER_HEIGHT = parseNumeric(spacing[6]);
const EVENT_AREA_TOP = DAY_NUMBER_HEIGHT + 2;

export type CalendarGridColors = {
	text: string;
	background: string;
	tint: string;
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

	return (
		<View style={{ width, height: CELL_HEIGHT * 6 }}>
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
									style={[
										styles.dayCircle,
										day.isToday && { backgroundColor: colors.tint },
										isSelected &&
											!day.isToday && {
												borderWidth: 1.5,
												borderColor: colors.tint,
											},
									]}
								>
									<Text
										style={[
											styles.dayText,
											{
												color: day.isCurrentMonth ? colors.text : colors.muted,
											},
											isSelected &&
												!day.isToday && {
													color: colors.tint,
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
