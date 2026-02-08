import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarDayCell } from "./calendar-day-cell";

const defaultColors = {
	text: "#000000",
	background: "#FFFFFF",
	primary: "#007AFF",
	muted: "#8E8E93",
};

describe("CalendarDayCell", () => {
	it("日付の数字が表示される", () => {
		render(
			<CalendarDayCell
				day={{
					date: 15,
					month: 0,
					year: 2026,
					isCurrentMonth: true,
					isToday: false,
					dateKey: "2026-01-15",
				}}
				colors={defaultColors}
			/>,
		);
		expect(screen.getByText("15")).toBeInTheDocument();
	});

	it("testID が day-cell-{dateKey} で設定される", () => {
		render(
			<CalendarDayCell
				day={{
					date: 10,
					month: 0,
					year: 2026,
					isCurrentMonth: true,
					isToday: false,
					dateKey: "2026-01-10",
				}}
				colors={defaultColors}
			/>,
		);
		expect(screen.getByTestId("day-cell-2026-01-10")).toBeInTheDocument();
	});

	it("onPress が呼ばれると dateKey が渡される", () => {
		const onPress = vi.fn();
		render(
			<CalendarDayCell
				day={{
					date: 15,
					month: 0,
					year: 2026,
					isCurrentMonth: true,
					isToday: false,
					dateKey: "2026-01-15",
				}}
				colors={defaultColors}
				onPress={onPress}
			/>,
		);
		fireEvent.click(screen.getByTestId("day-cell-2026-01-15"));
		expect(onPress).toHaveBeenCalledWith("2026-01-15");
	});

	it("onPress が未指定でもクラッシュしない", () => {
		render(
			<CalendarDayCell
				day={{
					date: 15,
					month: 0,
					year: 2026,
					isCurrentMonth: true,
					isToday: false,
					dateKey: "2026-01-15",
				}}
				colors={defaultColors}
			/>,
		);
		expect(() => fireEvent.click(screen.getByTestId("day-cell-2026-01-15"))).not.toThrow();
	});

	it("今日の日付のコンテナに today-circle testID が設定される", () => {
		render(
			<CalendarDayCell
				day={{
					date: 8,
					month: 1,
					year: 2026,
					isCurrentMonth: true,
					isToday: true,
					dateKey: "2026-02-08",
				}}
				colors={defaultColors}
			/>,
		);
		expect(screen.getByTestId("today-circle")).toBeInTheDocument();
	});

	it("今日でない日付には today-circle testID がない", () => {
		render(
			<CalendarDayCell
				day={{
					date: 10,
					month: 0,
					year: 2026,
					isCurrentMonth: true,
					isToday: false,
					dateKey: "2026-01-10",
				}}
				colors={defaultColors}
			/>,
		);
		expect(screen.queryByTestId("today-circle")).not.toBeInTheDocument();
	});
});
