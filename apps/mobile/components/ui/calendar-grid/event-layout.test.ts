import type { EventNote } from "@fluorite/core";
import { describe, expect, it } from "vitest";
import { computeMonthEventLayout, eventNotesToCalendarEvents } from "./event-layout";
import type { CalendarEvent, DayCellLayout, EventSlot, MonthEventLayout } from "./event-layout";
import { generateCalendarGrid } from "./utils";
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

	it("タグに基づく色分けが正しい", () => {
		const notes: EventNote[] = [
			{
				title: "仕事",
				start: "2026-02-10",
				end: "2026-02-10",
				tags: ["#work"],
			},
		];
		const events = eventNotesToCalendarEvents(notes);
		expect(events[0].color).toBe("#4A90D9");
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

	it("当月外の日はイベントが配置されない（空の slots）", () => {
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
		// 当月外なのでイベントが配置されない
		expect(cell.slots.every((s) => s === null)).toBe(true);
		expect(cell.overflowCount).toBe(0);
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
