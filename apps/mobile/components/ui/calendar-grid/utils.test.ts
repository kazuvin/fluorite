import { describe, expect, it } from "vitest";
import { generateCalendarGrid } from "./utils";

describe("generateCalendarGrid", () => {
	it("月に必要な最小行数のグリッドを返す", () => {
		// 2026年2月: 日曜始まり28日 → 4行で収まる
		const feb = generateCalendarGrid(2026, 1);
		expect(feb).toHaveLength(4);
		for (const week of feb) {
			expect(week).toHaveLength(7);
		}

		// 2026年1月: 木曜始まり31日 → 5行必要
		const jan = generateCalendarGrid(2026, 0);
		expect(jan).toHaveLength(5);
		for (const week of jan) {
			expect(week).toHaveLength(7);
		}

		// 2026年8月: 土曜始まり31日 → 6行必要
		const aug = generateCalendarGrid(2026, 7);
		expect(aug).toHaveLength(6);
		for (const week of aug) {
			expect(week).toHaveLength(7);
		}
	});

	it("当月の日付がすべて含まれる", () => {
		const grid = generateCalendarGrid(2026, 1); // 2026年2月 = 28日
		const currentMonthDays = grid
			.flat()
			.filter((d) => d.isCurrentMonth)
			.map((d) => d.date);
		expect(currentMonthDays).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
	});

	it("日曜始まりで正しい曜日に配置される", () => {
		// 2026年2月1日は日曜日
		const grid = generateCalendarGrid(2026, 1);
		const feb1 = grid.flat().find((d) => d.isCurrentMonth && d.date === 1);
		// グリッド内のインデックスを探す
		const feb1Index = grid[0].findIndex((d) => d.isCurrentMonth && d.date === 1);
		expect(feb1Index).toBe(0); // 日曜 = index 0
	});

	it("前月の端数日が正しく埋まる", () => {
		// 2026年3月1日は日曜日 → 前月の端数なし
		// 2026年4月1日は水曜日 → 前に日・月・火の3日分
		const grid = generateCalendarGrid(2026, 3); // 2026年4月
		const firstWeek = grid[0];
		const prevMonthDays = firstWeek.filter((d) => !d.isCurrentMonth);
		expect(prevMonthDays).toHaveLength(3); // 日・月・火
		expect(prevMonthDays[0].month).toBe(2); // 3月 (0-indexed)
	});

	it("次月の端数日が正しく埋まる", () => {
		// 2026年5月: 金曜始まり31日 → 最終週に次月の端数あり
		const grid = generateCalendarGrid(2026, 4); // 2026年5月
		const lastWeek = grid[grid.length - 1];
		const nextMonthDays = lastWeek.filter((d) => !d.isCurrentMonth);
		expect(nextMonthDays.length).toBeGreaterThan(0);
		expect(nextMonthDays[0].month).toBe(5); // 6月 (0-indexed)
	});

	it("ちょうど収まる月は次月の端数がない", () => {
		// 2026年2月: 日曜始まり28日 → ちょうど4週で収まる
		const grid = generateCalendarGrid(2026, 1);
		const allNextMonth = grid.flat().filter((d) => !d.isCurrentMonth && d.month === 2);
		expect(allNextMonth).toHaveLength(0);
	});

	it("isToday が今日のみ true になる", () => {
		const today = new Date(2026, 1, 15); // 2026年2月15日
		const grid = generateCalendarGrid(2026, 1, today);
		const todayDays = grid.flat().filter((d) => d.isToday);
		expect(todayDays).toHaveLength(1);
		expect(todayDays[0].date).toBe(15);
		expect(todayDays[0].month).toBe(1);
		expect(todayDays[0].year).toBe(2026);
	});

	it("isCurrentMonth が当月のみ true になる", () => {
		const grid = generateCalendarGrid(2026, 1);
		const currentMonth = grid.flat().filter((d) => d.isCurrentMonth);
		for (const d of currentMonth) {
			expect(d.month).toBe(1);
			expect(d.year).toBe(2026);
		}
	});

	it("31日の月でも正しく動作する", () => {
		const grid = generateCalendarGrid(2026, 0); // 2026年1月
		const janDays = grid
			.flat()
			.filter((d) => d.isCurrentMonth)
			.map((d) => d.date);
		expect(janDays).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
	});

	it("別の月を表示中に today が含まれない場合 isToday はすべて false", () => {
		const today = new Date(2026, 1, 15); // 2026年2月15日
		const grid = generateCalendarGrid(2026, 0, today); // 1月表示
		const todayDays = grid.flat().filter((d) => d.isToday);
		expect(todayDays).toHaveLength(0);
	});
});
