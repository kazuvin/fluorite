import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarWeekPage } from "./calendar-week-page";

const defaultColors = {
	text: "#000000",
	background: "#FFFFFF",
	primary: "#007AFF",
	muted: "#8E8E93",
};

describe("CalendarWeekPage", () => {
	it("7つのセルがレンダリングされる", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[]}
				width={375}
			/>,
		);
		// 2026-01-15 (木曜) の週: 1/11(日)~1/17(土)
		expect(screen.getByText("11")).toBeInTheDocument();
		expect(screen.getByText("12")).toBeInTheDocument();
		expect(screen.getByText("13")).toBeInTheDocument();
		expect(screen.getByText("14")).toBeInTheDocument();
		expect(screen.getByText("15")).toBeInTheDocument();
		expect(screen.getByText("16")).toBeInTheDocument();
		expect(screen.getByText("17")).toBeInTheDocument();
	});

	it("コンテナの testID が week-page である", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[]}
				width={375}
			/>,
		);
		expect(screen.getByTestId("week-page")).toBeInTheDocument();
	});

	it("weekOffset=1 で翌週が表示される", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={1}
				colors={defaultColors}
				events={[]}
				width={375}
			/>,
		);
		// 翌週: 1/18(日)~1/24(土)
		expect(screen.getByText("18")).toBeInTheDocument();
		expect(screen.getByText("24")).toBeInTheDocument();
	});

	it("onSelectDate が呼ばれると dateKey が渡される", () => {
		const onSelectDate = vi.fn();
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[]}
				width={375}
				onSelectDate={onSelectDate}
			/>,
		);
		fireEvent.click(screen.getByTestId("day-cell-2026-01-15"));
		expect(onSelectDate).toHaveBeenCalledWith("2026-01-15");
	});

	it("選択インジケーターは常にレンダリングされる（Animated.View）", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[]}
				width={375}
			/>,
		);
		// Animated.View で常にマウントされている
		expect(screen.getByTestId("week-selection-indicator")).toBeInTheDocument();
	});

	it("selectedDateKey に一致するセルが選択状態になる", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[]}
				width={375}
				selectedDateKey="2026-01-15"
			/>,
		);
		expect(screen.getByTestId("week-selection-indicator")).toBeInTheDocument();
	});

	it("イベントバーがレンダリングされる", () => {
		render(
			<CalendarWeekPage
				dateKey="2026-01-15"
				weekOffset={0}
				colors={defaultColors}
				events={[
					{
						id: "1",
						title: "テストイベント",
						startDate: "2026-01-15",
						endDate: "2026-01-15",
						color: "#FF0000",
						type: "allDay",
					},
				]}
				width={375}
			/>,
		);
		expect(screen.getByText("テストイベント")).toBeInTheDocument();
	});
});
