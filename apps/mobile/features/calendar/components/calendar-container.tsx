import { colors } from "@fluorite/design-tokens";
import { useCallback, useRef } from "react";
import { StyleSheet, View, useColorScheme, useWindowDimensions } from "react-native";
import Animated from "react-native-reanimated";
import { MonthCalendar } from "../../../components/ui/calendar-grid";
import { DailyCalendarPager } from "../../../components/ui/calendar-grid/daily-calendar-pager";
import { useCalendarState } from "../hooks/use-calendar-state";
import { useDailyCalendarVisibility } from "../hooks/use-daily-calendar-visibility";
import { useDailySlideAnimation } from "../hooks/use-daily-slide-animation";
import { useSelectedDate } from "../hooks/use-selected-date";
import { CategoryFilterBar } from "./category-filter-bar";

export function CalendarContainer() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const { width } = useWindowDimensions();

	const {
		baseYear,
		baseMonth,
		viewingYear,
		viewingMonth,
		direction,
		filteredCalendarEvents,
		handleMonthChange,
	} = useCalendarState();

	const {
		selectedDateKey,
		selectedWeekIndex,
		handleSelectDate,
		handleWeekChange,
		handleNavigateToDate,
	} = useSelectedDate(viewingYear, viewingMonth);

	const isSelected = selectedDateKey != null;
	const { animatedStyle: dailyCalendarStyle, showDailyCalendar } =
		useDailyCalendarVisibility(isSelected);

	// 退場アニメーション中も最後の dateKey を保持する
	const dailyDateKeyRef = useRef(selectedDateKey);
	if (selectedDateKey != null) {
		dailyDateKeyRef.current = selectedDateKey;
	}
	const dailyDateKey = selectedDateKey ?? dailyDateKeyRef.current;
	const { slideStyle, markWeekSwipe, markDailySwipe, onDateKeyChange } =
		useDailySlideAnimation(width);

	const handleWeekChangeWithSlide = useCallback(
		(centerDateKey: string) => {
			markWeekSwipe();
			handleWeekChange(centerDateKey);
		},
		[markWeekSwipe, handleWeekChange],
	);

	// デイリースワイプ時にマークしてから日付遷移（DailyCalendar のフェードをスキップ）
	const handleNavigateToDateWithMark = useCallback(
		(dateKey: string) => {
			markDailySwipe();
			handleNavigateToDate(dateKey);
		},
		[markDailySwipe, handleNavigateToDate],
	);

	// 日付変更時にスライドアニメーションを通知
	const prevSelectedRef = useRef(selectedDateKey);
	if (selectedDateKey !== prevSelectedRef.current) {
		onDateKeyChange(selectedDateKey);
		prevSelectedRef.current = selectedDateKey;
	}

	return (
		<View style={styles.root}>
			<MonthCalendar
				baseYear={baseYear}
				baseMonth={baseMonth}
				viewingYear={viewingYear}
				viewingMonth={viewingMonth}
				direction={direction}
				colors={{
					text: theme.text,
					background: theme.background,
					primary: theme.primary,
					muted: theme.icon,
				}}
				events={filteredCalendarEvents}
				onMonthChange={handleMonthChange}
				selectedDateKey={selectedDateKey}
				selectedWeekIndex={selectedWeekIndex}
				onSelectDate={handleSelectDate}
				onWeekChange={handleWeekChangeWithSlide}
			/>
			<View style={styles.filterBarContainer}>
				<CategoryFilterBar />
			</View>
			{(isSelected || showDailyCalendar) && dailyDateKey && (
				<Animated.View style={[styles.dailyCalendarContainer, dailyCalendarStyle]}>
					<Animated.View style={[styles.dailyCalendarInner, slideStyle]}>
						<DailyCalendarPager
							dateKey={dailyDateKey}
							events={filteredCalendarEvents}
							textColor={theme.text}
							onDateChange={handleNavigateToDateWithMark}
						/>
					</Animated.View>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	filterBarContainer: {
		flexShrink: 0,
	},
	dailyCalendarContainer: {
		flex: 1,
	},
	dailyCalendarInner: {
		flex: 1,
	},
});
