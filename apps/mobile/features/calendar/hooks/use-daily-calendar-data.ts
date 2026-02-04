import { useMemo } from "react";
import {
	type DailyEventLayout,
	computeDailyEventLayout,
	timeToSlot,
} from "../../../components/ui/calendar-grid/daily-event-layout";
import type { CalendarEvent } from "../../../components/ui/calendar-grid/event-layout";

type UseDailyCalendarDataResult = {
	layout: DailyEventLayout;
	currentTimeSlot: number | null;
};

/**
 * 指定日付のデイリーカレンダーデータを計算する。
 * @param dateKey 対象日付（YYYY-MM-DD）。null の場合は空のレイアウトを返す。
 * @param events 全イベントリスト
 * @param currentDate 現在日時（現在時刻インジケータ用）。デフォルトは new Date()。
 */
export function useDailyCalendarData(
	dateKey: string | null,
	events: CalendarEvent[],
	currentDate: Date = new Date(),
): UseDailyCalendarDataResult {
	const layout = useMemo<DailyEventLayout>(() => {
		if (!dateKey) {
			return { allDayEvents: [], timedEvents: [] };
		}
		return computeDailyEventLayout(events, dateKey);
	}, [dateKey, events]);

	const currentTimeSlot = useMemo<number | null>(() => {
		if (!dateKey) return null;

		// 現在日付と表示日付が一致する場合のみ現在時刻スロットを返す
		const today = formatDateKey(currentDate);
		if (today !== dateKey) return null;

		const hours = currentDate.getHours();
		const minutes = currentDate.getMinutes();
		const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		return timeToSlot(time);
	}, [dateKey, currentDate]);

	return { layout, currentTimeSlot };
}

function formatDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
}
