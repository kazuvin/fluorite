import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import {
	findWeekIndexForDateKey,
	generateCalendarGrid,
} from "../../../components/ui/calendar-grid/utils";
import {
	clearSelectedDateAtom,
	selectDateAtom,
	selectedDateValueAtom,
} from "../stores/selected-date-atoms";

type SelectedDateState = {
	selectedDateKey: string | null;
	selectedWeekIndex: number;
	handleSelectDate: (dateKey: string) => void;
	handleClearDate: () => void;
};

export function useSelectedDate(viewingYear: number, viewingMonth: number): SelectedDateState {
	const selectedDateKey = useAtomValue(selectedDateValueAtom);
	const selectDate = useSetAtom(selectDateAtom);
	const clearDate = useSetAtom(clearSelectedDateAtom);

	const selectedWeekIndex = useMemo(() => {
		if (!selectedDateKey) return -1;
		const grid = generateCalendarGrid(viewingYear, viewingMonth);
		return findWeekIndexForDateKey(grid, selectedDateKey);
	}, [selectedDateKey, viewingYear, viewingMonth]);

	const handleSelectDate = useCallback((dateKey: string) => selectDate(dateKey), [selectDate]);

	const handleClearDate = useCallback(() => clearDate(), [clearDate]);

	return {
		selectedDateKey,
		selectedWeekIndex,
		handleSelectDate,
		handleClearDate,
	};
}
