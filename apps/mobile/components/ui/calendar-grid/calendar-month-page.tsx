import { fontSize, fontWeight, parseNumeric, radius } from "@fluorite/design-tokens";
import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { generateCalendarGrid } from "./utils";

export const CELL_HEIGHT = 100;

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
	width: number;
};

export const CalendarMonthPage = memo(function CalendarMonthPage({
	year,
	month,
	today,
	colors,
	width,
}: CalendarMonthPageProps) {
	const grid = useMemo(() => generateCalendarGrid(year, month, today), [year, month, today]);

	return (
		<View style={{ width, height: CELL_HEIGHT * 7 }}>
			{grid.map((week) => (
				<View key={`week-${week[0].year}-${week[0].month}-${week[0].date}`} style={styles.weekRow}>
					{week.map((day) => (
						<View key={`${day.year}-${day.month}-${day.date}`} style={styles.cell}>
							<View style={[styles.dayCircle, day.isToday && { backgroundColor: colors.tint }]}>
								<Text
									style={[
										styles.dayText,
										{
											color: day.isCurrentMonth ? colors.text : colors.muted,
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
						</View>
					))}
				</View>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	weekRow: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		paddingTop: 4,
		height: CELL_HEIGHT,
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
