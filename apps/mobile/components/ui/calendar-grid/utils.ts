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
