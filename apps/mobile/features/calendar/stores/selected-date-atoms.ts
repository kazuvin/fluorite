import { atom } from "jotai";

// --- Private primitive atoms ---
const selectedDateAtom = atom<string | null>(null);

// --- Public read-only atoms ---
export const selectedDateValueAtom = atom((get) => get(selectedDateAtom));

// --- Public action atoms ---
export const selectDateAtom = atom(null, (get, set, dateKey: string) => {
	const current = get(selectedDateAtom);
	set(selectedDateAtom, current === dateKey ? null : dateKey);
});

export const setSelectedDateAtom = atom(null, (_get, set, dateKey: string) => {
	set(selectedDateAtom, dateKey);
});

export const clearSelectedDateAtom = atom(null, (_get, set) => {
	set(selectedDateAtom, null);
});
