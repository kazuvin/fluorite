import { colors, fontSize, parseNumeric, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import type { CalendarDay } from "../../../../components/ui/calendar-grid/utils";
import { IconSymbol } from "../../../../components/ui/icon-symbol";
import { getDayTestId } from "../../utils/calendar-utils";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type DateRangePickerInlineProps = {
	displayYear: number;
	displayMonth: number;
	grid: CalendarDay[][];
	start: string;
	end: string;
	hasRange: boolean;
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onDayPress: (dateKey: string) => void;
};

export function DateRangePickerInline({
	displayYear,
	displayMonth,
	grid,
	start,
	end,
	hasRange,
	onPrevMonth,
	onNextMonth,
	onDayPress,
}: DateRangePickerInlineProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View testID="inline-calendar" style={styles.calendar}>
			<View style={styles.calendarHeader}>
				<Pressable testID="calendar-prev" onPress={onPrevMonth}>
					<IconSymbol name="chevron.left" size={20} color={theme.text} />
				</Pressable>
				<Text
					style={{
						color: theme.text,
						fontSize: parseNumeric(fontSize.base),
					}}
				>
					{displayYear}年{displayMonth + 1}月
				</Text>
				<Pressable testID="calendar-next" onPress={onNextMonth}>
					<IconSymbol name="chevron.right" size={20} color={theme.text} />
				</Pressable>
			</View>

			<View style={styles.weekRow}>
				{WEEKDAY_LABELS.map((label) => (
					<View key={label} style={styles.dayCell}>
						<Text
							style={{
								color: theme.text,
								fontSize: parseNumeric(fontSize.base),
							}}
						>
							{label}
						</Text>
					</View>
				))}
			</View>

			{grid.map((week) => (
				<View key={week[0].dateKey} style={styles.weekRow}>
					{week.map((day) => {
						const isStart = start === day.dateKey;
						const isEnd = end === day.dateKey;
						const isInRange = hasRange && start < day.dateKey && day.dateKey < end;
						const isEndpoint = isStart || (hasRange && isEnd);
						const isSingleOnly = (isStart && !hasRange) || (isEnd && !hasRange);

						return (
							<Pressable
								key={day.dateKey}
								testID={getDayTestId(day.dateKey, start, end)}
								style={[
									styles.dayCell,
									hasRange &&
										isInRange && {
											backgroundColor: `${theme.tint}26`,
										},
									hasRange &&
										isStart && {
											backgroundColor: `${theme.tint}26`,
											borderTopLeftRadius: 999,
											borderBottomLeftRadius: 999,
											borderTopRightRadius: 0,
											borderBottomRightRadius: 0,
										},
									hasRange &&
										isEnd && {
											backgroundColor: `${theme.tint}26`,
											borderTopRightRadius: 999,
											borderBottomRightRadius: 999,
											borderTopLeftRadius: 0,
											borderBottomLeftRadius: 0,
										},
								]}
								onPress={() => onDayPress(day.dateKey)}
							>
								<View
									style={[
										styles.dayInner,
										isEndpoint && {
											backgroundColor: theme.tint,
											borderRadius: 999,
										},
										isSingleOnly && {
											backgroundColor: theme.tint,
											borderRadius: 999,
										},
									]}
								>
									<Text
										style={{
											color: isEndpoint || isSingleOnly ? "#ffffff" : theme.text,
											opacity: day.isCurrentMonth ? 1 : 0.3,
											fontSize: parseNumeric(fontSize.sm),
										}}
									>
										{day.date}
									</Text>
								</View>
							</Pressable>
						);
					})}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	calendar: {
		marginTop: parseNumeric(spacing[4]),
	},
	calendarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[2]),
	},
	weekRow: {
		flexDirection: "row",
	},
	dayCell: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		aspectRatio: 1,
	},
	dayInner: {
		width: "80%",
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
