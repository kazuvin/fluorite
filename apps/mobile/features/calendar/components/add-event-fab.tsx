import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	Keyframe,
	LinearTransition,
} from "react-native-reanimated";
import { Button, ButtonText } from "../../../components/ui/button";
import { type CalendarDay, generateCalendarGrid } from "../../../components/ui/calendar-grid/utils";
import { formatDateLabel, toDateString } from "../../../components/ui/date-picker/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const MAX_GRID_ROWS = 6;
const DAYS_PER_WEEK = 7;

type DatePickerTarget = "start" | "end" | null;

const titleEntering = new Keyframe({
	0: { opacity: 0, transform: [{ translateX: 20 }] },
	100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.out(Easing.ease) },
}).duration(100);

const titleExiting = new Keyframe({
	0: { opacity: 1, transform: [{ translateX: 0 }] },
	100: { opacity: 0, transform: [{ translateX: -20 }], easing: Easing.in(Easing.ease) },
}).duration(80);

function getTodayString(): string {
	const now = new Date();
	return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

function padGrid(grid: CalendarDay[][]): CalendarDay[][] {
	if (grid.length >= MAX_GRID_ROWS) return grid;
	const padded = [...grid];
	while (padded.length < MAX_GRID_ROWS) {
		const lastWeek = padded[padded.length - 1];
		const lastDay = lastWeek[DAYS_PER_WEEK - 1];
		const nextStart = new Date(lastDay.year, lastDay.month, lastDay.date + 1);
		const week: CalendarDay[] = [];
		for (let i = 0; i < DAYS_PER_WEEK; i++) {
			const d = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() + i);
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			week.push({
				date: d.getDate(),
				month: d.getMonth(),
				year: d.getFullYear(),
				isCurrentMonth: false,
				isToday: false,
				dateKey: `${d.getFullYear()}-${mm}-${dd}`,
			});
		}
		padded.push(week);
	}
	return padded;
}

