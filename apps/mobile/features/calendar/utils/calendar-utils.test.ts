import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalendarDay } from "./calendar-grid-utils";
import { getDayTestId, getTodayString, padGrid } from "./calendar-utils";

describe("calendar-utils", () => {
	describe("getTodayString", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("returns today's date in YYYY-MM-DD format", () => {
			vi.setSystemTime(new Date(2025, 0, 15)); // 2025-01-15
			expect(getTodayString()).toBe("2025-01-15");
		});

		it("pads single digit months and days", () => {
			vi.setSystemTime(new Date(2025, 5, 3)); // 2025-06-03
			expect(getTodayString()).toBe("2025-06-03");
		});
	});

	describe("padGrid", () => {
		const createMockDay = (
			year: number,
			month: number,
			date: number,
			isCurrentMonth = false,
		): CalendarDay => {
			const mm = String(month + 1).padStart(2, "0");
			const dd = String(date).padStart(2, "0");
			return {
				date,
				month,
				year,
				isCurrentMonth,
				isToday: false,
				dateKey: `${year}-${mm}-${dd}`,
			};
		};

		const createMockWeek = (
			startYear: number,
			startMonth: number,
			startDate: number,
		): CalendarDay[] => {
			const week: CalendarDay[] = [];
			for (let i = 0; i < 7; i++) {
				const d = new Date(startYear, startMonth, startDate + i);
				week.push(createMockDay(d.getFullYear(), d.getMonth(), d.getDate()));
			}
			return week;
		};

		it("returns grid as-is if already 6 rows", () => {
			const grid: CalendarDay[][] = [];
			for (let i = 0; i < 6; i++) {
				grid.push(createMockWeek(2025, 0, 1 + i * 7));
			}
			const result = padGrid(grid);
			expect(result.length).toBe(6);
			expect(result).toBe(grid); // Same reference
		});

		it("pads 5-row grid to 6 rows", () => {
			const grid: CalendarDay[][] = [];
			for (let i = 0; i < 5; i++) {
				grid.push(createMockWeek(2025, 0, 1 + i * 7));
			}
			const result = padGrid(grid);
			expect(result.length).toBe(6);
		});

		it("added rows have consecutive dates following last row", () => {
			const grid: CalendarDay[][] = [];
			for (let i = 0; i < 5; i++) {
				grid.push(createMockWeek(2025, 0, 1 + i * 7));
			}
			const result = padGrid(grid);

			// Last original row ends with 2025-02-01 (startDate=29)
			// New row should start from 2025-02-02
			const lastOriginalWeek = result[4];
			const lastDayOfOriginal = lastOriginalWeek[6];

			const newWeek = result[5];
			const firstDayOfNew = newWeek[0];

			const lastDate = new Date(
				lastDayOfOriginal.year,
				lastDayOfOriginal.month,
				lastDayOfOriginal.date,
			);
			const nextDate = new Date(firstDayOfNew.year, firstDayOfNew.month, firstDayOfNew.date);

			expect(nextDate.getTime() - lastDate.getTime()).toBe(24 * 60 * 60 * 1000);
		});

		it("added rows have isCurrentMonth set to false", () => {
			const grid: CalendarDay[][] = [];
			for (let i = 0; i < 5; i++) {
				grid.push(createMockWeek(2025, 0, 1 + i * 7));
			}
			const result = padGrid(grid);
			const newWeek = result[5];

			for (const day of newWeek) {
				expect(day.isCurrentMonth).toBe(false);
			}
		});
	});

	describe("getDayTestId", () => {
		it("returns calendar-day-range-start for start date", () => {
			expect(getDayTestId("2025-01-15", "2025-01-15", "2025-01-20")).toBe(
				"calendar-day-range-start",
			);
		});

		it("returns calendar-day-range-end for end date when has range", () => {
			expect(getDayTestId("2025-01-20", "2025-01-15", "2025-01-20")).toBe("calendar-day-range-end");
		});

		it("returns calendar-day-in-range for dates between start and end", () => {
			expect(getDayTestId("2025-01-17", "2025-01-15", "2025-01-20")).toBe("calendar-day-in-range");
		});

		it("returns calendar-day for dates outside range", () => {
			expect(getDayTestId("2025-01-10", "2025-01-15", "2025-01-20")).toBe("calendar-day");
		});

		it("returns calendar-day-range-start for start date even without end", () => {
			expect(getDayTestId("2025-01-15", "2025-01-15", "")).toBe("calendar-day-range-start");
		});

		it("returns calendar-day for non-selected date when end is empty", () => {
			expect(getDayTestId("2025-01-16", "2025-01-15", "")).toBe("calendar-day");
		});

		it("handles same start and end date (no visual range)", () => {
			expect(getDayTestId("2025-01-15", "2025-01-15", "2025-01-15")).toBe(
				"calendar-day-range-start",
			);
		});
	});
});
