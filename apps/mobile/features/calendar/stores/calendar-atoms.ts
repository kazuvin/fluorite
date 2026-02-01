import { atom } from "jotai";
import { generateCalendarGrid } from "../../../components/ui/calendar-grid/utils";

// --- Private primitive atoms ---
const yearAtom = atom(new Date().getFullYear());
const monthAtom = atom(new Date().getMonth());

// --- Public read-only atoms ---
export const yearValueAtom = atom((get) => get(yearAtom));
export const monthValueAtom = atom((get) => get(monthAtom));
export const calendarGridValueAtom = atom((get) =>
	generateCalendarGrid(get(yearAtom), get(monthAtom), new Date()),
);

// --- Public action atoms ---
export const goToPrevMonthAtom = atom(null, (get, set) => {
	const month = get(monthAtom);
	if (month === 0) {
		set(yearAtom, get(yearAtom) - 1);
		set(monthAtom, 11);
	} else {
		set(monthAtom, month - 1);
	}
});

export const goToNextMonthAtom = atom(null, (get, set) => {
	const month = get(monthAtom);
	if (month === 11) {
		set(yearAtom, get(yearAtom) + 1);
		set(monthAtom, 0);
	} else {
		set(monthAtom, month + 1);
	}
});
