import { describe, expect, it } from "vitest";
import {
	computeSameWeekdayDateKey,
	findWeekIndexForDateKey,
	generateCalendarGrid,
	generateOffsets,
	generateWeekFromDate,
	getAdjacentDateKey,
	getWeekCenterDateKey,
	isSameWeek,
	offsetToYearMonth,
	parseDateKey,
} from "./calendar-grid-utils";

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

describe("findWeekIndexForDateKey", () => {
	it("対象日付が属する週のインデックスを返す", () => {
		const grid = generateCalendarGrid(2026, 0); // 2026年1月
		// 1月1日は木曜 → 最初の週(index 0)
		expect(findWeekIndexForDateKey(grid, "2026-01-01")).toBe(0);
		// 1月15日は木曜 → 3週目(index 2)
		expect(findWeekIndexForDateKey(grid, "2026-01-15")).toBe(2);
	});

	it("存在しない dateKey の場合 -1 を返す", () => {
		const grid = generateCalendarGrid(2026, 0);
		expect(findWeekIndexForDateKey(grid, "2099-12-31")).toBe(-1);
	});
});

describe("parseDateKey", () => {
	it("日付文字列から年月日・曜日を返す", () => {
		// 2026-01-01 は木曜日
		expect(parseDateKey("2026-01-01")).toEqual({
			year: 2026,
			month: 1,
			day: 1,
			weekday: "木",
		});
	});

	it("日曜日の曜日名が正しい", () => {
		// 2026-02-01 は日曜日
		expect(parseDateKey("2026-02-01").weekday).toBe("日");
	});
});

describe("generateWeekFromDate", () => {
	it("offset=0 で指定日付を含む週（日曜始まり）を返す", () => {
		// 2026-01-15 は木曜日 → 週は 2026-01-11(日) ~ 2026-01-17(土)
		const week = generateWeekFromDate("2026-01-15", 0);
		expect(week).toHaveLength(7);
		expect(week[0].dateKey).toBe("2026-01-11");
		expect(week[6].dateKey).toBe("2026-01-17");
	});

	it("offset=1 で翌週を返す", () => {
		const week = generateWeekFromDate("2026-01-15", 1);
		expect(week[0].dateKey).toBe("2026-01-18");
		expect(week[6].dateKey).toBe("2026-01-24");
	});

	it("offset=-1 で前週を返す", () => {
		const week = generateWeekFromDate("2026-01-15", -1);
		expect(week[0].dateKey).toBe("2026-01-04");
		expect(week[6].dateKey).toBe("2026-01-10");
	});

	it("月をまたぐ場合も正しく動作する", () => {
		// 2026-01-31 は土曜日 → offset=1 で 2026-02-01(日) ~ 2026-02-07(土)
		const week = generateWeekFromDate("2026-01-31", 1);
		expect(week[0].dateKey).toBe("2026-02-01");
		expect(week[6].dateKey).toBe("2026-02-07");
	});

	it("isCurrentMonth は基準 dateKey の月で判定される", () => {
		// 基準: 2026-01-15 (1月) → 1月以外は isCurrentMonth=false
		const week = generateWeekFromDate("2026-01-31", 1); // 2月の週
		// 基準は 1月31日 → 1月が currentMonth
		for (const day of week) {
			expect(day.isCurrentMonth).toBe(day.month === 0); // 1月=0
		}
	});

	it("today が指定された場合 isToday が設定される", () => {
		const today = new Date(2026, 0, 15);
		const week = generateWeekFromDate("2026-01-15", 0, today);
		const todayDays = week.filter((d) => d.isToday);
		expect(todayDays).toHaveLength(1);
		expect(todayDays[0].dateKey).toBe("2026-01-15");
	});

	it("日曜日の dateKey を指定した場合、その週の日曜から始まる", () => {
		// 2026-02-01 は日曜日
		const week = generateWeekFromDate("2026-02-01", 0);
		expect(week[0].dateKey).toBe("2026-02-01");
		expect(week[6].dateKey).toBe("2026-02-07");
	});
});

