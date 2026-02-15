import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DailyEventPosition } from "../../../../features/calendar/utils/daily-event-layout";
import { TimedEventBlock } from "./timed-event-block";

const createPosition = (overrides: Partial<DailyEventPosition> = {}): DailyEventPosition => ({
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
	...overrides,
});

describe("TimedEventBlock", () => {
	const slotHeight = 5;
	const containerWidth = 300;
	const leftOffset = 48;

	it("top と height が正しく計算される", () => {
		const position = createPosition({ top: 120, height: 12 });
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		const block = screen.getByTestId("timed-event-block");
		expect(block).toHaveStyle({ top: "600px" }); // 120 * 5
		expect(block).toHaveStyle({ height: "60px" }); // 12 * 5
	});

	it("column=0, totalColumns=1 のとき、全幅を使用する", () => {
		const position = createPosition({ column: 0, totalColumns: 1 });
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		const block = screen.getByTestId("timed-event-block");
		const expectedWidth = containerWidth - leftOffset; // 300 - 48 = 252
		expect(block).toHaveStyle({ width: `${expectedWidth}px` });
		expect(block).toHaveStyle({ left: `${leftOffset}px` });
	});

	it("column=0, totalColumns=2 のとき、半分の幅を使用する", () => {
		const position = createPosition({ column: 0, totalColumns: 2 });
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		const block = screen.getByTestId("timed-event-block");
		const availableWidth = containerWidth - leftOffset; // 252
		const expectedWidth = availableWidth / 2; // 126
		expect(block).toHaveStyle({ width: `${expectedWidth}px` });
		expect(block).toHaveStyle({ left: `${leftOffset}px` });
	});

	it("column=1, totalColumns=2 のとき、右半分に配置される", () => {
		const position = createPosition({ column: 1, totalColumns: 2 });
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		const block = screen.getByTestId("timed-event-block");
		const availableWidth = containerWidth - leftOffset; // 252
		const expectedWidth = availableWidth / 2; // 126
		const expectedLeft = leftOffset + expectedWidth; // 48 + 126 = 174
		expect(block).toHaveStyle({ width: `${expectedWidth}px` });
		expect(block).toHaveStyle({ left: `${expectedLeft}px` });
	});

	it("イベントの色が背景色として適用される", () => {
		const position = createPosition({
			event: {
				id: "1",
				title: "会議",
				startDate: "2026-01-01",
				endDate: "2026-01-01",
				color: "#50C878",
				type: "timed",
				time: { start: "10:00", end: "11:00" },
			},
		});
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		const block = screen.getByTestId("timed-event-block");
		expect(block).toHaveStyle({ backgroundColor: "#50C878" });
	});

	it("イベントタイトルが表示される", () => {
		const position = createPosition({
			event: {
				id: "1",
				title: "重要な会議",
				startDate: "2026-01-01",
				endDate: "2026-01-01",
				color: "#4A90D9",
				type: "timed",
				time: { start: "10:00", end: "11:00" },
			},
		});
		render(
			<TimedEventBlock
				position={position}
				slotHeight={slotHeight}
				containerWidth={containerWidth}
				leftOffset={leftOffset}
			/>,
		);
		expect(screen.getByText("重要な会議")).toBeInTheDocument();
	});
});
