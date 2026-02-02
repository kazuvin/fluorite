export type CalendarDay = {
	date: number;
	month: number;
	year: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	dateKey: string;
};

const DAYS_PER_WEEK = 7;

export function offsetToYearMonth(
	baseYear: number,
	baseMonth: number,
	offset: number,
): { year: number; month: number } {
	const totalMonths = baseYear * 12 + baseMonth + offset;
	return {
		year: Math.floor(totalMonths / 12),
		month: ((totalMonths % 12) + 12) % 12,
	};
}

export function generateOffsets(range: number): number[] {
	return Array.from({ length: range * 2 + 1 }, (_, i) => i - range);
}

const GRID_ROWS = 6;

export function generateCalendarGrid(year: number, month: number, today?: Date): CalendarDay[][] {
	const firstDay = new Date(year, month, 1);
	const startDayOfWeek = firstDay.getDay(); // 0=Sun

	const grid: CalendarDay[][] = [];
	let current = new Date(year, month, 1 - startDayOfWeek);

	for (let row = 0; row < GRID_ROWS; row++) {
		const week: CalendarDay[] = [];
		for (let col = 0; col < DAYS_PER_WEEK; col++) {
			const cYear = current.getFullYear();
			const cMonth = current.getMonth();
			const cDate = current.getDate();

			const isToday =
				today !== undefined &&
				cYear === today.getFullYear() &&
				cMonth === today.getMonth() &&
				cDate === today.getDate();

			const mm = String(cMonth + 1).padStart(2, "0");
			const dd = String(cDate).padStart(2, "0");

			week.push({
				date: cDate,
				month: cMonth,
				year: cYear,
				isCurrentMonth: cMonth === month && cYear === year,
				isToday,
				dateKey: `${cYear}-${mm}-${dd}`,
			});
			current = new Date(cYear, cMonth, cDate + 1);
		}
		grid.push(week);
	}

	return grid;
}

export function generateWeekFromDate(
	dateKey: string,
	weekOffset: number,
	today?: Date,
): CalendarDay[] {
	const [y, m, d] = dateKey.split("-").map(Number);
	const baseDate = new Date(y, m - 1, d);
	const baseDayOfWeek = baseDate.getDay(); // 0=Sun
	// Sunday of the base week + weekOffset * 7
	const sundayDate = new Date(y, m - 1, d - baseDayOfWeek + weekOffset * DAYS_PER_WEEK);

	const contextMonth = m - 1; // 0-indexed month from the dateKey
	const contextYear = y;

	const week: CalendarDay[] = [];
	for (let col = 0; col < DAYS_PER_WEEK; col++) {
		const current = new Date(
			sundayDate.getFullYear(),
			sundayDate.getMonth(),
			sundayDate.getDate() + col,
		);
		const cYear = current.getFullYear();
		const cMonth = current.getMonth();
		const cDate = current.getDate();

		const isToday =
			today !== undefined &&
			cYear === today.getFullYear() &&
			cMonth === today.getMonth() &&
			cDate === today.getDate();

		const mm = String(cMonth + 1).padStart(2, "0");
		const dd = String(cDate).padStart(2, "0");

		week.push({
			date: cDate,
			month: cMonth,
			year: cYear,
			isCurrentMonth: cMonth === contextMonth && cYear === contextYear,
			isToday,
			dateKey: `${cYear}-${mm}-${dd}`,
		});
	}

	return week;
}

export function findWeekIndexForDateKey(grid: CalendarDay[][], dateKey: string): number {
	for (let i = 0; i < grid.length; i++) {
		if (grid[i].some((day) => day.dateKey === dateKey)) {
			return i;
		}
	}
	return -1;
}

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function parseDateKey(dateKey: string): {
	year: number;
	month: number;
	day: number;
	weekday: string;
} {
	const [y, m, d] = dateKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	return {
		year: y,
		month: m,
		day: d,
		weekday: WEEKDAY_NAMES[date.getDay()],
	};
}
