import { colors } from "@fluorite/design-tokens";
import { StyleSheet, View, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { DailyCalendar } from "../../../components/ui/calendar-grid/daily-calendar";
import { useCalendarGrid } from "../hooks/use-calendar-grid";
import {
	DAILY_CALENDAR_HEIGHT,
	useDailyCalendarAnimation,
} from "../hooks/use-daily-calendar-animation";
import { useDailyCalendarData } from "../hooks/use-daily-calendar-data";
import { useSelectedDate } from "../hooks/use-selected-date";
import { CategoryFilterBar } from "./category-filter-bar";

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
	const { animatedStyle: dailyCalendarStyle } = useDailyCalendarAnimation(isSelected);

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
