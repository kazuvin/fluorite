import type { CalendarEvent } from "./event-layout";

export type DailyEventPosition = {
	event: CalendarEvent;
	top: number;
	height: number;
	column: number;
	totalColumns: number;
};

export type DailyEventLayout = {
	allDayEvents: CalendarEvent[];
	timedEvents: DailyEventPosition[];
};

export const GRID_INTERVAL_MINUTES = 5;
export const SLOTS_PER_HOUR = 12;
const DEFAULT_DURATION_SLOTS = 6; // 30分

/**
 * 時刻文字列 (HH:MM) をスロット位置に変換する。
 * 1スロット = 5分、1時間 = 12スロット
 */
export function timeToSlot(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * SLOTS_PER_HOUR + Math.floor(minutes / GRID_INTERVAL_MINUTES);
}

/**
 * イベントが指定日付に含まれるかを判定する。
 */
function eventIncludesDate(event: CalendarEvent, dateKey: string): boolean {
	return event.startDate <= dateKey && event.endDate >= dateKey;
}

/**
 * 時間指定イベントの位置情報を計算する（カラム情報なし）。
 */
function computeTimedEventPosition(
	event: CalendarEvent,
): Omit<DailyEventPosition, "column" | "totalColumns"> {
	const startSlot = event.time ? timeToSlot(event.time.start) : 0;
	const endSlot = event.time?.end ? timeToSlot(event.time.end) : startSlot + DEFAULT_DURATION_SLOTS;
	const height = Math.max(1, endSlot - startSlot);

	return {
		event,
		top: startSlot,
		height,
	};
}

/**
 * 2つのイベントが時間的に重複しているかを判定する。
 */
function eventsOverlap(
	a: Omit<DailyEventPosition, "column" | "totalColumns">,
	b: Omit<DailyEventPosition, "column" | "totalColumns">,
): boolean {
	const aEnd = a.top + a.height;
	const bEnd = b.top + b.height;
	return a.top < bEnd && b.top < aEnd;
}

/**
 * 重複するイベントグループにカラムを割り当てる。
 */
function assignColumns(
	positions: Omit<DailyEventPosition, "column" | "totalColumns">[],
): DailyEventPosition[] {
	if (positions.length === 0) return [];

	// 開始時刻順にソート
	const sorted = [...positions].sort((a, b) => a.top - b.top);

	type EventWithColumn = DailyEventPosition;
	const result: EventWithColumn[] = [];

	// グループごとに処理
	let currentGroup: EventWithColumn[] = [];
	let groupEndSlot = 0;

	for (const pos of sorted) {
		// 現在のグループと重複しない場合、グループを確定
		if (currentGroup.length > 0 && pos.top >= groupEndSlot) {
			// グループ内の totalColumns を更新
			const maxColumn = Math.max(...currentGroup.map((e) => e.column)) + 1;
			for (const e of currentGroup) {
				e.totalColumns = maxColumn;
			}
			result.push(...currentGroup);
			currentGroup = [];
			groupEndSlot = 0;
		}

		// 空いているカラムを探す
		let column = 0;
		const occupiedColumns = new Set<number>();
		for (const existing of currentGroup) {
			if (eventsOverlap(pos, existing)) {
				occupiedColumns.add(existing.column);
			}
		}
		while (occupiedColumns.has(column)) {
			column++;
		}

		const eventWithColumn: EventWithColumn = {
			...pos,
			column,
			totalColumns: 1, // 後で更新
		};

		currentGroup.push(eventWithColumn);
		groupEndSlot = Math.max(groupEndSlot, pos.top + pos.height);
	}

	// 最後のグループを処理
	if (currentGroup.length > 0) {
		const maxColumn = Math.max(...currentGroup.map((e) => e.column)) + 1;
		for (const e of currentGroup) {
			e.totalColumns = maxColumn;
		}
		result.push(...currentGroup);
	}

	// 開始時刻順に再ソート
	return result.sort((a, b) => a.top - b.top);
}

/**
 * 指定日付のイベントレイアウトを計算する。
 */
export function computeDailyEventLayout(
	events: CalendarEvent[],
	dateKey: string,
): DailyEventLayout {
	// 指定日付に含まれるイベントをフィルタ
	const dayEvents = events.filter((e) => eventIncludesDate(e, dateKey));

	// 終日イベントと時間指定イベントを分離
	const allDayEvents = dayEvents.filter((e) => e.type === "allDay");
	const timedEvents = dayEvents.filter((e) => e.type === "timed" && e.time);

	// 時間指定イベントの位置を計算
	const positions = timedEvents.map(computeTimedEventPosition);

	// カラムを割り当て
	const timedEventPositions = assignColumns(positions);

	return {
		allDayEvents,
		timedEvents: timedEventPositions,
	};
}
