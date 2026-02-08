import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import {
	computeSameWeekdayDateKey,
	findWeekIndexForDateKey,
	generateCalendarGrid,
} from "../../../components/ui/calendar-grid/utils";
import {
	clearSelectedDateAtom,
	selectDateAtom,
	selectedDateValueAtom,
	setSelectedDateAtom,
} from "../stores/selected-date-atoms";

type SelectedDateState = {
	selectedDateKey: string | null;
	selectedWeekIndex: number;
	handleSelectDate: (dateKey: string) => void;
	handleClearDate: () => void;
	handleWeekChange: (centerDateKey: string) => void;
	handleNavigateToDate: (dateKey: string) => void;
};

export function useSelectedDate(viewingYear: number, viewingMonth: number): SelectedDateState {
	const selectedDateKey = useAtomValue(selectedDateValueAtom);
	const selectDate = useSetAtom(selectDateAtom);
	const setDate = useSetAtom(setSelectedDateAtom);
	const clearDate = useSetAtom(clearSelectedDateAtom);

	const selectedWeekIndex = useMemo(() => {
		if (!selectedDateKey) return -1;
		const grid = generateCalendarGrid(viewingYear, viewingMonth);
		return findWeekIndexForDateKey(grid, selectedDateKey);
	}, [selectedDateKey, viewingYear, viewingMonth]);

	const handleSelectDate = useCallback((dateKey: string) => selectDate(dateKey), [selectDate]);

	const handleClearDate = useCallback(() => clearDate(), [clearDate]);

	const handleWeekChange = useCallback(
		(centerDateKey: string) => {
			if (!selectedDateKey) return;
			const newDateKey = computeSameWeekdayDateKey(selectedDateKey, centerDateKey);
			setDate(newDateKey);
		},
		[selectedDateKey, setDate],
	);

	const handleNavigateToDate = useCallback((dateKey: string) => setDate(dateKey), [setDate]);

	return {
		selectedDateKey,
		selectedWeekIndex,
		handleSelectDate,
		handleClearDate,
		handleWeekChange,
		handleNavigateToDate,
	};
}
