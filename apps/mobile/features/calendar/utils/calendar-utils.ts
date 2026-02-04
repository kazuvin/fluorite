import type { CalendarDay } from "../../../components/ui/calendar-grid/utils";
import { toDateString } from "../../../components/ui/date-picker/utils";

const MAX_GRID_ROWS = 6;
const DAYS_PER_WEEK = 7;

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
	const now = new Date();
	return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Pads a calendar grid to ensure it has 6 rows.
 * Additional rows are marked as not being part of the current month.
 */
export function padGrid(grid: CalendarDay[][]): CalendarDay[][] {
	if (grid.length >= MAX_GRID_ROWS) return grid;

	const padded = [...grid];
	while (padded.length < MAX_GRID_ROWS) {
		const lastWeek = padded[padded.length - 1];
		const lastDay = lastWeek[DAYS_PER_WEEK - 1];
		const nextStart = new Date(lastDay.year, lastDay.month, lastDay.date + 1);

		const week: CalendarDay[] = [];
		for (let i = 0; i < DAYS_PER_WEEK; i++) {
			const d = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() + i);
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			week.push({
				date: d.getDate(),
				month: d.getMonth(),
				year: d.getFullYear(),
				isCurrentMonth: false,
				isToday: false,
				dateKey: `${d.getFullYear()}-${mm}-${dd}`,
			});
		}
		padded.push(week);
	}

	return padded;
}

/**
 * Returns the appropriate testID for a calendar day based on its selection state.
 */
export function getDayTestId(dateKey: string, start: string, end: string): string {
	const hasRange = !!start && !!end && start !== end;
	const isStart = start === dateKey;
	const isEnd = end === dateKey;
	const isInRange = hasRange && start < dateKey && dateKey < end;

	if (isStart) return "calendar-day-range-start";
	if (hasRange && isEnd) return "calendar-day-range-end";
	if (isInRange) return "calendar-day-in-range";
	return "calendar-day";
}
