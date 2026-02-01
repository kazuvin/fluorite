import { atom } from "jotai";
import { eventNotesToCalendarEvents } from "../../../components/ui/calendar-grid/event-layout";
import { MOCK_EVENT_NOTES } from "./mock-event-notes";

// --- Private primitive atoms ---
const baseYearAtom = atom(new Date().getFullYear());
const baseMonthAtom = atom(new Date().getMonth());
const viewingYearAtom = atom(new Date().getFullYear());
const viewingMonthAtom = atom(new Date().getMonth());
const eventNotesAtom = atom(MOCK_EVENT_NOTES);

// --- Public read-only atoms ---
export const baseYearValueAtom = atom((get) => get(baseYearAtom));
export const baseMonthValueAtom = atom((get) => get(baseMonthAtom));
export const viewingYearValueAtom = atom((get) => get(viewingYearAtom));
export const viewingMonthValueAtom = atom((get) => get(viewingMonthAtom));
export const eventNotesValueAtom = atom((get) => get(eventNotesAtom));
export const calendarEventsValueAtom = atom((get) =>
	eventNotesToCalendarEvents(get(eventNotesAtom)),
);

// --- Public action atoms ---
export const setViewingMonthAtom = atom(
	null,
	(_get, set, { year, month }: { year: number; month: number }) => {
		set(viewingYearAtom, year);
		set(viewingMonthAtom, month);
	},
);
