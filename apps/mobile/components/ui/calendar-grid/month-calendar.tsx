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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import { textBase } from "../../../constants/theme";
import { useCalendarTransition } from "../../../features/calendar/hooks/use-calendar-transition";
import {
	findWeekIndexForDateKey,
	generateCalendarGrid,
	generateOffsets,
	isSameWeek,
	offsetToYearMonth,
	parseDateKey,
} from "../../../features/calendar/utils/calendar-grid-utils";
import type { CalendarEvent } from "../../../features/calendar/utils/event-layout";
import { computeGlobalEventSlots } from "../../../features/calendar/utils/event-layout";
import { RollingNumber } from "../rolling-number";
import { INITIAL_INDEX, MONTH_HEIGHT, OFFSET_RANGE, WEEKDAY_LABELS } from "./constants";
import { MonthGrid } from "./month-grid";
import type { CalendarGridColors } from "./types";
import { WeekCalendar } from "./week-calendar";
import { WeekGrid } from "./week-grid";

type MonthCalendarProps = {
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
	onWeekChange?: (centerDateKey: string) => void;
};

export function MonthCalendar({
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
	onWeekChange,
}: MonthCalendarProps) {
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
				<MonthGrid
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
	const prevWeekAnchorRef = useRef<string | null>(null);
	const weekSlideX = useSharedValue(0);
	const weekSwipedRef = useRef(false);

	// 退場する旧週のスライドアニメーション用
	const slidingOutAnchorRef = useRef<string | null>(null);
	const weekSlideOutX = useSharedValue(0);
	const weekSlideOutOpacity = useSharedValue(0);
	const globalSlots = useMemo(() => computeGlobalEventSlots(events), [events]);

	if (transition.showWeekCalendar) {
		if (selectedDateKey) {
			if (!weekAnchorRef.current) {
				weekAnchorRef.current = selectedDateKey;
			} else if (!isSameWeek(weekAnchorRef.current, selectedDateKey)) {
				weekAnchorRef.current = selectedDateKey;
			}
		}
		// expanding 中（selectedDateKey=null だが showWeekCalendar=true）は
		// weekAnchorRef を保持して週カレンダーの即時アンマウントを防ぐ。
		// useEffect で monthOpacity=1 が反映される前にアンマウントすると
		// 両カレンダーが非表示になり1フレーム空白（チラつき）が発生する。
	} else {
		weekAnchorRef.current = null;
	}

	// 週アンカー変更時にスライドアニメーションを発火（週スワイプ由来の場合はスキップ）
	// 退場する旧週を WeekGrid でプリレンダリングし、チラつきを防止
	const currentAnchor = weekAnchorRef.current;
	if (currentAnchor && prevWeekAnchorRef.current && currentAnchor !== prevWeekAnchorRef.current) {
		if (!weekSwipedRef.current) {
			const slideDirection = currentAnchor > prevWeekAnchorRef.current ? 1 : -1;

			// 退場: 旧週を WeekGrid でレンダリングし、スライドアウト
			slidingOutAnchorRef.current = prevWeekAnchorRef.current;
			weekSlideOutOpacity.value = 1;
			weekSlideOutX.value = 0;
			weekSlideOutX.value = withTiming(-slideDirection * width, ANIMATION.entering, (finished) => {
				if (finished) {
					weekSlideOutOpacity.value = 0;
				}
			});

			// 入場: 新週の WeekCalendar をスライドイン
			weekSlideX.value = slideDirection * width;
			weekSlideX.value = withTiming(0, ANIMATION.entering);
		}
	}
	weekSwipedRef.current = false;
	prevWeekAnchorRef.current = currentAnchor;

	const handleWeekSwipeChange = useCallback(
		(dateKey: string) => {
			weekSwipedRef.current = true;
			onWeekChange?.(dateKey);
		},
		[onWeekChange],
	);

	const weekSlideStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: weekSlideX.value }],
	}));

	const weekSlideOutStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: weekSlideOutX.value }],
		opacity: weekSlideOutOpacity.value,
	}));

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
				{transition.showWeekCalendar && weekAnchorRef.current && (
					<Animated.View style={[styles.weekCalendarWrapper, transition.weekCalendarStyle]}>
						{/* 退場する旧週（スライドアウト） */}
						{slidingOutAnchorRef.current && (
							<Animated.View style={[styles.weekCalendarSliding, weekSlideOutStyle]}>
								<WeekGrid
									dateKey={slidingOutAnchorRef.current}
									weekOffset={0}
									colors={colors}
									events={events}
									width={width}
									selectedDateKey={selectedDateKey}
									today={today}
									globalSlots={globalSlots}
								/>
							</Animated.View>
						)}

						{/* 入場する新週 / 通常表示 */}
						<Animated.View style={weekSlideStyle}>
							<WeekCalendar
								dateKey={weekAnchorRef.current}
								colors={colors}
								events={events}
								width={width}
								selectedDateKey={selectedDateKey}
								onSelectDate={onSelectDate}
								onWeekChange={handleWeekSwipeChange}
								today={today}
							/>
						</Animated.View>
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
		...textBase,
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
		...textBase,
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.normal,
	},
	calendarContainer: {
		overflow: "hidden" as const,
	},
	weekCalendarWrapper: {
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
		overflow: "hidden" as const,
	},
	weekCalendarSliding: {
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
	},
});
