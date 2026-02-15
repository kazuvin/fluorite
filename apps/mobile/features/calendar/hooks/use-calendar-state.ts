import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import { computeDirection } from "../../../components/ui/rolling-number";
import {
	baseMonthValueAtom,
	baseYearValueAtom,
	filteredCalendarEventsValueAtom,
	setViewingMonthAtom,
	viewingMonthValueAtom,
	viewingYearValueAtom,
} from "../stores/calendar-atoms";
import type { CalendarEvent } from "../utils/event-layout";

type CalendarState = {
	baseYear: number;
	baseMonth: number;
	viewingYear: number;
	viewingMonth: number;
	direction: 1 | -1;
	filteredCalendarEvents: CalendarEvent[];
	handleMonthChange: (year: number, month: number) => void;
};

export function useCalendarState(): CalendarState {
	const baseYear = useAtomValue(baseYearValueAtom);
	const baseMonth = useAtomValue(baseMonthValueAtom);
	const viewingYear = useAtomValue(viewingYearValueAtom);
	const viewingMonth = useAtomValue(viewingMonthValueAtom);
	const filteredCalendarEvents = useAtomValue(filteredCalendarEventsValueAtom);
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
		filteredCalendarEvents,
		handleMonthChange,
	};
}
