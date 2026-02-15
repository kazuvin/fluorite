import { fontSize, fontWeight, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CalendarDay } from "../../../features/calendar/utils/calendar-grid-utils";
import type { CalendarGridColors } from "./types";

type CalendarDayCellProps = {
	day: CalendarDay;
	colors: CalendarGridColors;
	isSelected?: boolean;
	onPress?: (dateKey: string) => void;
};

export function CalendarDayCell({ day, colors, isSelected, onPress }: CalendarDayCellProps) {
	return (
		<Pressable
			testID={`day-cell-${day.dateKey}`}
			style={styles.dayNumberCell}
			onPress={() => onPress?.(day.dateKey)}
		>
			<View
				testID={day.isToday ? "today-circle" : undefined}
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
}

const styles = StyleSheet.create({
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
