import { colors } from "@fluorite/design-tokens";
import { useEffect } from "react";
import { View, useColorScheme } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { DailyCalendarPlaceholder } from "../../../components/ui/calendar-grid/daily-calendar-placeholder";
import { useCalendarGrid } from "../hooks/use-calendar-grid";
import { useSelectedDate } from "../hooks/use-selected-date";
import { CategoryFilterBar } from "./category-filter-bar";

const DAILY_SLIDE_OFFSET = 20;
const TIMING_CONFIG = { duration: 300, easing: Easing.out(Easing.cubic) };

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
			{isSelected && (
				<Animated.View style={dailyCalendarStyle}>
					<DailyCalendarPlaceholder
						isVisible={true}
						dateKey={selectedDateKey ?? null}
						textColor={theme.text}
					/>
				</Animated.View>
			)}
		</View>
	);
}
