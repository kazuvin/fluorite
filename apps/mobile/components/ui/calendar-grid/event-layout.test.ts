import { CategoryRegistry, type EventNote } from "@fluorite/core";
import { describe, expect, it } from "vitest";
import {
	computeMonthEventLayout,
	computeWeekEventLayout,
	eventNotesToCalendarEvents,
} from "./event-layout";
import type { CalendarEvent, DayCellLayout, EventSlot, MonthEventLayout } from "./event-layout";
import { generateCalendarGrid, generateWeekFromDate } from "./utils";
import type { CalendarDay } from "./utils";

function makeGrid(year: number, month: number): CalendarDay[][] {
	return generateCalendarGrid(year, month);
}

/** layout.get で取得したセルが存在することを検証して返す */
function getCell(layout: MonthEventLayout, key: string): DayCellLayout {
	const cell = layout.get(key);
	expect(cell).toBeDefined();
	return cell as DayCellLayout;
}

/** セルの指定行のスロットが非 null であることを検証して返す */
function getSlot(cell: DayCellLayout, row: number): EventSlot {
	const slot = cell.slots[row];
	expect(slot).not.toBeNull();
	return slot as EventSlot;
}

describe("eventNotesToCalendarEvents", () => {
	it("EventNote が CalendarEvent に変換される（startDate, endDate が正しい）", () => {
		const notes: EventNote[] = [
			{
				title: "旅行",
				start: "2026-02-10",
				end: "2026-02-12",
				allDay: true,
			},
		];
		const events = eventNotesToCalendarEvents(notes);
		expect(events).toHaveLength(1);
		expect(events[0].startDate).toBe("2026-02-10");
		expect(events[0].endDate).toBe("2026-02-12");
		expect(events[0].title).toBe("旅行");
		expect(events[0].id).toBe("event-0");
	});

	it("allDay の EventNote の type が 'allDay' になる", () => {
		const notes: EventNote[] = [
			{
				title: "終日イベント",
				start: "2026-02-10",
				end: "2026-02-10",
				allDay: true,
			},
		];
		const events = eventNotesToCalendarEvents(notes);
		expect(events[0].type).toBe("allDay");
	});

	it("allDay でない EventNote の type が 'timed' になる", () => {
		const notes: EventNote[] = [
			{
				title: "会議",
				start: "2026-02-10",
				end: "2026-02-10",
			},
		];
		const events = eventNotesToCalendarEvents(notes);
		expect(events[0].type).toBe("timed");
	});

	it("category がある場合、registry の色が使われる", () => {
		const registry = new CategoryRegistry();
		registry.set("work", "#4A90D9");
		const notes: EventNote[] = [
			{
				title: "仕事",
				start: "2026-02-10",
				end: "2026-02-10",
				category: "work",
			},
		];
		const events = eventNotesToCalendarEvents(notes, registry);
		expect(events[0].color).toBe("#4A90D9");
	});

	it("category が registry に未登録の場合、DEFAULT_COLOR になる", () => {
		const registry = new CategoryRegistry();
		const notes: EventNote[] = [
			{
				title: "不明",
				start: "2026-02-10",
				end: "2026-02-10",
				category: "unknown",
			},
		];
		const events = eventNotesToCalendarEvents(notes, registry);
		expect(events[0].color).toBe("#9B9B9B");
	});

	it("category がない場合、DEFAULT_COLOR になる", () => {
		const registry = new CategoryRegistry();
		const notes: EventNote[] = [
			{
				title: "メモ",
				start: "2026-02-10",
				end: "2026-02-10",
			},
		];
		const events = eventNotesToCalendarEvents(notes, registry);
		expect(events[0].color).toBe("#9B9B9B");
	});

	it("registry なしの場合、DEFAULT_COLOR になる", () => {
		const notes: EventNote[] = [
			{
				title: "メモ",
				start: "2026-02-10",
				end: "2026-02-10",
				category: "work",
			},
		];
		const events = eventNotesToCalendarEvents(notes);
		expect(events[0].color).toBe("#9B9B9B");
	});
});

