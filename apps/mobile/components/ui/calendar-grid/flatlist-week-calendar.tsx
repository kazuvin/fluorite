import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent, View } from "react-native";
import type { CalendarGridColors } from "./calendar-month-page";
import { CalendarWeekPage } from "./calendar-week-page";
import { CELL_HEIGHT, INITIAL_INDEX, OFFSET_RANGE } from "./constants";
import type { CalendarEvent } from "./event-layout";
import { computeGlobalEventSlots } from "./event-layout";
import { parseDateKey } from "./utils";

type FlatListWeekCalendarProps = {
	dateKey: string;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	width: number;
	selectedDateKey?: string | null;
	onSelectDate?: (dateKey: string) => void;
	onWeekChange?: (dateKey: string) => void;
	today?: Date;
};

export const FlatListWeekCalendar = memo(function FlatListWeekCalendar({
	dateKey,
	colors,
	events,
	width,
	selectedDateKey,
	onSelectDate,
	onWeekChange,
	today,
}: FlatListWeekCalendarProps) {
	const flatListRef = useRef<FlatList<number>>(null);

	const globalSlots = useMemo(() => computeGlobalEventSlots(events), [events]);

	const offsets = useMemo(
		() => Array.from({ length: OFFSET_RANGE * 2 + 1 }, (_, i) => i - OFFSET_RANGE),
		[],
	);

	// アンカー日付: スワイプの基準点。スワイプでは変わらず、外部変更時のみ更新。
	const [anchorDateKey, setAnchorDateKey] = useState(dateKey);
	const lastReportedOffset = useRef(0);
	const internalChangeRef = useRef(false);
	const prevDateKeyRef = useRef(dateKey);
	const needsScrollReset = useRef(false);

	// rendering 中の state 同期パターン: 中間描画を排除する
	if (dateKey !== prevDateKeyRef.current) {
		prevDateKeyRef.current = dateKey;
		if (internalChangeRef.current) {
			internalChangeRef.current = false;
		} else {
			setAnchorDateKey(dateKey);
			lastReportedOffset.current = 0;
			needsScrollReset.current = true;
		}
	}

	// scrollToIndex は DOM commit 後、paint 前に実行して1フレームのズレを防止
	useLayoutEffect(() => {
		if (needsScrollReset.current) {
			needsScrollReset.current = false;
			flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: false });
		}
	});

	const handleMomentumScrollEnd = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
			const offset = offsets[pageIndex];
			if (offset !== undefined && offset !== lastReportedOffset.current) {
				lastReportedOffset.current = offset;
				// 週の中心日を計算してコールバック
				const parsed = parseDateKey(anchorDateKey);
				const baseDate = new Date(parsed.year, parsed.month - 1, parsed.day);
				const baseDayOfWeek = baseDate.getDay();
				// Sunday of the base week + offset * 7 + 3 (center of week = Wednesday)
				const centerDate = new Date(
					parsed.year,
					parsed.month - 1,
					parsed.day - baseDayOfWeek + offset * 7 + 3,
				);
				const y = centerDate.getFullYear();
				const m = String(centerDate.getMonth() + 1).padStart(2, "0");
				const d = String(centerDate.getDate()).padStart(2, "0");
				internalChangeRef.current = true;
				onWeekChange?.(`${y}-${m}-${d}`);
			}
		},
		[width, offsets, anchorDateKey, onWeekChange],
	);

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: width,
			offset: width * index,
			index,
		}),
		[width],
	);

	const renderWeekItem = useCallback(
		({ item: offset }: { item: number }) => (
			<CalendarWeekPage
				dateKey={anchorDateKey}
				weekOffset={offset}
				colors={colors}
				events={events}
				width={width}
				selectedDateKey={selectedDateKey}
				onSelectDate={onSelectDate}
				today={today}
				globalSlots={globalSlots}
			/>
		),
		[anchorDateKey, colors, events, width, selectedDateKey, onSelectDate, today, globalSlots],
	);

	const keyExtractor = useCallback((item: number) => `week-${item}`, []);

	return (
		<View testID="week-calendar" style={{ height: CELL_HEIGHT }}>
			<FlatList
				ref={flatListRef}
				data={offsets}
				extraData={selectedDateKey}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				initialScrollIndex={INITIAL_INDEX}
				getItemLayout={getItemLayout}
				renderItem={renderWeekItem}
				keyExtractor={keyExtractor}
				onMomentumScrollEnd={handleMomentumScrollEnd}
				style={{ height: CELL_HEIGHT }}
			/>
		</View>
	);
});
