import { describe, expect, it } from "vitest";
import {
	GRID_INTERVAL_MINUTES,
	SLOTS_PER_HOUR,
	computeDailyEventLayout,
	timeToSlot,
} from "./daily-event-layout";
import type { CalendarEvent } from "./event-layout";

describe("timeToSlot", () => {
	it("00:00 はスロット 0 になる", () => {
		expect(timeToSlot("00:00")).toBe(0);
	});

	it("01:00 はスロット 12 になる（1時間 = 12スロット）", () => {
		expect(timeToSlot("01:00")).toBe(12);
	});

	it("10:30 はスロット 126 になる（10*12 + 6 = 126）", () => {
		expect(timeToSlot("10:30")).toBe(126);
	});

	it("23:55 はスロット 287 になる（23*12 + 11 = 287）", () => {
		expect(timeToSlot("23:55")).toBe(287);
	});

	it("09:05 はスロット 109 になる（9*12 + 1 = 109）", () => {
		expect(timeToSlot("09:05")).toBe(109);
	});
});

describe("定数", () => {
	it("GRID_INTERVAL_MINUTES は 5 である", () => {
		expect(GRID_INTERVAL_MINUTES).toBe(5);
	});

	it("SLOTS_PER_HOUR は 12 である", () => {
		expect(SLOTS_PER_HOUR).toBe(12);
	});
});

describe("computeDailyEventLayout", () => {
	describe("終日イベントと時間指定イベントの分離", () => {
		it("終日イベントは allDayEvents に分類される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "終日イベント",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "allDay",
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.allDayEvents).toHaveLength(1);
			expect(layout.allDayEvents[0].title).toBe("終日イベント");
			expect(layout.timedEvents).toHaveLength(0);
		});

		it("時間指定イベントは timedEvents に分類される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "会議",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "10:00", end: "11:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.allDayEvents).toHaveLength(0);
			expect(layout.timedEvents).toHaveLength(1);
			expect(layout.timedEvents[0].event.title).toBe("会議");
		});

		it("異なる日付のイベントは除外される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "別の日",
					startDate: "2026-01-02",
					endDate: "2026-01-02",
					color: "#4A90D9",
					type: "allDay",
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.allDayEvents).toHaveLength(0);
			expect(layout.timedEvents).toHaveLength(0);
		});

		it("複数日にまたがる終日イベントは含まれる", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "3日間",
					startDate: "2026-01-01",
					endDate: "2026-01-03",
					color: "#4A90D9",
					type: "allDay",
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-02");
			expect(layout.allDayEvents).toHaveLength(1);
			expect(layout.allDayEvents[0].title).toBe("3日間");
		});
	});

	describe("時間指定イベントの位置計算", () => {
		it("10:00-11:00 のイベントは top=120, height=12 になる", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "会議",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "10:00", end: "11:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents[0].top).toBe(120); // 10 * 12 = 120
			expect(layout.timedEvents[0].height).toBe(12); // 1時間 = 12スロット
		});

		it("14:30-15:30 のイベントは top=174, height=12 になる", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "レビュー",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "14:30", end: "15:30" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents[0].top).toBe(174); // 14*12 + 6 = 174
			expect(layout.timedEvents[0].height).toBe(12);
		});

		it("終了時刻がないイベントはデフォルト30分の高さ(6スロット)になる", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "朝会",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "09:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents[0].height).toBe(6); // 30分 = 6スロット
		});
	});

	describe("カラム分割（重複イベント処理）", () => {
		it("重複しないイベントはすべて column=0, totalColumns=1", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "朝会",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "09:00", end: "10:00" },
				},
				{
					id: "2",
					title: "昼会",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "13:00", end: "14:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents).toHaveLength(2);
			expect(layout.timedEvents[0].column).toBe(0);
			expect(layout.timedEvents[0].totalColumns).toBe(1);
			expect(layout.timedEvents[1].column).toBe(0);
			expect(layout.timedEvents[1].totalColumns).toBe(1);
		});

		it("2つの重複イベントは異なるカラムに配置される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "会議A",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "10:00", end: "12:00" },
				},
				{
					id: "2",
					title: "会議B",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#50C878",
					type: "timed",
					time: { start: "10:00", end: "11:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents).toHaveLength(2);
			expect(layout.timedEvents[0].totalColumns).toBe(2);
			expect(layout.timedEvents[1].totalColumns).toBe(2);
			const columns = layout.timedEvents.map((e) => e.column).sort();
			expect(columns).toEqual([0, 1]);
		});

		it("3つの重複イベントは3カラムに配置される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "会議A",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "10:00", end: "12:00" },
				},
				{
					id: "2",
					title: "会議B",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#50C878",
					type: "timed",
					time: { start: "10:00", end: "11:00" },
				},
				{
					id: "3",
					title: "会議C",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#FF6B6B",
					type: "timed",
					time: { start: "10:30", end: "11:30" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents).toHaveLength(3);
			expect(layout.timedEvents.every((e) => e.totalColumns === 3)).toBe(true);
			const columns = layout.timedEvents.map((e) => e.column).sort();
			expect(columns).toEqual([0, 1, 2]);
		});

		it("部分的に重複するイベントグループが正しく処理される", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "会議A",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "10:00", end: "12:00" },
				},
				{
					id: "2",
					title: "会議B",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#50C878",
					type: "timed",
					time: { start: "11:00", end: "13:00" },
				},
				{
					id: "3",
					title: "会議C",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#FF6B6B",
					type: "timed",
					time: { start: "14:00", end: "15:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			const eventA = layout.timedEvents.find((e) => e.event.title === "会議A");
			const eventB = layout.timedEvents.find((e) => e.event.title === "会議B");
			const eventC = layout.timedEvents.find((e) => e.event.title === "会議C");

			expect(eventA?.totalColumns).toBe(2);
			expect(eventB?.totalColumns).toBe(2);
			expect(eventC?.totalColumns).toBe(1);
			expect(eventC?.column).toBe(0);
		});
	});

	describe("イベントのソート", () => {
		it("イベントは開始時刻順にソートされる", () => {
			const events: CalendarEvent[] = [
				{
					id: "1",
					title: "午後の会議",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#4A90D9",
					type: "timed",
					time: { start: "14:00", end: "15:00" },
				},
				{
					id: "2",
					title: "朝会",
					startDate: "2026-01-01",
					endDate: "2026-01-01",
					color: "#50C878",
					type: "timed",
					time: { start: "09:00", end: "10:00" },
				},
			];
			const layout = computeDailyEventLayout(events, "2026-01-01");
			expect(layout.timedEvents[0].event.title).toBe("朝会");
			expect(layout.timedEvents[1].event.title).toBe("午後の会議");
		});
	});
});
