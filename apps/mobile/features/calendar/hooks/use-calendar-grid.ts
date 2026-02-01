import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import type { CalendarEvent } from "../../../components/ui/calendar-grid";
import { computeDirection } from "../../../components/ui/rolling-number";
import {
	baseMonthValueAtom,
	baseYearValueAtom,
	calendarEventsValueAtom,
	setViewingMonthAtom,
	viewingMonthValueAtom,
	viewingYearValueAtom,
} from "../stores/calendar-atoms";

type CalendarGridState = {
	baseYear: number;
	baseMonth: number;
	viewingYear: number;
	viewingMonth: number;
	direction: 1 | -1;
	calendarEvents: CalendarEvent[];
	handleMonthChange: (year: number, month: number) => void;
};

export function useCalendarGrid(): CalendarGridState {
	const baseYear = useAtomValue(baseYearValueAtom);
	const baseMonth = useAtomValue(baseMonthValueAtom);
	const viewingYear = useAtomValue(viewingYearValueAtom);
	const viewingMonth = useAtomValue(viewingMonthValueAtom);
	const calendarEvents = useAtomValue(calendarEventsValueAtom);
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

	return {
		baseYear,
		baseMonth,
		viewingYear,
		viewingMonth,
		direction,
		calendarEvents,
		handleMonthChange,
	};
}
