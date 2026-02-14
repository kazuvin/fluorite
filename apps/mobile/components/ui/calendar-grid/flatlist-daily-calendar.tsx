import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	View,
	useWindowDimensions,
} from "react-native";
import { INITIAL_INDEX, OFFSET_RANGE } from "./constants";
import { DailyCalendar } from "./daily-calendar";
import { computeDailyEventLayout, timeToSlot } from "./daily-event-layout";
import type { CalendarEvent } from "./event-layout";
import { generateOffsets, getAdjacentDateKey } from "./utils";

type FlatListDailyCalendarProps = {
	dateKey: string;
	events: CalendarEvent[];
	textColor: string;
	onDateChange?: (dateKey: string) => void;
};

const DailyCalendarPage = memo(function DailyCalendarPage({
	dateKey,
	events,
	textColor,
	width,
}: {
	dateKey: string;
	events: CalendarEvent[];
	textColor: string;
	width: number;
}) {
	const layout = useMemo(() => computeDailyEventLayout(events, dateKey), [events, dateKey]);

	const currentTimeSlot = useMemo(() => {
		const now = new Date();
		const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		if (todayKey !== dateKey) return null;
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		return timeToSlot(time);
	}, [dateKey]);

	return (
		<View style={{ width, flex: 1 }}>
			<DailyCalendar
				dateKey={dateKey}
				layout={layout}
				textColor={textColor}
				currentTimeSlot={currentTimeSlot}
			/>
		</View>
	);
});

export const FlatListDailyCalendar = memo(function FlatListDailyCalendar({
	dateKey,
	events,
	textColor,
	onDateChange,
}: FlatListDailyCalendarProps) {
	const { width } = useWindowDimensions();
	const flatListRef = useRef<FlatList<number>>(null);
	const offsets = useMemo(() => generateOffsets(OFFSET_RANGE), []);

	// アンカー日付: スワイプの基準点。スワイプでは変わらず、外部変更時のみ更新。
	const [anchorDateKey, setAnchorDateKey] = useState(dateKey);
	const lastReportedOffset = useRef(0);

	// 外部から dateKey が変更された場合（グリッドタップ等）のみアンカーをリセット。
	// スワイプによる変更は anchorDateKey + lastReportedOffset と一致するため無視される。
	useEffect(() => {
		const currentDateKey = getAdjacentDateKey(anchorDateKey, lastReportedOffset.current);
		if (dateKey !== currentDateKey) {
			setAnchorDateKey(dateKey);
			lastReportedOffset.current = 0;
			flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: false });
		}
	}, [dateKey, anchorDateKey]);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
			const offset = offsets[pageIndex];
			if (offset !== undefined && offset !== lastReportedOffset.current) {
				lastReportedOffset.current = offset;
				onDateChange?.(getAdjacentDateKey(anchorDateKey, offset));
			}
		},
		[width, offsets, anchorDateKey, onDateChange],
	);

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: width,
			offset: width * index,
			index,
		}),
		[width],
	);

	const renderItem = useCallback(
		({ item: offset }: { item: number }) => (
			<DailyCalendarPage
				dateKey={getAdjacentDateKey(anchorDateKey, offset)}
				events={events}
				textColor={textColor}
				width={width}
			/>
		),
		[anchorDateKey, events, textColor, width],
	);

	const keyExtractor = useCallback((item: number) => `daily-${item}`, []);

	return (
		<View testID="flatlist-daily-calendar" style={{ flex: 1 }}>
			<FlatList
				ref={flatListRef}
				data={offsets}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				initialScrollIndex={INITIAL_INDEX}
				getItemLayout={getItemLayout}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				style={{ flex: 1 }}
			/>
		</View>
	);
});
