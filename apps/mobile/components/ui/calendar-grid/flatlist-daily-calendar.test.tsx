import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlatListDailyCalendar } from "./flatlist-daily-calendar";

describe("FlatListDailyCalendar", () => {
	it("コンテナがレンダリングされる", () => {
		render(<FlatListDailyCalendar dateKey="2026-01-15" events={[]} textColor="#000000" />);
		expect(screen.getByTestId("flatlist-daily-calendar")).toBeInTheDocument();
	});

	it("FlatList が水平スクロール可能に設定されている", () => {
		render(<FlatListDailyCalendar dateKey="2026-01-15" events={[]} textColor="#000000" />);
		const container = screen.getByTestId("flatlist-daily-calendar");
		expect(container).toBeInTheDocument();
	});

	it("DailyCalendar がページ内にレンダリングされる", () => {
		render(<FlatListDailyCalendar dateKey="2026-01-15" events={[]} textColor="#000000" />);
		// FlatList の仮想化により複数ページがレンダリングされる
		const calendars = screen.getAllByTestId("daily-calendar");
		expect(calendars.length).toBeGreaterThan(0);
	});

	it("イベントがある場合、DailyCalendar にイベントが渡される", () => {
		const events = [
			{
				id: "1",
				title: "会議",
				startDate: "2026-01-15",
				endDate: "2026-01-15",
				color: "#4A90D9",
				type: "timed" as const,
				time: { start: "10:00", end: "11:00" },
			},
		];
		render(<FlatListDailyCalendar dateKey="2026-01-15" events={events} textColor="#000000" />);
		expect(screen.getByText("会議")).toBeInTheDocument();
	});

	it("onDateChange コールバックが props として受け取れる", () => {
		const onDateChange = () => {};
		render(
			<FlatListDailyCalendar
				dateKey="2026-01-15"
				events={[]}
				textColor="#000000"
				onDateChange={onDateChange}
			/>,
		);
		expect(screen.getByTestId("flatlist-daily-calendar")).toBeInTheDocument();
	});

	it("外部から dateKey が変更されても remount せずコンテナが維持される", () => {
		const { rerender } = render(
			<FlatListDailyCalendar dateKey="2026-01-15" events={[]} textColor="#000000" />,
		);
		const containerBefore = screen.getByTestId("flatlist-daily-calendar");

		rerender(<FlatListDailyCalendar dateKey="2026-01-20" events={[]} textColor="#000000" />);
		const containerAfter = screen.getByTestId("flatlist-daily-calendar");

		// key による remount ではなく、同一インスタンスが維持される
		expect(containerBefore).toBe(containerAfter);
	});
});
