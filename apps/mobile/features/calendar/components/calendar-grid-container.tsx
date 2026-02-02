import { colors } from "@fluorite/design-tokens";
import { View, useColorScheme } from "react-native";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { useCalendarGrid } from "../hooks/use-calendar-grid";
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
			/>
			<CategoryFilterBar />
		</View>
	);
}
