import { colors } from "@fluorite/design-tokens";
import { StyleSheet, View, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { FlatListDailyCalendar } from "../../../components/ui/calendar-grid/flatlist-daily-calendar";
import { useCalendarGrid } from "../hooks/use-calendar-grid";
import { useDailyCalendarAnimation } from "../hooks/use-daily-calendar-animation";
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

	const {
		selectedDateKey,
		selectedWeekIndex,
		handleSelectDate,
		handleWeekChange,
		handleNavigateToDate,
	} = useSelectedDate(viewingYear, viewingMonth);

	const isSelected = selectedDateKey != null;
	const { animatedStyle: dailyCalendarStyle } = useDailyCalendarAnimation(isSelected);

	return (
		<View style={styles.root}>
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
			<View style={styles.filterBarContainer}>
				<CategoryFilterBar />
			</View>
			{isSelected && selectedDateKey && (
				<Animated.View style={[styles.dailyCalendarContainer, dailyCalendarStyle]}>
					<FlatListDailyCalendar
						dateKey={selectedDateKey}
						events={filteredCalendarEvents}
						textColor={theme.text}
						onDateChange={handleNavigateToDate}
					/>
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
});
