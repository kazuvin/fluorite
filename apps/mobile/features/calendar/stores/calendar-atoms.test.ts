import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
	baseMonthValueAtom,
	baseYearValueAtom,
	calendarEventsValueAtom,
	eventNotesValueAtom,
	setViewingMonthAtom,
	viewingMonthValueAtom,
	viewingYearValueAtom,
} from "./calendar-atoms";
import { MOCK_EVENT_NOTES } from "./mock-event-notes";

describe("calendar-atoms", () => {
	it("初期状態: baseYearValueAtom が現在の年を返す", () => {
		const store = createStore();
		expect(store.get(baseYearValueAtom)).toBe(new Date().getFullYear());
	});

	it("初期状態: baseMonthValueAtom が現在の月を返す", () => {
		const store = createStore();
		expect(store.get(baseMonthValueAtom)).toBe(new Date().getMonth());
	});

	it("初期状態: viewingYearValueAtom が現在の年を返す", () => {
		const store = createStore();
		expect(store.get(viewingYearValueAtom)).toBe(new Date().getFullYear());
	});

	it("初期状態: viewingMonthValueAtom が現在の月を返す", () => {
		const store = createStore();
		expect(store.get(viewingMonthValueAtom)).toBe(new Date().getMonth());
	});

	it("setViewingMonthAtom で viewingYear/viewingMonth が更新される", () => {
		const store = createStore();
		store.set(setViewingMonthAtom, { year: 2025, month: 3 });
		expect(store.get(viewingYearValueAtom)).toBe(2025);
		expect(store.get(viewingMonthValueAtom)).toBe(3);
	});

	it("初期状態: eventNotesValueAtom がモックデータを返す", () => {
		const store = createStore();
		expect(store.get(eventNotesValueAtom)).toBe(MOCK_EVENT_NOTES);
	});

	it("calendarEventsValueAtom が eventNotes から CalendarEvent[] に変換される", () => {
		const store = createStore();
		const events = store.get(calendarEventsValueAtom);
		expect(events).toHaveLength(MOCK_EVENT_NOTES.length);
		expect(events[0]).toMatchObject({
			id: "event-0",
			title: MOCK_EVENT_NOTES[0].title,
			startDate: MOCK_EVENT_NOTES[0].start,
			endDate: MOCK_EVENT_NOTES[0].end,
		});
	});

	it("setViewingMonthAtom で baseYear/baseMonth は変化しない", () => {
		const store = createStore();
		const baseYear = store.get(baseYearValueAtom);
		const baseMonth = store.get(baseMonthValueAtom);

		store.set(setViewingMonthAtom, { year: 2030, month: 11 });

		expect(store.get(baseYearValueAtom)).toBe(baseYear);
		expect(store.get(baseMonthValueAtom)).toBe(baseMonth);
	});
});
