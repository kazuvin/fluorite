import { render, rerender } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MonthCalendar } from "./month-calendar";

const defaultColors = {
	text: "#000",
	background: "#fff",
	primary: "#007AFF",
	muted: "#999",
};

const defaultProps = {
	baseYear: 2025,
	baseMonth: 11, // December (0-indexed)
	viewingYear: 2025,
	viewingMonth: 11,
	direction: 1 as const,
	colors: defaultColors,
	events: [],
	onMonthChange: vi.fn(),
	onSelectDate: vi.fn(),
};

describe("MonthCalendar", () => {
	describe("他月の日付を選択した場合", () => {
		it("12月表示中に1月の日付を選択しても月カレンダーは移動しない", () => {
			const onMonthChange = vi.fn();

			const { rerender } = render(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey={null}
					selectedWeekIndex={-1}
				/>,
			);

			// 12月のグリッドに表示されている1月1日を選択
			rerender(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey="2026-01-01"
					selectedWeekIndex={4}
				/>,
			);

			// 週カレンダーに切り替わるため、月カレンダーの月移動は不要
			expect(onMonthChange).not.toHaveBeenCalled();
		});
	});

	describe("週モードから月モードに戻る時の月移動", () => {
		it("選択解除時、前の選択日が表示中の月グリッド内なら月移動しない", () => {
			const onMonthChange = vi.fn();

			// 12月表示中に1月1日を選択中（1月1日は12月グリッドの5行目にある）
			const { rerender } = render(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey="2026-01-01"
					selectedWeekIndex={4}
				/>,
			);

			// 選択解除（週→月に戻る）
			rerender(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey={null}
					selectedWeekIndex={-1}
				/>,
			);

			// 1月1日は12月グリッドに含まれるので月移動しない
			expect(onMonthChange).not.toHaveBeenCalled();
		});

		it("選択解除時、前の選択日が表示中の月グリッド外なら選択日の月に移動する", () => {
			const onMonthChange = vi.fn();

			// 12月表示中に1月15日を選択中（1月15日は12月グリッドにない）
			const { rerender } = render(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey="2026-01-15"
					selectedWeekIndex={-1}
				/>,
			);

			// 選択解除（週→月に戻る）
			rerender(
				<MonthCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey={null}
					selectedWeekIndex={-1}
				/>,
			);

			// 1月15日は12月グリッドにないので、1月(0-indexed: 0)に移動
			expect(onMonthChange).toHaveBeenCalledWith(2026, 0);
		});
	});
});
