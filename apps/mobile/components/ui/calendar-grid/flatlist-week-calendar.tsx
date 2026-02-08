import { memo, useCallback, useMemo, useRef } from "react";
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent, View } from "react-native";
import type { CalendarGridColors } from "./calendar-month-page";
import { CELL_HEIGHT, CalendarWeekPage } from "./calendar-week-page";
import type { CalendarEvent } from "./event-layout";
import { computeGlobalEventSlots } from "./event-layout";
import { parseDateKey } from "./utils";

const OFFSET_RANGE = 120;
const INITIAL_INDEX = OFFSET_RANGE;

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

	const lastReportedOffset = useRef<number | undefined>(undefined);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
			const offset = offsets[pageIndex];
			if (offset !== undefined && offset !== lastReportedOffset.current) {
				lastReportedOffset.current = offset;
				// 週の中心日を計算してコールバック
				const parsed = parseDateKey(dateKey);
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
				onWeekChange?.(`${y}-${m}-${d}`);
			}
		},
		[width, offsets, dateKey, onWeekChange],
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
				dateKey={dateKey}
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
		[dateKey, colors, events, width, selectedDateKey, onSelectDate, today, globalSlots],
	);

	const keyExtractor = useCallback((item: number) => `week-${item}`, []);

	return (
		<View testID="week-calendar" style={{ height: CELL_HEIGHT }}>
			<FlatList
				ref={flatListRef}
				data={offsets}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				initialScrollIndex={INITIAL_INDEX}
				getItemLayout={getItemLayout}
				renderItem={renderWeekItem}
				keyExtractor={keyExtractor}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				style={{ height: CELL_HEIGHT }}
			/>
		</View>
	);
});
