/**
 * 前回と今回の年月から方向を算出する。
 * 増加(未来方向) => 1, 減少(過去方向) => -1, 同一 => 1
 */
export function computeDirection(
	prevYear: number,
	prevMonth: number,
	currYear: number,
	currMonth: number,
): 1 | -1 {
	const prevTotal = prevYear * 12 + prevMonth;
	const currTotal = currYear * 12 + currMonth;
	return currTotal >= prevTotal ? 1 : -1;
}