export function AddEventFab() {
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [start, setStart] = useState(getTodayString);
	const [end, setEnd] = useState("");
	const [allDay, setAllDay] = useState(true);
	const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget>(null);
	const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
	const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const handleOpen = () => setVisible(true);
	const handleClose = () => {
		setVisible(false);
		setTitle("");
		setStart(getTodayString());
		setEnd("");
		setAllDay(true);
		setDatePickerTarget(null);
	};

	const isDatePickerMode = datePickerTarget !== null;

	const enterDatePickerMode = (target: "start" | "end") => {
		const currentValue = target === "start" ? start : end;
		if (currentValue) {
			const [y, m] = currentValue.split("-").map(Number);
			setDisplayYear(y);
			setDisplayMonth(m - 1);
		} else {
			setDisplayYear(new Date().getFullYear());
			setDisplayMonth(new Date().getMonth());
		}
		setDatePickerTarget(target);
	};

	const handleDateTriggerPress = (target: "start" | "end") => {
		if (!isDatePickerMode) {
			enterDatePickerMode(target);
		} else {
			setDatePickerTarget(target);
		}
	};

	const handleDayPress = (dateKey: string) => {
		if (datePickerTarget === "start") {
			setStart(dateKey);
			if (end && dateKey > end) {
				setStart(end);
				setEnd(dateKey);
			}
		} else if (datePickerTarget === "end") {
			if (start && dateKey < start) {
				setEnd(start);
				setStart(dateKey);
			} else {
				setEnd(dateKey);
			}
		}
	};

	const handleDatePickerBack = () => {
		setDatePickerTarget(null);
	};

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

	const rawGrid = generateCalendarGrid(displayYear, displayMonth);
	const grid = padGrid(rawGrid);

	const getDateTriggerDisplayValue = (target: "start" | "end") => {
		const value = target === "start" ? start : end;
		return value ? formatDateLabel(value) : target === "start" ? "開始日" : "終了日";
	};

	const getDateTriggerHasValue = (target: "start" | "end") => {
		return target === "start" ? !!start : !!end;
	};

	const hasRange = !!start && !!end && start !== end;

	const getDayTestId = (dateKey: string) => {
		const isStart = start === dateKey;
		const isEnd = end === dateKey;
		const isInRange = hasRange && start < dateKey && dateKey < end;

		if (isStart) return "calendar-day-range-start";
		if (hasRange && isEnd) return "calendar-day-range-end";
		if (isInRange) return "calendar-day-in-range";
		return "calendar-day";
	};

	return (
		<>
			<Pressable
				testID="add-event-fab"
				accessibilityRole="button"
				onPress={handleOpen}
				style={({ pressed }) => [
					styles.fab,
					{ backgroundColor: theme.tint },
					pressed && styles.pressed,
				]}
			>
				<IconSymbol name="plus" size={28} color="#fff" />
			</Pressable>
			<Dialog visible={visible} onClose={handleClose} closeOnOverlayPress={false}>
				<DialogHeader>
					{isDatePickerMode ? (
						<Animated.View
							key="picker-header"
							entering={titleEntering}
							exiting={titleExiting}
							style={styles.datePickerHeader}
						>
							<Pressable
								testID="date-picker-back"
								accessibilityRole="button"
								onPress={handleDatePickerBack}
								style={styles.backButton}
							>
								<IconSymbol name="chevron.left" size={20} color={theme.text} />
							</Pressable>
							<DialogTitle>開始日・終了日</DialogTitle>
						</Animated.View>
					) : (
						<Animated.View
							key="normal-header"
							entering={titleEntering}
							exiting={titleExiting}
							style={styles.normalHeader}
						>
							<DialogTitle>予定を追加</DialogTitle>
							<Pressable
								testID="dialog-close"
								accessibilityRole="button"
								onPress={handleClose}
								style={styles.closeButton}
							>
								<IconSymbol name="xmark" size={16} color={colors.light.icon} />
							</Pressable>
						</Animated.View>
					)}
				</DialogHeader>
				<DialogContent>
					{!isDatePickerMode && (
						<Animated.View
							key="form-fields"
							entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
							exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
							style={styles.formFieldsAboveDate}
						>
							<Input placeholder="タイトル" value={title} onChangeText={setTitle} />
						</Animated.View>
					)}

					{/* 日付トリガー行 — 常に表示 */}
					<Animated.View
						testID="date-row"
						layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
						style={styles.dateRow}
					>
						<Animated.View
							style={styles.dateFlex}
							layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
						>
							<Pressable
								testID="date-trigger-start"
								onPress={() => handleDateTriggerPress("start")}
								style={[
									styles.dateTrigger,
									{ backgroundColor: theme.muted },
									datePickerTarget === "start" && {
										...styles.dateTriggerFocused,
										borderColor: theme.tint,
									},
								]}
							>
								<Text
									style={{
										color: getDateTriggerHasValue("start") ? theme.text : theme.icon,
										fontSize: parseNumeric(fontSize.xs),
									}}
								>
									{getDateTriggerDisplayValue("start")}
								</Text>
							</Pressable>
						</Animated.View>
						<Animated.View
							style={styles.dateFlex}
							layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
						>
							<Pressable
								testID="date-trigger-end"
								onPress={() => handleDateTriggerPress("end")}
								style={[
									styles.dateTrigger,
									{ backgroundColor: theme.muted },
									datePickerTarget === "end" && {
										...styles.dateTriggerFocused,
										borderColor: theme.tint,
									},
								]}
							>
								<Text
									style={{
										color: getDateTriggerHasValue("end") ? theme.text : theme.icon,
										fontSize: parseNumeric(fontSize.xs),
									}}
								>
									{getDateTriggerDisplayValue("end")}
								</Text>
							</Pressable>
						</Animated.View>
					</Animated.View>

					{isDatePickerMode && (
						<Animated.View
							key="calendar-mode"
							entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
							exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
						>
							{/* インラインカレンダー */}
							<View testID="inline-calendar" style={styles.calendar}>
								<View style={styles.calendarHeader}>
									<Pressable testID="calendar-prev" onPress={handlePrevMonth}>
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
									<Pressable testID="calendar-next" onPress={handleNextMonth}>
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
													testID={getDayTestId(day.dateKey)}
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
													onPress={() => handleDayPress(day.dateKey)}
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
						</Animated.View>
					)}

					{!isDatePickerMode && (
						<Animated.View
							key="switch-all-day"
							entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
							exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
							style={styles.formFieldsAboveDate}
						>
							<Switch label="終日" value={allDay} onValueChange={setAllDay} />
						</Animated.View>
					)}

					{!isDatePickerMode && (
						<Animated.View
							key="add-button"
							entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
							exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
						>
							<Button>
								<ButtonText>追加する</ButtonText>
							</Button>
						</Animated.View>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

const OUTLINE_OFFSET = 3;
const OUTLINE_WIDTH = 2;

const styles = StyleSheet.create({
	dateRow: {
		flexDirection: "row",
		gap: parseNumeric(spacing[2]),
	},
	dateFlex: {
		flex: 1,
	},
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		right: parseNumeric(spacing[5]),
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		elevation: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	pressed: {
		opacity: 0.8,
	},
	datePickerHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[3]),
	},
	normalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		flex: 1,
	},
	backButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	dateTrigger: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		borderWidth: OUTLINE_WIDTH,
		borderColor: "transparent",
		margin: OUTLINE_OFFSET,
	},
	dateTriggerFocused: {
		borderWidth: OUTLINE_WIDTH,
	},
	formFieldsAboveDate: {
		gap: parseNumeric(spacing[6]),
	},
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
