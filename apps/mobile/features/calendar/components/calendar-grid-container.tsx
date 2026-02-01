import { colors } from "@fluorite/design-tokens";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import { useColorScheme } from "react-native";
import { FlatListCalendar } from "../../../components/ui/calendar-grid";
import { computeDirection } from "../../../components/ui/rolling-number";
import {
	baseMonthValueAtom,
	baseYearValueAtom,
	setViewingMonthAtom,
	viewingMonthValueAtom,
	viewingYearValueAtom,
} from "../stores/calendar-atoms";

export function CalendarGridContainer() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const baseYear = useAtomValue(baseYearValueAtom);
	const baseMonth = useAtomValue(baseMonthValueAtom);
	const viewingYear = useAtomValue(viewingYearValueAtom);
	const viewingMonth = useAtomValue(viewingMonthValueAtom);
	const setViewingMonth = useSetAtom(setViewingMonthAtom);

	const prevYearMonth = useRef({ year: viewingYear, month: viewingMonth });
	const direction = useMemo(() => {
		const prev = prevYearMonth.current;
		const dir = computeDirection(prev.year, prev.month, viewingYear, viewingMonth);
		prevYearMonth.current = { year: viewingYear, month: viewingMonth };
		return dir;
	}, [viewingYear, viewingMonth]);

	const handleMonthChange = useCallback(
		(year: number, month: number) => setViewingMonth({ year, month }),
		[setViewingMonth],
	);

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
			onMonthChange={handleMonthChange}
		/>
	);
}
