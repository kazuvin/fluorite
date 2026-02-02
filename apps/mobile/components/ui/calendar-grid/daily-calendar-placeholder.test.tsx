import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyCalendarPlaceholder } from "./daily-calendar-placeholder";

describe("DailyCalendarPlaceholder", () => {
	it("isVisible=true のとき、プレースホルダーが表示される", () => {
		render(<DailyCalendarPlaceholder isVisible={true} dateKey="2025-01-15" />);
		expect(screen.getByTestId("daily-calendar-placeholder")).toBeInTheDocument();
	});

	it("isVisible=false のとき、プレースホルダーが表示されない", () => {
		render(<DailyCalendarPlaceholder isVisible={false} dateKey={null} />);
		expect(screen.queryByTestId("daily-calendar-placeholder")).not.toBeInTheDocument();
	});

	it("dateKey が渡されたとき、日付テキストが表示される", () => {
		render(<DailyCalendarPlaceholder isVisible={true} dateKey="2025-03-20" />);
		expect(screen.getByText("2025-03-20")).toBeInTheDocument();
	});

	it("isVisible=true でも dateKey=null のとき、日付テキストは表示されない", () => {
		render(<DailyCalendarPlaceholder isVisible={true} dateKey={null} />);
		expect(screen.getByTestId("daily-calendar-placeholder")).toBeInTheDocument();
		expect(screen.queryByText(/\d{4}-\d{2}-\d{2}/)).not.toBeInTheDocument();
	});
});
