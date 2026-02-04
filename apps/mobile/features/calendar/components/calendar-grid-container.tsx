import { colors } from "@fluorite/design-tokens";
import { useEffect } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { DailyCalendar } from "../../../components/ui/calendar-grid/daily-calendar";
import { useCalendarGrid } from "../hooks/use-calendar-grid";
import { useDailyCalendarData } from "../hooks/use-daily-calendar-data";
import { useSelectedDate } from "../hooks/use-selected-date";
import { CategoryFilterBar } from "./category-filter-bar";

const DAILY_SLIDE_OFFSET = 20;
const TIMING_CONFIG = { duration: 300, easing: Easing.out(Easing.cubic) };

const DAILY_CALENDAR_HEIGHT = 400;

export function CalendarGridContainer() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const {
		baseYear,
		baseMonth,
		viewingYear,
		viewingMonth,
		direction,
		filteredCalendarEvents,
		handleMonthChange,
	} = useCalendarGrid();

	const { selectedDateKey, selectedWeekIndex, handleSelectDate } = useSelectedDate(
		viewingYear,
		viewingMonth,
	);

	const { layout, currentTimeSlot } = useDailyCalendarData(selectedDateKey, filteredCalendarEvents);

	const isSelected = selectedDateKey != null;

	const dailyCalendarOpacity = useSharedValue(0);
	const dailyCalendarTranslateY = useSharedValue(DAILY_SLIDE_OFFSET);

	useEffect(() => {
		if (isSelected) {
			dailyCalendarOpacity.value = withTiming(1, TIMING_CONFIG);
			dailyCalendarTranslateY.value = withTiming(0, TIMING_CONFIG);
		} else {
			dailyCalendarOpacity.value = withTiming(0, TIMING_CONFIG);
			dailyCalendarTranslateY.value = withTiming(DAILY_SLIDE_OFFSET, TIMING_CONFIG);
		}
	}, [isSelected, dailyCalendarOpacity, dailyCalendarTranslateY]);

	const dailyCalendarStyle = useAnimatedStyle(() => ({
		opacity: dailyCalendarOpacity.value,
		transform: [{ translateY: dailyCalendarTranslateY.value }],
	}));

	return (
		<View>
			<FlatListCalendar
				baseYear={baseYear}
				baseMonth={baseMonth}
				viewingYear={viewingYear}
				viewingMonth={viewingMonth}
				direction={direction}
				colors={{
					text: theme.text,
					background: theme.background,
					tint: theme.tint,
					muted: theme.icon,
				}}
				events={filteredCalendarEvents}
				onMonthChange={handleMonthChange}
				selectedDateKey={selectedDateKey}
				selectedWeekIndex={selectedWeekIndex}
				onSelectDate={handleSelectDate}
			/>
			<CategoryFilterBar />
			{isSelected && selectedDateKey && (
				<Animated.View style={[styles.dailyCalendarContainer, dailyCalendarStyle]}>
					<DailyCalendar
						dateKey={selectedDateKey}
						layout={layout}
						textColor={theme.text}
						currentTimeSlot={currentTimeSlot}
					/>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	dailyCalendarContainer: {
		height: DAILY_CALENDAR_HEIGHT,
	},
});
