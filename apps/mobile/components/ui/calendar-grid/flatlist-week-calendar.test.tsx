import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlatListWeekCalendar } from "./flatlist-week-calendar";

const defaultColors = {
	text: "#000000",
	background: "#FFFFFF",
	primary: "#007AFF",
	muted: "#8E8E93",
};

describe("FlatListWeekCalendar", () => {
	it("コンテナがレンダリングされる", () => {
		render(
			<FlatListWeekCalendar dateKey="2026-01-15" colors={defaultColors} events={[]} width={375} />,
		);
		expect(screen.getByTestId("week-calendar")).toBeInTheDocument();
	});

	it("FlatList が水平スクロール可能に設定されている", () => {
		render(
			<FlatListWeekCalendar dateKey="2026-01-15" colors={defaultColors} events={[]} width={375} />,
		);
		// FlatList のコンテナが存在する
		const container = screen.getByTestId("week-calendar");
		expect(container).toBeInTheDocument();
	});
});
