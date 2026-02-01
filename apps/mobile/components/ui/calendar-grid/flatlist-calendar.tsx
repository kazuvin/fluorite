import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { useCallback, useMemo, useRef } from "react";
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
import { RollingNumber } from "../rolling-number";
import { CELL_HEIGHT, type CalendarGridColors, CalendarMonthPage } from "./calendar-month-page";
import type { CalendarEvent } from "./event-layout";
import { generateOffsets, offsetToYearMonth } from "./utils";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const OFFSET_RANGE = 120;
const INITIAL_INDEX = OFFSET_RANGE;

type FlatListCalendarProps = {
	baseYear: number;
	baseMonth: number;
	viewingYear: number;
	viewingMonth: number;
	direction: 1 | -1;
	colors: CalendarGridColors;
	events: CalendarEvent[];
	onMonthChange: (year: number, month: number) => void;
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
}: FlatListCalendarProps) {
	const { width } = useWindowDimensions();
	const flatListRef = useRef<FlatList<number>>(null);

	const offsets = useMemo(() => generateOffsets(OFFSET_RANGE), []);

	const today = useMemo(() => new Date(), []);

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: width,
			offset: width * index,
			index,
		}),
		[width],
	);

	const handleMomentumScrollEnd = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
			const offset = offsets[pageIndex];
			if (offset !== undefined) {
				const { year, month } = offsetToYearMonth(baseYear, baseMonth, offset);
				onMonthChange(year, month);
			}
		},
		[width, offsets, baseYear, baseMonth, onMonthChange],
	);

	const renderItem = useCallback(
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
				/>
			);
		},
		[baseYear, baseMonth, today, colors, events, width],
	);

	const keyExtractor = useCallback((item: number) => String(item), []);

	return (
		<View>
			<View style={styles.header}>
				<RollingNumber
					value={String(viewingYear)}
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
					value={String(viewingMonth + 1)}
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
			</View>

			<View style={styles.weekdayRow}>
				{WEEKDAY_LABELS.map((label) => (
					<View key={label} style={styles.weekdayCell}>
						<Text style={[styles.weekdayText, { color: colors.muted }]}>{label}</Text>
					</View>
				))}
			</View>

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
				onMomentumScrollEnd={handleMomentumScrollEnd}
				style={{ height: CELL_HEIGHT * 7 }}
			/>
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
});