describe("computeSameWeekdayDateKey", () => {
	it("木曜選択 → 次週の水曜(center) → 次週の木曜を返す", () => {
		// 2026-01-15 は木曜、次週の center(水曜) は 2026-01-21
		expect(computeSameWeekdayDateKey("2026-01-15", "2026-01-21")).toBe("2026-01-22");
	});

	it("日曜選択 → 次週の水曜(center) → 次週の日曜を返す", () => {
		// 2026-02-01 は日曜、次週の center(水曜) は 2026-02-04
		expect(computeSameWeekdayDateKey("2026-02-01", "2026-02-04")).toBe("2026-02-01");
	});

	it("土曜選択 → 次週の水曜(center) → 次週の土曜を返す", () => {
		// 2026-01-17 は土曜、次週の center(水曜) は 2026-01-21
		expect(computeSameWeekdayDateKey("2026-01-17", "2026-01-21")).toBe("2026-01-24");
	});

	it("月またぎ（1月末→2月）", () => {
		// 2026-01-29 は木曜、次週の center(水曜) は 2026-02-04
		expect(computeSameWeekdayDateKey("2026-01-29", "2026-02-04")).toBe("2026-02-05");
	});

	it("年またぎ（12月末→1月）", () => {
		// 2025-12-31 は水曜、次週の center(水曜) は 2026-01-07
		expect(computeSameWeekdayDateKey("2025-12-31", "2026-01-07")).toBe("2026-01-07");
	});

	it("前の週へのスワイプ", () => {
		// 2026-01-15 は木曜、前週の center(水曜) は 2026-01-07
		expect(computeSameWeekdayDateKey("2026-01-15", "2026-01-07")).toBe("2026-01-08");
	});

	it("水曜選択 → 水曜(center) → そのまま返す", () => {
		// 2026-01-14 は水曜、center も 2026-01-14
		expect(computeSameWeekdayDateKey("2026-01-14", "2026-01-14")).toBe("2026-01-14");
	});
});

describe("getAdjacentDateKey", () => {
	it("offset=1 で翌日の dateKey を返す", () => {
		expect(getAdjacentDateKey("2026-01-15", 1)).toBe("2026-01-16");
	});

	it("offset=-1 で前日の dateKey を返す", () => {
		expect(getAdjacentDateKey("2026-01-15", -1)).toBe("2026-01-14");
	});

	it("offset=0 で同じ dateKey を返す", () => {
		expect(getAdjacentDateKey("2026-01-15", 0)).toBe("2026-01-15");
	});

	it("月末を跨ぐ（1月31日 → 2月1日）", () => {
		expect(getAdjacentDateKey("2026-01-31", 1)).toBe("2026-02-01");
	});

	it("月初を跨ぐ（2月1日 → 1月31日）", () => {
		expect(getAdjacentDateKey("2026-02-01", -1)).toBe("2026-01-31");
	});

	it("年末を跨ぐ（12月31日 → 1月1日）", () => {
		expect(getAdjacentDateKey("2025-12-31", 1)).toBe("2026-01-01");
	});

	it("年初を跨ぐ（1月1日 → 前年12月31日）", () => {
		expect(getAdjacentDateKey("2026-01-01", -1)).toBe("2025-12-31");
	});

	it("offset=7 で1週間後を返す", () => {
		expect(getAdjacentDateKey("2026-01-15", 7)).toBe("2026-01-22");
	});
});

describe("isSameWeek", () => {
	it("同じ週の日曜と土曜は同じ週と判定する", () => {
		// 2026-01-11(日) ~ 2026-01-17(土)
		expect(isSameWeek("2026-01-11", "2026-01-17")).toBe(true);
	});

	it("同じ日は同じ週と判定する", () => {
		expect(isSameWeek("2026-01-15", "2026-01-15")).toBe(true);
	});

	it("異なる週の日付は異なる週と判定する", () => {
		// 2026-01-17(土) と 2026-01-18(日) は別の週
		expect(isSameWeek("2026-01-17", "2026-01-18")).toBe(false);
	});

	it("月をまたぐ同じ週を正しく判定する", () => {
		// 2026-02-01(日) ~ 2026-02-07(土)
		// 2026-01-31 は土曜、2026-02-01 は日曜 → 別の週
		expect(isSameWeek("2026-01-31", "2026-02-01")).toBe(false);
	});

	it("月をまたぐ同じ週のケース", () => {
		// 2026-03-29(日) ~ 2026-04-04(土) — 3月と4月にまたがる同じ週
		expect(isSameWeek("2026-03-29", "2026-04-04")).toBe(true);
	});
});

describe("getWeekCenterDateKey", () => {
	it("水曜日を渡すとそのまま返す", () => {
		// 2026-01-14 は水曜日
		expect(getWeekCenterDateKey("2026-01-14")).toBe("2026-01-14");
	});

	it("日曜日を渡すとその週の水曜日を返す", () => {
		// 2026-02-01 は日曜 → 水曜は 2026-02-04
		expect(getWeekCenterDateKey("2026-02-01")).toBe("2026-02-04");
	});

	it("土曜日を渡すとその週の水曜日を返す", () => {
		// 2026-01-17 は土曜 → 水曜は 2026-01-14
		expect(getWeekCenterDateKey("2026-01-17")).toBe("2026-01-14");
	});

	it("月をまたぐケース", () => {
		// 2026-03-01 は日曜 → 水曜は 2026-03-04
		expect(getWeekCenterDateKey("2026-03-01")).toBe("2026-03-04");
	});

	it("木曜日を渡すとその週の水曜日を返す", () => {
		// 2026-01-15 は木曜 → 水曜は 2026-01-14
		expect(getWeekCenterDateKey("2026-01-15")).toBe("2026-01-14");
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
