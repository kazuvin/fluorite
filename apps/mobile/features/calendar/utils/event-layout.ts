import type { CategoryRegistry, EventNote } from "@fluorite/core";
import { MAX_VISIBLE_SLOTS } from "../../../components/ui/calendar-grid/constants";
import type { CalendarDay } from "./calendar-grid-utils";

export type CalendarEvent = {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	color: string;
	type: "allDay" | "timed";
	time?: { start: string; end?: string };
};

export type EventSlot = {
	event: CalendarEvent;
	spanInWeek: number;
	isStart: boolean;
	isEnd: boolean;
};

export type DayCellLayout = {
	slots: (EventSlot | null)[];
	overflowCount: number;
};

export type MonthEventLayout = Map<string, DayCellLayout>;

export type GlobalEventSlotMap = Map<string, number>;

const DEFAULT_COLOR = "#9B9B9B";

export function eventNotesToCalendarEvents(
	notes: EventNote[],
	registry?: CategoryRegistry,
): CalendarEvent[] {
	return notes.map((note, index) => ({
		id: `event-${index}`,
		title: note.title,
		startDate: note.start,
		endDate: note.end,
		color: (note.category && registry?.getColor(note.category)) || DEFAULT_COLOR,
		type: note.allDay ? "allDay" : "timed",
		time: note.time,
	}));
}

function dateToNum(dateKey: string): number {
	const [y, m, d] = dateKey.split("-").map(Number);
	return y * 10000 + m * 100 + d;
}

const EVENT_TYPE_ORDER: Record<CalendarEvent["type"], number> = {
	allDay: 0,
	timed: 1,
};

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
	return [...events].sort((a, b) => {
		const orderDiff = EVENT_TYPE_ORDER[a.type] - EVENT_TYPE_ORDER[b.type];
		if (orderDiff !== 0) return orderDiff;

		const aSpan = dateToNum(a.endDate) - dateToNum(a.startDate);
		const bSpan = dateToNum(b.endDate) - dateToNum(b.startDate);
		if (aSpan !== bSpan) return bSpan - aSpan;

		return dateToNum(a.startDate) - dateToNum(b.startDate);
	});
}

/**
 * 全イベントに対してグローバルに安定したスロット番号を割り当てる。
 * 同じイベントはどの週に表示されても同じスロット位置になる。
 */
export function computeGlobalEventSlots(events: CalendarEvent[]): GlobalEventSlotMap {
	const result: GlobalEventSlotMap = new Map();
	if (events.length === 0) return result;

	const sorted = sortEvents(events);

	const assigned: { startNum: number; endNum: number; slot: number }[] = [];

	for (const event of sorted) {
		const eStartNum = dateToNum(event.startDate);
		const eEndNum = dateToNum(event.endDate);

		// この日付範囲と重なる既割当イベントのスロットを集める
		const usedSlots = new Set<number>();
		for (const a of assigned) {
			if (a.startNum <= eEndNum && a.endNum >= eStartNum) {
				usedSlots.add(a.slot);
			}
		}

		// 最小空きスロットを見つける
		let slot = 0;
		while (usedSlots.has(slot)) {
			slot++;
		}

		result.set(event.id, slot);
		assigned.push({ startNum: eStartNum, endNum: eEndNum, slot });
	}

	return result;
}

function emptyDayCellLayout(): DayCellLayout {
	return {
		slots: Array.from({ length: MAX_VISIBLE_SLOTS }, () => null),
		overflowCount: 0,
	};
}

/**
 * イベントがこの週で占める列範囲を算出する。
 * グリッドに表示されている全日を対象とする（隣月の日も含む）。
 */
function findEffectiveColumns(
	week: CalendarDay[],
	eStartNum: number,
	eEndNum: number,
): { startCol: number; endCol: number } | null {
	const startCol = week.findIndex((d) => dateToNum(d.dateKey) >= eStartNum);
	const endCol = week.findLastIndex((d) => dateToNum(d.dateKey) <= eEndNum);
	if (startCol === -1 || endCol === -1 || startCol > endCol) return null;

	return { startCol, endCol };
}

/**
 * 指定範囲のセルで空いている行番号を探す。見つからなければ -1。
 */
function findFreeRow(reserved: Set<number>[], startCol: number, endCol: number): number {
	for (let row = 0; row < MAX_VISIBLE_SLOTS; row++) {
		let free = true;
		for (let col = startCol; col <= endCol; col++) {
			if (reserved[row].has(col)) {
				free = false;
				break;
			}
		}
		if (free) return row;
	}
	return -1;
}

