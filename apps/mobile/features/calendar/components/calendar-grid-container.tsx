import { colors } from "@fluorite/design-tokens";
import { useColorScheme } from "react-native";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { useCalendarGrid } from "../hooks/use-calendar-grid";

export function CalendarGridContainer() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const {
		baseYear,
		baseMonth,
		viewingYear,
		viewingMonth,
		direction,
		calendarEvents,
		handleMonthChange,
	} = useCalendarGrid();

	return (
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
			events={calendarEvents}
			onMonthChange={handleMonthChange}
		/>
	);
}
