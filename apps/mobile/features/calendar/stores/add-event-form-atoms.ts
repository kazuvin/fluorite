import { atom } from "jotai";
import type { CalendarDay } from "../../../components/ui/calendar-grid/utils";
import { generateCalendarGrid } from "../../../components/ui/calendar-grid/utils";
import { getTodayString, padGrid } from "../utils/calendar-utils";

export type DatePickerTarget = "start" | "end" | null;

// --- Private primitive atoms (NEVER export) ---
const titleAtom = atom("");
const startAtom = atom(getTodayString());
const endAtom = atom("");
const allDayAtom = atom(true);
const visibleAtom = atom(false);
const datePickerTargetAtom = atom<DatePickerTarget>(null);
const displayYearAtom = atom(new Date().getFullYear());
const displayMonthAtom = atom(new Date().getMonth());

// テスト用リセット atom（内部ストアをリセットする）
export const resetFormAtom = atom(null, (_get, set) => {
	set(titleAtom, "");
	set(startAtom, getTodayString());
	set(endAtom, "");
	set(allDayAtom, true);
	set(visibleAtom, false);
	set(datePickerTargetAtom, null);
	set(displayYearAtom, new Date().getFullYear());
	set(displayMonthAtom, new Date().getMonth());
});

// --- Public read-only atoms ---
export const titleValueAtom = atom((get) => get(titleAtom));
export const startValueAtom = atom((get) => get(startAtom));
export const endValueAtom = atom((get) => get(endAtom));
export const allDayValueAtom = atom((get) => get(allDayAtom));
export const visibleValueAtom = atom((get) => get(visibleAtom));
export const datePickerTargetValueAtom = atom((get) => get(datePickerTargetAtom));
export const displayYearValueAtom = atom((get) => get(displayYearAtom));
export const displayMonthValueAtom = atom((get) => get(displayMonthAtom));

// Derived read-only atoms
export const isDatePickerModeValueAtom = atom((get) => get(datePickerTargetAtom) !== null);

export const hasRangeValueAtom = atom((get) => {
	const start = get(startAtom);
	const end = get(endAtom);
	return !!start && !!end && start !== end;
});

export const gridValueAtom = atom((get): CalendarDay[][] => {
	const year = get(displayYearAtom);
	const month = get(displayMonthAtom);
	const rawGrid = generateCalendarGrid(year, month);
	return padGrid(rawGrid);
});

// --- Public action atoms ---
export const openFormAtom = atom(null, (_get, set) => {
	set(visibleAtom, true);
});

export const closeFormAtom = atom(null, (_get, set) => {
	set(visibleAtom, false);
	set(titleAtom, "");
	set(startAtom, getTodayString());
	set(endAtom, "");
	set(allDayAtom, true);
	set(datePickerTargetAtom, null);
});

export const setTitleAtom = atom(null, (_get, set, title: string) => {
	set(titleAtom, title);
});

export const setAllDayAtom = atom(null, (_get, set, value: boolean) => {
	set(allDayAtom, value);
});

export const enterDatePickerModeAtom = atom(null, (get, set, target: "start" | "end") => {
	const currentValue = target === "start" ? get(startAtom) : get(endAtom);
	if (currentValue) {
		const [y, m] = currentValue.split("-").map(Number);
		set(displayYearAtom, y);
		set(displayMonthAtom, m - 1);
	} else {
		set(displayYearAtom, new Date().getFullYear());
		set(displayMonthAtom, new Date().getMonth());
	}
	set(datePickerTargetAtom, target);
});

export const switchDatePickerTargetAtom = atom(null, (_get, set, target: "start" | "end") => {
	set(datePickerTargetAtom, target);
});

export const exitDatePickerModeAtom = atom(null, (_get, set) => {
	set(datePickerTargetAtom, null);
});

export const selectDayAtom = atom(null, (get, set, dateKey: string) => {
	const target = get(datePickerTargetAtom);
	const start = get(startAtom);
	const end = get(endAtom);

	if (target === "start") {
		if (end && dateKey > end) {
			// Swap: selected date becomes end, old end becomes start
			set(startAtom, end);
			set(endAtom, dateKey);
		} else {
			set(startAtom, dateKey);
		}
	} else if (target === "end") {
		if (start && dateKey < start) {
			// Swap: selected date becomes start, old start becomes end
			set(endAtom, start);
			set(startAtom, dateKey);
		} else {
			set(endAtom, dateKey);
		}
	}
});

export const prevMonthAtom = atom(null, (get, set) => {
	const month = get(displayMonthAtom);
	if (month === 0) {
		set(displayYearAtom, get(displayYearAtom) - 1);
		set(displayMonthAtom, 11);
	} else {
		set(displayMonthAtom, month - 1);
	}
});

export const nextMonthAtom = atom(null, (get, set) => {
	const month = get(displayMonthAtom);
	if (month === 11) {
		set(displayYearAtom, get(displayYearAtom) + 1);
		set(displayMonthAtom, 0);
	} else {
		set(displayMonthAtom, month + 1);
	}
});