/**
 * 単一週に対するイベントレイアウト計算。
 * isCurrentMonth フィルタを使わず、全日をレイアウト対象とする。
 * globalSlots が渡された場合、各イベントのスロットをグローバルマップから取得して配置する。
 */
export function computeWeekEventLayout(
	events: CalendarEvent[],
	week: CalendarDay[],
	globalSlots?: GlobalEventSlotMap,
): MonthEventLayout {
	const layout: MonthEventLayout = new Map();

	for (const day of week) {
		layout.set(day.dateKey, emptyDayCellLayout());
	}

	const sortedEvents = sortEvents(events);

	const weekStartNum = dateToNum(week[0].dateKey);
	const weekEndNum = dateToNum(week[6].dateKey);

	const weekEvents = sortedEvents.filter((e) => {
		const eStart = dateToNum(e.startDate);
		const eEnd = dateToNum(e.endDate);
		return eStart <= weekEndNum && eEnd >= weekStartNum;
	});

	const reserved: Set<number>[] = Array.from({ length: MAX_VISIBLE_SLOTS }, () => new Set());

	for (const event of weekEvents) {
		const eStartNum = dateToNum(event.startDate);
		const eEndNum = dateToNum(event.endDate);

		const rawStart = week.findIndex((d) => dateToNum(d.dateKey) >= eStartNum);
		const rawEnd = week.findLastIndex((d) => dateToNum(d.dateKey) <= eEndNum);
		if (rawStart === -1 || rawEnd === -1 || rawStart > rawEnd) continue;

		const startCol = rawStart;
		const endCol = rawEnd;

		const assignedRow = globalSlots
			? (globalSlots.get(event.id) ?? -1)
			: findFreeRow(reserved, startCol, endCol);

		if (assignedRow === -1 || assignedRow >= MAX_VISIBLE_SLOTS) {
			for (let col = startCol; col <= endCol; col++) {
				const cell = layout.get(week[col].dateKey);
				if (cell) cell.overflowCount++;
			}
			continue;
		}

		for (let col = startCol; col <= endCol; col++) {
			reserved[assignedRow].add(col);
		}

		const spanInWeek = endCol - startCol + 1;
		const isStart = dateToNum(week[startCol].dateKey) === eStartNum;
		const isEnd = dateToNum(week[endCol].dateKey) === eEndNum;

		const cell = layout.get(week[startCol].dateKey);
		if (cell) {
			cell.slots[assignedRow] = { event, spanInWeek, isStart, isEnd };
		}
	}

	return layout;
}

export function computeMonthEventLayout(
	events: CalendarEvent[],
	grid: CalendarDay[][],
	globalSlots?: GlobalEventSlotMap,
): MonthEventLayout {
	const layout: MonthEventLayout = new Map();

	for (const week of grid) {
		for (const day of week) {
			layout.set(day.dateKey, emptyDayCellLayout());
		}
	}

	const sortedEvents = sortEvents(events);

	for (const week of grid) {
		const weekStartNum = dateToNum(week[0].dateKey);
		const weekEndNum = dateToNum(week[6].dateKey);

		const weekEvents = sortedEvents.filter((e) => {
			const eStart = dateToNum(e.startDate);
			const eEnd = dateToNum(e.endDate);
			return eStart <= weekEndNum && eEnd >= weekStartNum;
		});

		const reserved: Set<number>[] = Array.from({ length: MAX_VISIBLE_SLOTS }, () => new Set());

		for (const event of weekEvents) {
			const eStartNum = dateToNum(event.startDate);
			const eEndNum = dateToNum(event.endDate);

			const cols = findEffectiveColumns(week, eStartNum, eEndNum);
			if (!cols) continue;

			const { startCol, endCol } = cols;

			const assignedRow = globalSlots
				? (globalSlots.get(event.id) ?? -1)
				: findFreeRow(reserved, startCol, endCol);

			if (assignedRow === -1 || assignedRow >= MAX_VISIBLE_SLOTS) {
				for (let col = startCol; col <= endCol; col++) {
					const cell = layout.get(week[col].dateKey);
					if (cell) cell.overflowCount++;
				}
				continue;
			}

			for (let col = startCol; col <= endCol; col++) {
				reserved[assignedRow].add(col);
			}

			const spanInWeek = endCol - startCol + 1;
			const isStart = dateToNum(week[startCol].dateKey) === eStartNum;
			const isEnd = dateToNum(week[endCol].dateKey) === eEndNum;

			const cell = layout.get(week[startCol].dateKey);
			if (cell) {
				cell.slots[assignedRow] = {
					event,
					spanInWeek,
					isStart,
					isEnd,
				};
			}
		}
	}

	return layout;
}
