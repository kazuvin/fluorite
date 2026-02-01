import type { EventNote } from "@fluorite/core";
import type { CalendarDay } from "./utils";

export type CalendarEvent = {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	color: string;
	type: "allDay" | "timed";
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

const MAX_VISIBLE_SLOTS = 3;

const TAG_COLORS: Record<string, string> = {
	"#work": "#4A90D9",
	"#personal": "#50C878",
	"#holiday": "#FF6B6B",
};
const DEFAULT_COLOR = "#9B9B9B";

function resolveColor(tags?: string[]): string {
	if (!tags || tags.length === 0) return DEFAULT_COLOR;
	for (const tag of tags) {
		if (TAG_COLORS[tag]) return TAG_COLORS[tag];
	}
	return DEFAULT_COLOR;
}

export function eventNotesToCalendarEvents(notes: EventNote[]): CalendarEvent[] {
	return notes.map((note, index) => ({
		id: `event-${index}`,
		title: note.title,
		startDate: note.start,
		endDate: note.end,
		color: resolveColor(note.tags),
		type: note.allDay ? "allDay" : "timed",
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

function emptyDayCellLayout(): DayCellLayout {
	return {
		slots: Array.from({ length: MAX_VISIBLE_SLOTS }, () => null),
		overflowCount: 0,
	};
}

/**
 * イベントがこの週の当月内で占める列範囲を算出する。
 * 当月外のみの場合は null を返す。
 */
function findEffectiveColumns(
	week: CalendarDay[],
	eStartNum: number,
	eEndNum: number,
): { startCol: number; endCol: number } | null {
	const rawStart = week.findIndex((d) => dateToNum(d.dateKey) >= eStartNum);
	const rawEnd = week.findLastIndex((d) => dateToNum(d.dateKey) <= eEndNum);
	if (rawStart === -1 || rawEnd === -1 || rawStart > rawEnd) return null;

	// 当月内かつイベント範囲に含まれるセルに限定
	const cmStart = week.findIndex(
		(d) => d.isCurrentMonth && dateToNum(d.dateKey) >= eStartNum && dateToNum(d.dateKey) <= eEndNum,
	);
	const cmEnd = week.findLastIndex(
		(d) => d.isCurrentMonth && dateToNum(d.dateKey) >= eStartNum && dateToNum(d.dateKey) <= eEndNum,
	);
	if (cmStart === -1 || cmEnd === -1) return null;

	const startCol = Math.max(rawStart, cmStart);
	const endCol = Math.min(rawEnd, cmEnd);
	if (startCol > endCol) return null;

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

export function computeMonthEventLayout(
	events: CalendarEvent[],
	grid: CalendarDay[][],
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
			const assignedRow = findFreeRow(reserved, startCol, endCol);

			if (assignedRow === -1) {
				for (let col = startCol; col <= endCol; col++) {
					if (week[col].isCurrentMonth) {
						const cell = layout.get(week[col].dateKey);
						if (cell) cell.overflowCount++;
					}
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
