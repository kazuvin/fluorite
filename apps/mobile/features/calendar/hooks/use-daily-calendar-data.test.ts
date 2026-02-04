import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../../components/ui/calendar-grid/event-layout";
import { useDailyCalendarData } from "./use-daily-calendar-data";

const createEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
	id: "1",
	title: "テスト",
	startDate: "2026-01-01",
	endDate: "2026-01-01",
	color: "#4A90D9",
	type: "timed",
	time: { start: "10:00", end: "11:00" },
	...overrides,
});

describe("useDailyCalendarData", () => {
	describe("layout", () => {
		it("dateKey が null の場合、空のレイアウトを返す", () => {
			const { result } = renderHook(() => useDailyCalendarData(null, []));
			expect(result.current.layout.allDayEvents).toHaveLength(0);
			expect(result.current.layout.timedEvents).toHaveLength(0);
		});

		it("指定日付のイベントがレイアウトに含まれる", () => {
			const events = [createEvent({ startDate: "2026-01-01", endDate: "2026-01-01" })];
			const { result } = renderHook(() => useDailyCalendarData("2026-01-01", events));
			expect(result.current.layout.timedEvents).toHaveLength(1);
		});

		it("指定日付外のイベントはレイアウトに含まれない", () => {
			const events = [createEvent({ startDate: "2026-01-02", endDate: "2026-01-02" })];
			const { result } = renderHook(() => useDailyCalendarData("2026-01-01", events));
			expect(result.current.layout.timedEvents).toHaveLength(0);
		});

		it("終日イベントと時間指定イベントが分離される", () => {
			const events = [
				createEvent({ id: "1", type: "allDay", time: undefined }),
				createEvent({ id: "2", type: "timed" }),
			];
			const { result } = renderHook(() => useDailyCalendarData("2026-01-01", events));
			expect(result.current.layout.allDayEvents).toHaveLength(1);
			expect(result.current.layout.timedEvents).toHaveLength(1);
		});
	});

	describe("currentTimeSlot", () => {
		it("dateKey が null の場合、null を返す", () => {
			const { result } = renderHook(() => useDailyCalendarData(null, []));
			expect(result.current.currentTimeSlot).toBeNull();
		});

		it("表示日付が今日の場合、現在時刻スロットを返す", () => {
			const now = new Date(2026, 0, 1, 10, 30); // 2026-01-01 10:30
			const { result } = renderHook(() => useDailyCalendarData("2026-01-01", [], now));
			// 10:30 = 10 * 12 + 6 = 126
			expect(result.current.currentTimeSlot).toBe(126);
		});

		it("表示日付が今日でない場合、null を返す", () => {
			const now = new Date(2026, 0, 2, 10, 30); // 2026-01-02 10:30
			const { result } = renderHook(() => useDailyCalendarData("2026-01-01", [], now));
			expect(result.current.currentTimeSlot).toBeNull();
		});
	});
});
