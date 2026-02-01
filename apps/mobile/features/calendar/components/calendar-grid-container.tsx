import { colors } from "@fluorite/design-tokens";
import { useAtomValue, useSetAtom } from "jotai";
import { useColorScheme } from "react-native";
import { CalendarGrid } from "../../../components/ui/calendar-grid";
import {
	calendarGridValueAtom,
	goToNextMonthAtom,
	goToPrevMonthAtom,
	monthValueAtom,
	yearValueAtom,
} from "../stores/calendar-atoms";

export function CalendarGridContainer() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const year = useAtomValue(yearValueAtom);
	const month = useAtomValue(monthValueAtom);
	const grid = useAtomValue(calendarGridValueAtom);
	const goToPrevMonth = useSetAtom(goToPrevMonthAtom);
	const goToNextMonth = useSetAtom(goToNextMonthAtom);

	return (
		<CalendarGrid
			year={year}
			month={month}
			grid={grid}
			colors={{
				text: theme.text,
				background: theme.background,
				tint: theme.tint,
				muted: theme.icon,
			}}
			onPrevMonth={goToPrevMonth}
			onNextMonth={goToNextMonth}
		/>
	);
}
