import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import { generateCalendarGrid } from "../calendar-grid/utils";
import { IconSymbol } from "../icon-symbol";
import { formatDateLabel, parseDateString } from "./utils";

export type DatePickerProps = {
	value?: string;
	onValueChange: (date: string) => void;
	placeholder?: string;
	testID?: string;
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function DatePicker({
	value,
	onValueChange,
	placeholder,
	testID = "date-picker-trigger",
}: DatePickerProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const initialDate = value
		? parseDateString(value)
		: { year: new Date().getFullYear(), month: new Date().getMonth() };

	const [isOpen, setIsOpen] = useState(false);
	const [displayYear, setDisplayYear] = useState(initialDate.year);
	const [displayMonth, setDisplayMonth] = useState(initialDate.month);

	const grid = generateCalendarGrid(displayYear, displayMonth);

	const handlePrevMonth = () => {
		if (displayMonth === 0) {
			setDisplayYear((y) => y - 1);
			setDisplayMonth(11);
		} else {
			setDisplayMonth((m) => m - 1);
		}
	};

	const handleNextMonth = () => {
		if (displayMonth === 11) {
			setDisplayYear((y) => y + 1);
			setDisplayMonth(0);
		} else {
			setDisplayMonth((m) => m + 1);
		}
	};

	const handleDayPress = (dateKey: string) => {
		onValueChange(dateKey);
		setIsOpen(false);
	};

	return (
		<View>
			<Pressable
				testID={testID}
				onPress={() => setIsOpen((v) => !v)}
				style={[styles.trigger, { backgroundColor: theme.muted, color: theme.text }]}
			>
				<Text
					style={{ color: value ? theme.text : theme.icon, fontSize: parseNumeric(fontSize.base) }}
				>
					{value ? formatDateLabel(value) : placeholder}
				</Text>
			</Pressable>

			{isOpen && (
				<View testID="date-picker-calendar" style={styles.calendar}>
					{/* Header */}
					<View style={styles.header}>
						<Pressable onPress={handlePrevMonth}>
							<IconSymbol name="chevron.left" size={20} color={theme.text} />
						</Pressable>
						<Text
							testID="date-picker-header-label"
							style={{ color: theme.text, fontSize: parseNumeric(fontSize.base) }}
						>
							{displayYear}年{displayMonth + 1}月
						</Text>
						<Pressable onPress={handleNextMonth}>
							<IconSymbol name="chevron.right" size={20} color={theme.text} />
						</Pressable>
					</View>

					{/* Weekday header */}
					<View style={styles.weekRow}>
						{WEEKDAY_LABELS.map((label) => (
							<View key={label} style={styles.dayCell}>
								<Text style={{ color: theme.text, fontSize: parseNumeric(fontSize.base) }}>
									{label}
								</Text>
							</View>
						))}
					</View>

					{/* Calendar grid */}
					{grid.map((week) => (
						<View key={week[0].dateKey} style={styles.weekRow}>
							{week.map((day) => {
								const isSelected = value === day.dateKey;
								return (
									<Pressable
										key={day.dateKey}
										style={[
											styles.dayCell,
											isSelected && { backgroundColor: theme.tint, borderRadius: 999 },
										]}
										onPress={() => handleDayPress(day.dateKey)}
									>
										<Text
											style={{
												color: isSelected ? "#ffffff" : theme.text,
												opacity: day.isCurrentMonth ? 1 : 0.3,
												fontSize: parseNumeric(fontSize.base),
											}}
										>
											{day.date}
										</Text>
									</Pressable>
								);
							})}
						</View>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	trigger: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		fontSize: parseNumeric(fontSize.base),
	},
	calendar: {
		marginTop: parseNumeric(spacing[2]),
	},
	header: {
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
		paddingVertical: parseNumeric(spacing[2]),
	},
});
