import { atom } from "jotai";
import {
	vaultCategoryRegistryValueAtom,
	vaultNotesValueAtom,
} from "../../vault/stores/vault-atoms";
import { eventNotesToCalendarEvents } from "../utils/event-layout";

// --- Private primitive atoms ---
const baseYearAtom = atom(new Date().getFullYear());
const baseMonthAtom = atom(new Date().getMonth());
const viewingYearAtom = atom(new Date().getFullYear());
const viewingMonthAtom = atom(new Date().getMonth());
const eventNotesAtom = atom((get) => get(vaultNotesValueAtom));
const categoryRegistryAtom = atom((get) => get(vaultCategoryRegistryValueAtom));

const selectedCategoriesAtom = atom<Set<string>>(new Set());

// --- Public read-only atoms ---
export const baseYearValueAtom = atom((get) => get(baseYearAtom));
export const baseMonthValueAtom = atom((get) => get(baseMonthAtom));
export const viewingYearValueAtom = atom((get) => get(viewingYearAtom));
export const viewingMonthValueAtom = atom((get) => get(viewingMonthAtom));
export const eventNotesValueAtom = atom((get) => get(eventNotesAtom));
export const categoryRegistryValueAtom = atom((get) => get(categoryRegistryAtom));
export const selectedCategoriesValueAtom = atom((get) => get(selectedCategoriesAtom));
export const calendarEventsValueAtom = atom((get) =>
	eventNotesToCalendarEvents(get(eventNotesAtom), get(categoryRegistryAtom)),
);
export const filteredCalendarEventsValueAtom = atom((get) => {
	const selected = get(selectedCategoriesAtom);
	const notes = get(eventNotesAtom);
	const registry = get(categoryRegistryAtom);
	const filtered =
		selected.size === 0
			? notes
			: notes.filter((n) => n.category != null && selected.has(n.category));
	return eventNotesToCalendarEvents(filtered, registry);
});

// --- Public action atoms ---
export const setViewingMonthAtom = atom(
	null,
	(_get, set, { year, month }: { year: number; month: number }) => {
		set(viewingYearAtom, year);
		set(viewingMonthAtom, month);
	},
);

export const toggleSelectedCategoryAtom = atom(null, (get, set, category: string) => {
	const prev = get(selectedCategoriesAtom);
	const next = new Set(prev);
	if (next.has(category)) {
		next.delete(category);
	} else {
		next.add(category);
	}
	set(selectedCategoriesAtom, next);
});

export const clearSelectedCategoriesAtom = atom(null, (_get, set) => {
	set(selectedCategoriesAtom, new Set());
});
