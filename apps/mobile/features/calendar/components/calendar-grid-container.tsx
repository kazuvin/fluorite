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
import { useDateChangeAnimation } from "../hooks/use-date-change-animation";
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

	const { selectedDateKey, selectedWeekIndex, handleSelectDate, handleWeekChange } =
		useSelectedDate(viewingYear, viewingMonth);

	const { layout, currentTimeSlot } = useDailyCalendarData(selectedDateKey, filteredCalendarEvents);

	const isSelected = selectedDateKey != null;
	const { animatedStyle: dailyCalendarStyle } = useDailyCalendarAnimation(isSelected);
	const { animatedStyle: dateChangeStyle } = useDateChangeAnimation(selectedDateKey);

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
					primary: theme.primary,
					muted: theme.icon,
				}}
				events={filteredCalendarEvents}
				onMonthChange={handleMonthChange}
				selectedDateKey={selectedDateKey}
				selectedWeekIndex={selectedWeekIndex}
				onSelectDate={handleSelectDate}
				onWeekChange={handleWeekChange}
			/>
			<CategoryFilterBar />
			{isSelected && selectedDateKey && (
				<Animated.View style={[styles.dailyCalendarContainer, dailyCalendarStyle]}>
					<Animated.View style={[styles.dateChangeContainer, dateChangeStyle]}>
						<DailyCalendar
							dateKey={selectedDateKey}
							layout={layout}
							textColor={theme.text}
							currentTimeSlot={currentTimeSlot}
						/>
					</Animated.View>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	dailyCalendarContainer: {
		height: DAILY_CALENDAR_HEIGHT,
	},
	dateChangeContainer: {
		flex: 1,
	},
});
