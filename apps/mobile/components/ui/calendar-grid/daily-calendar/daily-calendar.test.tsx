import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DailyEventLayout } from "../../../../features/calendar/utils/daily-event-layout";
import { DailyCalendar } from "./daily-calendar";

const createEmptyLayout = (): DailyEventLayout => ({
	allDayEvents: [],
	timedEvents: [],
});

const createLayoutWithAllDay = (): DailyEventLayout => ({
	allDayEvents: [
		{
			id: "1",
			title: "終日イベント",
			startDate: "2026-01-01",
			endDate: "2026-01-01",
			color: "#4A90D9",
			type: "allDay",
		},
	],
	timedEvents: [],
});

const createLayoutWithTimedEvent = (): DailyEventLayout => ({
	allDayEvents: [],
	timedEvents: [
		{
			event: {
				id: "1",
				title: "会議",
				startDate: "2026-01-01",
				endDate: "2026-01-01",
				color: "#4A90D9",
				type: "timed",
				time: { start: "10:00", end: "11:00" },
			},
			top: 120,
			height: 12,
			column: 0,
			totalColumns: 1,
		},
	],
});

describe("DailyCalendar", () => {
	it("コンテナがレンダリングされる", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("daily-calendar")).toBeInTheDocument();
	});

	it("dateKey を指定してレンダリングできる", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-15"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("daily-calendar")).toBeInTheDocument();
	});

	it("TimeGrid が表示される", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("time-grid")).toBeInTheDocument();
	});

	it("終日イベントがある場合、AllDaySection が表示される", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createLayoutWithAllDay()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("all-day-section")).toBeInTheDocument();
		expect(screen.getByText("終日イベント")).toBeInTheDocument();
	});

	it("終日イベントがない場合、AllDaySection は表示されない", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.queryByTestId("all-day-section")).not.toBeInTheDocument();
	});

	it("時間指定イベントがある場合、TimedEventBlock が表示される", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createLayoutWithTimedEvent()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("timed-event-block")).toBeInTheDocument();
		expect(screen.getByText("会議")).toBeInTheDocument();
	});

	it("currentTimeSlot が指定された場合、CurrentTimeIndicator が表示される", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={120}
			/>,
		);
		expect(screen.getByTestId("current-time-indicator")).toBeInTheDocument();
	});

	it("currentTimeSlot が null の場合、CurrentTimeIndicator は表示されない", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.queryByTestId("current-time-indicator")).not.toBeInTheDocument();
	});

	it("ScrollView でスクロール可能である", () => {
		render(
			<DailyCalendar
				dateKey="2026-01-01"
				layout={createEmptyLayout()}
				textColor="#000"
				currentTimeSlot={null}
			/>,
		);
		expect(screen.getByTestId("daily-calendar-scroll")).toBeInTheDocument();
	});
});