describe("computeMonthEventLayout", () => {
	it("単一の終日イベントが1セルに配置される（spanInWeek=1, isStart=true, isEnd=true）", () => {
		const grid = makeGrid(2026, 1); // 2026年2月
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "終日",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-02-15");
		const slot = getSlot(cell, 0);
		expect(slot.spanInWeek).toBe(1);
		expect(slot.isStart).toBe(true);
		expect(slot.isEnd).toBe(true);
	});

	it("3日間のイベントが正しくスパンする（spanInWeek=3）", () => {
		const grid = makeGrid(2026, 1); // 2026年2月
		// 2026-02-10 (火) ～ 2026-02-12 (木) → 同一週内
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "3日間",
				startDate: "2026-02-10",
				endDate: "2026-02-12",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-02-10");
		const slot = getSlot(cell, 0);
		expect(slot.spanInWeek).toBe(3);
	});

	it("スパンイベントの開始日は isStart=true, 終了日は isEnd=true, 中間は null", () => {
		const grid = makeGrid(2026, 1);
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "3日間",
				startDate: "2026-02-10",
				endDate: "2026-02-12",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		// 開始日のみ EventSlot を持ち、isStart/isEnd を確認
		// isStart: スパンの左端がイベント開始日か
		// isEnd: スパンの右端がイベント終了日か
		const startCell = getCell(layout, "2026-02-10");
		const slot = getSlot(startCell, 0);
		expect(slot.isStart).toBe(true);
		expect(slot.isEnd).toBe(true);

		// 中間日・終了日は null（スパンイベントの予約済み）
		const midCell = getCell(layout, "2026-02-11");
		expect(midCell.slots[0]).toBeNull();

		const endCell = getCell(layout, "2026-02-12");
		expect(endCell.slots[0]).toBeNull();
	});

	it("週をまたぐイベントが2つの週に分割される", () => {
		const grid = makeGrid(2026, 1); // 2026年2月
		// 2026-02-07 (土) ～ 2026-02-09 (月) → 週をまたぐ
		// 第1週: 2/1-2/7, 第2週: 2/8-2/14
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "週またぎ",
				startDate: "2026-02-07",
				endDate: "2026-02-09",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);

		// 第1週の最終日（土曜日）: spanInWeek=1, isStart=true, isEnd=false
		const satCell = getCell(layout, "2026-02-07");
		const satSlot = getSlot(satCell, 0);
		expect(satSlot.isStart).toBe(true);
		expect(satSlot.isEnd).toBe(false);
		expect(satSlot.spanInWeek).toBe(1);

		// 第2週の開始: spanInWeek=2, isStart=false, isEnd=true
		const sunCell = getCell(layout, "2026-02-08");
		const sunSlot = getSlot(sunCell, 0);
		expect(sunSlot.isStart).toBe(false);
		expect(sunSlot.isEnd).toBe(true);
		expect(sunSlot.spanInWeek).toBe(2);
	});

	it("1日3件まで表示、4件目以降は overflowCount に加算", () => {
		const grid = makeGrid(2026, 1);
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "A",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "2",
				title: "B",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "3",
				title: "C",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "4",
				title: "D",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "timed",
			},
			{
				id: "5",
				title: "E",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "timed",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-02-15");
		expect(cell.slots).toHaveLength(3);
		expect(cell.slots[0]).not.toBeNull();
		expect(cell.slots[1]).not.toBeNull();
		expect(cell.slots[2]).not.toBeNull();
		expect(cell.overflowCount).toBe(2);
	});

	it("終日イベントが時刻イベントより上の行に配置される", () => {
		const grid = makeGrid(2026, 1);
		const events: CalendarEvent[] = [
			{
				id: "timed-1",
				title: "朝会",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "timed",
			},
			{
				id: "allday-1",
				title: "終日",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-02-15");
		// 終日が先に配置される（行0）
		const row0 = getSlot(cell, 0);
		const row1 = getSlot(cell, 1);
		expect(row0.event.type).toBe("allDay");
		expect(row1.event.type).toBe("timed");
	});

	it("当月外の日にもイベントが配置される", () => {
		// 2026年4月のグリッドを使う（前月の日が含まれる）
		const grid = makeGrid(2026, 3); // 4月
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "3月のイベント",
				startDate: "2026-03-31",
				endDate: "2026-03-31",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-03-31");
		// グリッドに表示されている日なのでイベントが配置される
		const slot = getSlot(cell, 0);
		expect(slot.event.title).toBe("3月のイベント");
		expect(slot.spanInWeek).toBe(1);
	});

	it("月をまたぐイベントが隣月セルにも正しくスパンする", () => {
		// 2026年2月のグリッド。2月は28日まで。グリッドの最後の週に3月の日が含まれる
		const grid = makeGrid(2026, 1); // 2月
		// 2026-02-27 ～ 2026-03-02 のイベント
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "月またぎ",
				startDate: "2026-02-27",
				endDate: "2026-03-02",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		// 2026-02-27 は金曜日。同じ週内に 2/28, 3/1(日曜は次の週) がある
		// 2月のグリッドでは 2/27(金)は第4週の最後あたり
		const startCell = getCell(layout, "2026-02-27");
		const slot = getSlot(startCell, 0);
		expect(slot.isStart).toBe(true);
		// 3/1(日)は次の週の先頭、3/2(月)も次の週
		// 次の週にもイベントが配置される
		const marchCell = getCell(layout, "2026-03-01");
		const marchSlot = getSlot(marchCell, 0);
		expect(marchSlot.event.title).toBe("月またぎ");
	});

	it("隣月の overflowCount もカウントされる", () => {
		const grid = makeGrid(2026, 3); // 4月。3月31日がグリッドに含まれる
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "A",
				startDate: "2026-03-31",
				endDate: "2026-03-31",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "2",
				title: "B",
				startDate: "2026-03-31",
				endDate: "2026-03-31",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "3",
				title: "C",
				startDate: "2026-03-31",
				endDate: "2026-03-31",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "4",
				title: "D",
				startDate: "2026-03-31",
				endDate: "2026-03-31",
				color: "#4A90D9",
				type: "timed",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-03-31");
		expect(cell.overflowCount).toBe(1);
	});

	it("同じ行に重なるイベントがない（スパンイベントが予約した行は使われない）", () => {
		const grid = makeGrid(2026, 1);
		// 3日間のスパンイベント（行0を占有）と、中間日の単発イベント
		const events: CalendarEvent[] = [
			{
				id: "span",
				title: "3日間",
				startDate: "2026-02-10",
				endDate: "2026-02-12",
				color: "#4A90D9",
				type: "allDay",
			},
			{
				id: "single",
				title: "単発",
				startDate: "2026-02-11",
				endDate: "2026-02-11",
				color: "#50C878",
				type: "timed",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const midCell = getCell(layout, "2026-02-11");
		// 行0はスパンイベントが予約済み（null）
		expect(midCell.slots[0]).toBeNull();
		// 行1に単発イベントが配置される
		const slot1 = getSlot(midCell, 1);
		expect(slot1.event.id).toBe("single");
	});

	it("空のイベント配列でも各日の DayCellLayout が生成される", () => {
		const grid = makeGrid(2026, 1);
		const layout = computeMonthEventLayout([], grid);
		// 当月の日（2月は28日）すべてにレイアウトが存在する
		for (let d = 1; d <= 28; d++) {
			const dd = String(d).padStart(2, "0");
			const key = `2026-02-${dd}`;
			const cell = getCell(layout, key);
			expect(cell.slots).toHaveLength(3);
			expect(cell.overflowCount).toBe(0);
		}
	});
});

describe("computeMonthEventLayout - 正月休みの配置検証", () => {
	it("正月休み(1/1-1/4)が1月グリッドのWeek0-1に配置され、Week4-5には配置されない", () => {
		const grid = makeGrid(2026, 0); // 1月
		const events: CalendarEvent[] = [
			{
				id: "segatsu",
				title: "正月休み",
				startDate: "2026-01-01",
				endDate: "2026-01-04",
				color: "#50C878",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);

		// Week 0 (Dec 28 - Jan 3): Jan 1 にスロットがある
		const jan1Cell = getCell(layout, "2026-01-01");
		const jan1Slot = getSlot(jan1Cell, 0);
		expect(jan1Slot.event.title).toBe("正月休み");
		expect(jan1Slot.spanInWeek).toBe(3); // Jan 1-3

		// Week 1 (Jan 4 - Jan 10): Jan 4 にスロットがある
		const jan4Cell = getCell(layout, "2026-01-04");
		const jan4Slot = getSlot(jan4Cell, 0);
		expect(jan4Slot.event.title).toBe("正月休み");
		expect(jan4Slot.spanInWeek).toBe(1);

		// Week 4-5 には配置されない
		for (const dateKey of [
			"2026-01-25",
			"2026-01-26",
			"2026-01-27",
			"2026-01-28",
			"2026-01-29",
			"2026-01-30",
			"2026-01-31",
			"2026-02-01",
			"2026-02-02",
			"2026-02-03",
			"2026-02-04",
			"2026-02-05",
			"2026-02-06",
			"2026-02-07",
		]) {
			const cell = getCell(layout, dateKey);
			expect(
				cell.slots.every((s) => s === null),
				`${dateKey} にイベントが配置されている`,
			).toBe(true);
		}
	});
});

describe("computeMonthEventLayout - 月間分離", () => {
	it("1月のイベントが2月のグリッドに表示されない", () => {
		// 2026年2月: Feb 1 は日曜 → グリッドに1月の日は含まれない
		const grid = makeGrid(2026, 1); // 2月
		// 1月のイベント
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "元日",
				startDate: "2026-01-01",
				endDate: "2026-01-01",
				color: "#FF6B6B",
				type: "allDay",
			},
			{
				id: "2",
				title: "正月休み",
				startDate: "2026-01-01",
				endDate: "2026-01-04",
				color: "#50C878",
				type: "allDay",
			},
			{
				id: "3",
				title: "歯医者",
				startDate: "2026-01-10",
				endDate: "2026-01-10",
				color: "#4A90D9",
				type: "timed",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		// 2月の全日でイベントが配置されていないこと
		for (const week of grid) {
			for (const day of week) {
				const cell = getCell(layout, day.dateKey);
				expect(
					cell.slots.every((s) => s === null),
					`${day.dateKey} にイベントが配置されている`,
				).toBe(true);
			}
		}
	});

	it("12月のグリッドの最終週に1月のイベントが表示される", () => {
		// 2025年12月: Dec 1 は月曜 → グリッドの最終週に Jan 4-10 が含まれる
		const grid = makeGrid(2025, 11); // 12月
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "仕事始め",
				startDate: "2026-01-05",
				endDate: "2026-01-05",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeMonthEventLayout(events, grid);
		const cell = getCell(layout, "2026-01-05");
		const slot = getSlot(cell, 0);
		expect(slot.event.title).toBe("仕事始め");
	});
});

describe("computeWeekEventLayout", () => {
	it("単一週に対してイベントが配置される", () => {
		const week = generateWeekFromDate("2026-02-15", 0);
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "終日",
				startDate: "2026-02-15",
				endDate: "2026-02-15",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeWeekEventLayout(events, week);
		const cell = getCell(layout, "2026-02-15");
		const slot = getSlot(cell, 0);
		expect(slot.spanInWeek).toBe(1);
		expect(slot.isStart).toBe(true);
		expect(slot.isEnd).toBe(true);
	});

	it("isCurrentMonth に関係なく全日にイベントが配置される", () => {
		// 基準: 2026-01-31 → 1月が currentMonth
		// offset=1 → 2026-02-01(日)〜02-07(土) の週。全て isCurrentMonth=false
		const week = generateWeekFromDate("2026-01-31", 1);
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "2月のイベント",
				startDate: "2026-02-03",
				endDate: "2026-02-03",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeWeekEventLayout(events, week);
		const cell = getCell(layout, "2026-02-03");
		const slot = getSlot(cell, 0);
		expect(slot.event.title).toBe("2月のイベント");
	});

	it("週をまたぐイベントが週の端まで正しく伸びる", () => {
		// 2026-02-08(日)〜02-14(土) の週
		const week = generateWeekFromDate("2026-02-10", 0);
		// イベント: 2026-02-06 ~ 2026-02-11 → この週では 02-08(日)〜02-11(水) に表示
		const events: CalendarEvent[] = [
			{
				id: "1",
				title: "週またぎ",
				startDate: "2026-02-06",
				endDate: "2026-02-11",
				color: "#4A90D9",
				type: "allDay",
			},
		];
		const layout = computeWeekEventLayout(events, week);
		const cell = getCell(layout, "2026-02-08"); // 週の日曜（バーの開始列）
		const slot = getSlot(cell, 0);
		expect(slot.spanInWeek).toBe(4); // 日〜水 = 4日
		expect(slot.isStart).toBe(false); // イベント開始日は前の週
		expect(slot.isEnd).toBe(true); // イベント終了日はこの週内
	});

	it("空のイベントでも全日のレイアウトが生成される", () => {
		const week = generateWeekFromDate("2026-02-15", 0);
		const layout = computeWeekEventLayout([], week);
		expect(layout.size).toBe(7);
		for (const day of week) {
			const cell = getCell(layout, day.dateKey);
			expect(cell.slots.every((s) => s === null)).toBe(true);
		}
	});
});
