import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import { MOCK_EVENT_NOTES } from "../__fixtures__/event-notes";
import {
	baseMonthValueAtom,
	baseYearValueAtom,
	calendarEventsValueAtom,
	categoryRegistryValueAtom,
	eventNotesValueAtom,
	filteredCalendarEventsValueAtom,
	selectedCategoriesValueAtom,
	setViewingMonthAtom,
	toggleSelectedCategoryAtom,
	viewingMonthValueAtom,
	viewingYearValueAtom,
} from "./calendar-atoms";

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

	it("初期状態: categoryRegistryValueAtom がモック CategoryRegistry を返す", () => {
		const store = createStore();
		const registry = store.get(categoryRegistryValueAtom);
		expect(registry.has("work")).toBe(true);
		expect(registry.has("personal")).toBe(true);
		expect(registry.has("holiday")).toBe(true);
	});

	it("calendarEventsValueAtom が category ベースの色を返す", () => {
		const store = createStore();
		const events = store.get(calendarEventsValueAtom);
		const holidayEvent = events.find((e) => e.title === "元日");
		expect(holidayEvent?.color).toBe("#FF6B6B");
		const workEvent = events.find((e) => e.title === "会議A");
		expect(workEvent?.color).toBe("#4A90D9");
	});

	it("setViewingMonthAtom で baseYear/baseMonth は変化しない", () => {
		const store = createStore();
		const baseYear = store.get(baseYearValueAtom);
		const baseMonth = store.get(baseMonthValueAtom);

		store.set(setViewingMonthAtom, { year: 2030, month: 11 });

		expect(store.get(baseYearValueAtom)).toBe(baseYear);
		expect(store.get(baseMonthValueAtom)).toBe(baseMonth);
	});

	describe("カテゴリフィルタ（複数選択）", () => {
		it("初期状態: selectedCategoriesValueAtom が空の Set を返す", () => {
			const store = createStore();
			const selected = store.get(selectedCategoriesValueAtom);
			expect(selected.size).toBe(0);
		});

		it("toggleSelectedCategoryAtom でカテゴリを追加できる", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			const selected = store.get(selectedCategoriesValueAtom);
			expect(selected.has("work")).toBe(true);
			expect(selected.size).toBe(1);
		});

		it("toggleSelectedCategoryAtom で同じカテゴリを再度トグルすると削除される", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			store.set(toggleSelectedCategoryAtom, "work");
			const selected = store.get(selectedCategoriesValueAtom);
			expect(selected.has("work")).toBe(false);
			expect(selected.size).toBe(0);
		});

		it("複数カテゴリを同時に選択できる", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			store.set(toggleSelectedCategoryAtom, "personal");
			const selected = store.get(selectedCategoriesValueAtom);
			expect(selected.has("work")).toBe(true);
			expect(selected.has("personal")).toBe(true);
			expect(selected.size).toBe(2);
		});

		it("filteredCalendarEventsValueAtom: 未選択時は全イベントを返す", () => {
			const store = createStore();
			const allEvents = store.get(calendarEventsValueAtom);
			const filtered = store.get(filteredCalendarEventsValueAtom);
			expect(filtered).toHaveLength(allEvents.length);
		});

		it("filteredCalendarEventsValueAtom: work のみ選択すると work カテゴリのイベントのみ返す", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			const filtered = store.get(filteredCalendarEventsValueAtom);
			const workNotes = MOCK_EVENT_NOTES.filter((n) => n.category === "work");
			expect(filtered).toHaveLength(workNotes.length);
			for (const event of filtered) {
				expect(event.color).toBe("#4A90D9");
			}
		});

		it("filteredCalendarEventsValueAtom: work と holiday を選択すると両方のイベントを返す", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			store.set(toggleSelectedCategoryAtom, "holiday");
			const filtered = store.get(filteredCalendarEventsValueAtom);
			const expected = MOCK_EVENT_NOTES.filter(
				(n) => n.category === "work" || n.category === "holiday",
			);
			expect(filtered).toHaveLength(expected.length);
		});

		it("filteredCalendarEventsValueAtom: 全カテゴリ選択後に1つ外すとそのカテゴリが除外される", () => {
			const store = createStore();
			store.set(toggleSelectedCategoryAtom, "work");
			store.set(toggleSelectedCategoryAtom, "personal");
			store.set(toggleSelectedCategoryAtom, "holiday");
			// holiday を外す
			store.set(toggleSelectedCategoryAtom, "holiday");
			const filtered = store.get(filteredCalendarEventsValueAtom);
			const expected = MOCK_EVENT_NOTES.filter(
				(n) => n.category === "work" || n.category === "personal",
			);
			expect(filtered).toHaveLength(expected.length);
		});
	});
});
