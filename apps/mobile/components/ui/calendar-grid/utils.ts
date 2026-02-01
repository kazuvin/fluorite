export type CalendarDay = {
	date: number;
	month: number;
	year: number;
	isCurrentMonth: boolean;
	isToday: boolean;
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

export function generateCalendarGrid(year: number, month: number, today?: Date): CalendarDay[][] {
	const firstDay = new Date(year, month, 1);
	const startDayOfWeek = firstDay.getDay(); // 0=Sun
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const totalCells = startDayOfWeek + daysInMonth;
	const gridRows = Math.ceil(totalCells / DAYS_PER_WEEK);

	const grid: CalendarDay[][] = [];
	let current = new Date(year, month, 1 - startDayOfWeek);

	for (let row = 0; row < gridRows; row++) {
		const week: CalendarDay[] = [];
		for (let col = 0; col < DAYS_PER_WEEK; col++) {
			const isToday =
				today !== undefined &&
				current.getFullYear() === today.getFullYear() &&
				current.getMonth() === today.getMonth() &&
				current.getDate() === today.getDate();

			week.push({
				date: current.getDate(),
				month: current.getMonth(),
				year: current.getFullYear(),
				isCurrentMonth: current.getMonth() === month && current.getFullYear() === year,
				isToday,
			});
			current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
		}
		grid.push(week);
	}

	return grid;
}
