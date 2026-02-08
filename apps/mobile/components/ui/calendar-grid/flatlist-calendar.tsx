import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useCalendarTransition } from "../../../features/calendar/hooks/use-calendar-transition";
import { RollingNumber } from "../rolling-number";
import { CELL_HEIGHT, type CalendarGridColors, CalendarMonthPage } from "./calendar-month-page";
import type { CalendarEvent } from "./event-layout";
import { FlatListWeekCalendar } from "./flatlist-week-calendar";
import {
	findWeekIndexForDateKey,
	generateCalendarGrid,
	generateOffsets,
	offsetToYearMonth,
	parseDateKey,
} from "./utils";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const OFFSET_RANGE = 120;
const INITIAL_INDEX = OFFSET_RANGE;

const MONTH_HEIGHT = CELL_HEIGHT * 6;

type FlatListCalendarProps = {
	baseYear: number;
	baseMonth: number;
	viewingYear: number;
	viewingMonth: number;
	direction: 1 | -1;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	onMonthChange: (year: number, month: number) => void;
	selectedDateKey?: string | null;
	selectedWeekIndex?: number;
	onSelectDate?: (dateKey: string) => void;
};

export function FlatListCalendar({
	baseYear,
	baseMonth,
	viewingYear,
	viewingMonth,
	direction,
	colors,
	events,
	onMonthChange,
	selectedDateKey,
	selectedWeekIndex,
	onSelectDate,
}: FlatListCalendarProps) {
	const { width } = useWindowDimensions();
	const flatListRef = useRef<FlatList<number>>(null);

	const offsets = useMemo(() => generateOffsets(OFFSET_RANGE), []);

	const today = useMemo(() => new Date(), []);

	// --- Transition hook ---
	const transition = useCalendarTransition({
		selectedDateKey: selectedDateKey ?? null,
		selectedWeekIndex: selectedWeekIndex ?? -1,
	});

	// --- Month FlatList handlers ---
	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: width,
			offset: width * index,
			index,
		}),
		[width],
	);

	const lastReportedOffset = useRef<number | undefined>(undefined);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
			const offset = offsets[pageIndex];
			if (offset !== undefined && offset !== lastReportedOffset.current) {
				lastReportedOffset.current = offset;
				const { year, month } = offsetToYearMonth(baseYear, baseMonth, offset);
				onMonthChange(year, month);
			}
		},
		[width, offsets, baseYear, baseMonth, onMonthChange],
	);

	const renderMonthItem = useCallback(
		({ item: offset }: { item: number }) => {
			const { year, month } = offsetToYearMonth(baseYear, baseMonth, offset);
			return (
				<CalendarMonthPage
					year={year}
					month={month}
					today={today}
					colors={colors}
					events={events}
					width={width}
					selectedDateKey={selectedDateKey}
					onSelectDate={onSelectDate}
					nonSelectedRowOpacity={transition.nonSelectedRowOpacity}
				/>
			);
		},
		[
			baseYear,
			baseMonth,
			today,
			colors,
			events,
			width,
			selectedDateKey,
			onSelectDate,
			transition.nonSelectedRowOpacity,
		],
	);

	const keyExtractor = useCallback((item: number) => String(item), []);

	// --- 選択解除時、前の日付が表示中の月グリッドに無ければその月へスクロール ---
	const prevSelectedDateKeyRef = useRef(selectedDateKey);
	useEffect(() => {
		const prev = prevSelectedDateKeyRef.current;
		prevSelectedDateKeyRef.current = selectedDateKey;

		if (prev == null || selectedDateKey != null) return;

		const grid = generateCalendarGrid(viewingYear, viewingMonth);
		if (findWeekIndexForDateKey(grid, prev) >= 0) return;

		const parsed = parseDateKey(prev);
		const dateMonth = parsed.month - 1;
		const offset = parsed.year * 12 + dateMonth - (baseYear * 12 + baseMonth);
		const targetIndex = INITIAL_INDEX + offset;
		flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
		onMonthChange(parsed.year, dateMonth);
	}, [selectedDateKey, viewingYear, viewingMonth, baseYear, baseMonth, onMonthChange]);

	const dayInfoStyle = useAnimatedStyle(() => ({
		opacity: transition.dayInfoOpacity.value,
	}));

	// Parse selected date for header display
	const selectedDateInfo = useMemo(() => {
		if (!selectedDateKey) return null;
		return parseDateKey(selectedDateKey);
	}, [selectedDateKey]);

	// In week mode, use selectedDateInfo's year/month for header
	const headerYear = selectedDateInfo ? selectedDateInfo.year : viewingYear;
	const headerMonth = selectedDateInfo ? selectedDateInfo.month - 1 : viewingMonth; // 0-indexed

	// --- Week anchor: 週モード突入時の日付を固定基準点として保持 ---
	const weekAnchorRef = useRef<string | null>(null);
	if (transition.showWeekCalendar && selectedDateKey) {
		if (!weekAnchorRef.current) {
			weekAnchorRef.current = selectedDateKey;
		}
	} else {
		weekAnchorRef.current = null;
	}

	return (
		<View>
			<View style={styles.header}>
				<RollingNumber
					value={String(headerYear)}
					direction={direction}
					style={{ ...styles.headerTitle, color: colors.text }}
				/>
				<Text
					style={[
						styles.headerTitle,
						{
							marginTop: parseNumeric(spacing[1]),
							color: colors.muted,
							fontSize: parseNumeric(fontSize.xs),
						},
					]}
				>
					年
				</Text>
				<RollingNumber
					value={String(headerMonth + 1)}
					direction={direction}
					style={{ ...styles.headerTitle, color: colors.text }}
				/>
				<Text
					style={[
						styles.headerTitle,
						{
							marginTop: parseNumeric(spacing[1]),
							color: colors.muted,
							fontSize: parseNumeric(fontSize.xs),
						},
					]}
				>
					月
				</Text>
				{selectedDateInfo && (
					<Animated.View style={[styles.dayInfoContainer, dayInfoStyle]}>
						<RollingNumber
							value={String(selectedDateInfo.day)}
							direction={1}
							style={{ ...styles.headerTitle, color: colors.text }}
						/>
						<Text
							style={[
								styles.headerTitle,
								{
									marginTop: parseNumeric(spacing[1]),
									color: colors.muted,
									fontSize: parseNumeric(fontSize.xs),
								},
							]}
						>
							日
						</Text>
						<Text
							style={[
								styles.headerTitle,
								{
									marginLeft: parseNumeric(spacing[2]),
									color: colors.muted,
									fontSize: parseNumeric(fontSize.xs),
								},
							]}
						>
							(
						</Text>
						<RollingNumber
							value={selectedDateInfo.weekday}
							direction={1}
							style={{
								...styles.headerTitle,
								color: colors.muted,
								fontSize: parseNumeric(fontSize.xs),
							}}
						/>
						<Text
							style={[
								styles.headerTitle,
								{
									color: colors.muted,
									fontSize: parseNumeric(fontSize.xs),
								},
							]}
						>
							)
						</Text>
					</Animated.View>
				)}
			</View>

			<View style={styles.weekdayRow}>
				{WEEKDAY_LABELS.map((label) => (
					<View key={label} style={styles.weekdayCell}>
						<Text style={[styles.weekdayText, { color: colors.muted }]}>{label}</Text>
					</View>
				))}
			</View>

			<Animated.View style={[styles.calendarContainer, transition.calendarContainerStyle]}>
				{/* Month calendar - always mounted for state preservation */}
				<Animated.View
					style={[transition.monthInnerStyle, { pointerEvents: transition.monthPointerEvents }]}
				>
					<FlatList
						ref={flatListRef}
						data={offsets}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						initialScrollIndex={INITIAL_INDEX}
						getItemLayout={getItemLayout}
						renderItem={renderMonthItem}
						keyExtractor={keyExtractor}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						scrollEnabled={transition.monthScrollEnabled}
						style={{ height: MONTH_HEIGHT }}
					/>
				</Animated.View>

				{/* Week calendar - shown after collapse animation */}
				{transition.showWeekCalendar && selectedDateKey && weekAnchorRef.current && (
					<Animated.View
						style={[
							{ position: "absolute", top: 0, left: 0, right: 0 },
							transition.weekCalendarStyle,
						]}
					>
						<FlatListWeekCalendar
							dateKey={weekAnchorRef.current}
							colors={colors}
							events={events}
							width={width}
							selectedDateKey={selectedDateKey}
							onSelectDate={onSelectDate}
							onWeekChange={undefined}
							today={today}
						/>
					</Animated.View>
				)}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: parseNumeric(spacing[5]),
		marginBottom: parseNumeric(spacing[4]),
		gap: parseNumeric(spacing[1]),
	},
	headerTitle: {
		fontSize: parseNumeric(fontSize.lg),
		fontWeight: fontWeight.semibold,
	},
	dayInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[1]),
	},
	weekdayRow: {
		flexDirection: "row",
		marginBottom: parseNumeric(spacing[1]),
	},
	weekdayCell: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	weekdayText: {
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.medium,
	},
	calendarContainer: {
		overflow: "hidden" as const,
	},
});
