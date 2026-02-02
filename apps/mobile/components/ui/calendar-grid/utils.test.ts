import { describe, expect, it } from "vitest";
import { generateCalendarGrid, generateOffsets, offsetToYearMonth } from "./utils";

describe("generateCalendarGrid", () => {
	it("すべての月で常に6行のグリッドを返す", () => {
		// 2026年2月: 日曜始まり28日 → 本来4行だが6行に拡張
		const feb = generateCalendarGrid(2026, 1);
		expect(feb).toHaveLength(6);
		for (const week of feb) {
			expect(week).toHaveLength(7);
		}

		// 2026年1月: 木曜始まり31日 → 本来5行だが6行に拡張
		const jan = generateCalendarGrid(2026, 0);
		expect(jan).toHaveLength(6);
		for (const week of jan) {
			expect(week).toHaveLength(7);
		}

		// 2026年8月: 土曜始まり31日 → もともと6行
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

	it("6行固定のため短い月では次月の日付で埋められる", () => {
		// 2026年2月: 日曜始まり28日 → 本来4週だが6行に拡張され次月の日付が入る
		const grid = generateCalendarGrid(2026, 1);
		const allNextMonth = grid.flat().filter((d) => !d.isCurrentMonth && d.month === 2);
		expect(allNextMonth.length).toBeGreaterThan(0);
		// 次月の日付は3月1日から連続している
		expect(allNextMonth[0].date).toBe(1);
		expect(allNextMonth[0].month).toBe(2); // 3月 (0-indexed)
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

	it("dateKey が YYYY-MM-DD 形式で設定される", () => {
		const grid = generateCalendarGrid(2026, 0); // 2026年1月
		// 1月1日は木曜日 → 最初の週の index 4
		const jan1 = grid.flat().find((d) => d.isCurrentMonth && d.date === 1);
		expect(jan1?.dateKey).toBe("2026-01-01");
	});

	it("前月の日付でも dateKey が正しく設定される", () => {
		const grid = generateCalendarGrid(2026, 3); // 2026年4月
		const prevMonthDays = grid[0].filter((d) => !d.isCurrentMonth);
		// 4月1日は水曜 → 前月は3月の日
		expect(prevMonthDays[0].dateKey).toMatch(/^2026-03-/);
	});

	it("dateKey の月が1-indexed（01-12）である", () => {
		const grid = generateCalendarGrid(2026, 0); // 2026年1月(month=0)
		const jan15 = grid.flat().find((d) => d.isCurrentMonth && d.date === 15);
		expect(jan15?.dateKey).toBe("2026-01-15");
	});

	it("dateKey の日が zero-padded である", () => {
		const grid = generateCalendarGrid(2026, 0);
		const jan5 = grid.flat().find((d) => d.isCurrentMonth && d.date === 5);
		expect(jan5?.dateKey).toBe("2026-01-05");
	});
});

describe("offsetToYearMonth", () => {
	it("offset=0 で基準年月をそのまま返す", () => {
		expect(offsetToYearMonth(2026, 1, 0)).toEqual({ year: 2026, month: 1 });
	});

	it("offset=1 で翌月を返す", () => {
		expect(offsetToYearMonth(2026, 1, 1)).toEqual({ year: 2026, month: 2 });
	});

	it("offset=-1 で前月を返す", () => {
		expect(offsetToYearMonth(2026, 1, -1)).toEqual({ year: 2026, month: 0 });
	});

	it("12月から offset=1 で翌年1月を返す", () => {
		expect(offsetToYearMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
	});

	it("1月から offset=-1 で前年12月を返す", () => {
		expect(offsetToYearMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
	});

	it("offset=12 で翌年の同月を返す", () => {
		expect(offsetToYearMonth(2026, 5, 12)).toEqual({ year: 2027, month: 5 });
	});

	it("offset=-12 で前年の同月を返す", () => {
		expect(offsetToYearMonth(2026, 5, -12)).toEqual({ year: 2025, month: 5 });
	});

	it("offset=-24 で2年前の同月を返す", () => {
		expect(offsetToYearMonth(2026, 3, -24)).toEqual({ year: 2024, month: 3 });
	});
});

describe("generateOffsets", () => {
	it("range=2 で [-2,-1,0,1,2] を返す", () => {
		expect(generateOffsets(2)).toEqual([-2, -1, 0, 1, 2]);
	});

	it("range=0 で [0] を返す", () => {
		expect(generateOffsets(0)).toEqual([0]);
	});

	it("range=1 で [-1,0,1] を返す", () => {
		expect(generateOffsets(1)).toEqual([-1, 0, 1]);
	});
});
