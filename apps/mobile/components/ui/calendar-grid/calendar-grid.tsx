import { fontSize, fontWeight, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { CalendarDay } from "./utils";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type CalendarGridColors = {
	text: string;
	background: string;
	tint: string;
	muted: string;
};

export type CalendarGridProps = {
	year: number;
	month: number;
	grid: CalendarDay[][];
	colors: CalendarGridColors;
	onPrevMonth?: () => void;
	onNextMonth?: () => void;
	style?: ViewStyle;
};

export function CalendarGrid({
	year,
	month,
	grid,
	colors,
	onPrevMonth,
	onNextMonth,
	style,
}: CalendarGridProps) {
	return (
		<View style={[styles.container, style]}>
			<View style={styles.header}>
				<Pressable
					onPress={onPrevMonth}
					style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
				>
					<Text style={[styles.navText, { color: colors.tint }]}>{"<"}</Text>
				</Pressable>
				<Text style={[styles.headerTitle, { color: colors.text }]}>
					{year}年{month + 1}月
				</Text>
				<Pressable
					onPress={onNextMonth}
					style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
				>
					<Text style={[styles.navText, { color: colors.tint }]}>{">"}</Text>
				</Pressable>
			</View>

			<View style={styles.weekdayRow}>
				{WEEKDAY_LABELS.map((label) => (
					<View key={label} style={styles.cell}>
						<Text style={[styles.weekdayText, { color: colors.muted }]}>{label}</Text>
					</View>
				))}
			</View>

			{grid.map((week) => (
				<View key={`week-${week[0].year}-${week[0].month}-${week[0].date}`} style={styles.weekRow}>
					{week.map((day) => (
						<View key={`${day.year}-${day.month}-${day.date}`} style={styles.cell}>
							<View style={[styles.dayCircle, day.isToday && { backgroundColor: colors.tint }]}>
								<Text
									style={[
										styles.dayText,
										{ color: day.isCurrentMonth ? colors.text : colors.muted },
										day.isToday && { color: colors.background, fontWeight: fontWeight.bold },
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
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: parseNumeric(spacing[2]),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: parseNumeric(spacing[4]),
	},
	navButton: {
		padding: parseNumeric(spacing[2]),
	},
	pressed: {
		opacity: 0.7,
	},
	navText: {
		fontSize: parseNumeric(fontSize.xl),
		fontWeight: fontWeight.bold,
	},
	headerTitle: {
		fontSize: parseNumeric(fontSize.xl),
		fontWeight: fontWeight.bold,
	},
	weekdayRow: {
		flexDirection: "row",
		marginBottom: parseNumeric(spacing[1]),
	},
	weekRow: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		height: CELL_SIZE,
	},
	weekdayText: {
		fontSize: parseNumeric(fontSize.sm),
		fontWeight: fontWeight.medium,
	},
	dayCircle: {
		width: 32,
		height: 32,
		borderRadius: parseNumeric(radius.full),
		alignItems: "center",
		justifyContent: "center",
	},
	dayText: {
		fontSize: parseNumeric(fontSize.base),
	},
});
