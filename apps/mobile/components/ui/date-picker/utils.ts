export function formatDateLabel(dateStr: string): string {
	const { year, month, day } = parseDateString(dateStr);
	return `${year}年${month + 1}月${day}日`;
}

export function parseDateString(dateStr: string): {
	year: number;
	month: number;
	day: number;
} {
	const [y, m, d] = dateStr.split("-").map(Number);
	return { year: y, month: m - 1, day: d };
}

export function toDateString(year: number, month: number, day: number): string {
	const mm = String(month + 1).padStart(2, "0");
	const dd = String(day).padStart(2, "0");
	return `${year}-${mm}-${dd}`;
}
