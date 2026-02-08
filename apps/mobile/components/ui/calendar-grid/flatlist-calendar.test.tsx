import { render, rerender } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlatListCalendar } from "./flatlist-calendar";

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

describe("FlatListCalendar", () => {
	describe("他月の日付を選択した場合のviewingMonth同期", () => {
		it("12月表示中に1月の日付を選択すると onMonthChange が呼ばれる", () => {
			const onMonthChange = vi.fn();

			const { rerender } = render(
				<FlatListCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey={null}
					selectedWeekIndex={-1}
				/>,
			);

			// 12月のグリッドに表示されている1月1日を選択
			rerender(
				<FlatListCalendar
					{...defaultProps}
					onMonthChange={onMonthChange}
					selectedDateKey="2026-01-01"
					selectedWeekIndex={4}
				/>,
			);

			// onMonthChange が 2026年1月 (0-indexed: month=0) で呼ばれるべき
			expect(onMonthChange).toHaveBeenCalledWith(2026, 0);
		});
	});
});
