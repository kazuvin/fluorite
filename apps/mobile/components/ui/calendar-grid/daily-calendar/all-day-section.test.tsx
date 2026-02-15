import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../../../features/calendar/utils/event-layout";
import { AllDaySection } from "./all-day-section";

const createEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
	id: "1",
	title: "終日イベント",
	startDate: "2026-01-01",
	endDate: "2026-01-01",
	color: "#4A90D9",
	type: "allDay",
	...overrides,
});

describe("AllDaySection", () => {
	it("終日イベントがない場合、何も表示されない", () => {
		render(<AllDaySection events={[]} textColor="#000" />);
		expect(screen.queryByTestId("all-day-section")).not.toBeInTheDocument();
	});

	it("終日イベントがある場合、セクションが表示される", () => {
		const events = [createEvent()];
		render(<AllDaySection events={events} textColor="#000" />);
		expect(screen.getByTestId("all-day-section")).toBeInTheDocument();
	});

	it("終日イベントのタイトルが表示される", () => {
		const events = [createEvent({ title: "正月休み" })];
		render(<AllDaySection events={events} textColor="#000" />);
		expect(screen.getByText("正月休み")).toBeInTheDocument();
	});

	it("複数の終日イベントが表示される", () => {
		const events = [
			createEvent({ id: "1", title: "イベント1" }),
			createEvent({ id: "2", title: "イベント2" }),
			createEvent({ id: "3", title: "イベント3" }),
		];
		render(<AllDaySection events={events} textColor="#000" />);
		expect(screen.getByText("イベント1")).toBeInTheDocument();
		expect(screen.getByText("イベント2")).toBeInTheDocument();
		expect(screen.getByText("イベント3")).toBeInTheDocument();
	});

	it("イベントの色が背景色として適用される", () => {
		const events = [createEvent({ color: "#50C878" })];
		render(<AllDaySection events={events} textColor="#000" />);
		const eventBlock = screen.getByTestId("all-day-event-1");
		expect(eventBlock).toHaveStyle({ backgroundColor: "#50C878" });
	});

	it("「終日」ラベルが指定されたテキスト色で表示される", () => {
		const events = [createEvent()];
		render(<AllDaySection events={events} textColor="#FF0000" />);
		const label = screen.getByText("終日");
		expect(label).toHaveStyle({ color: "#FF0000" });
	});
});
