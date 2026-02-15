import { colors } from "@fluorite/design-tokens";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrentTimeIndicator } from "./current-time-indicator";

const destructiveColor = colors.light.destructive;

describe("CurrentTimeIndicator", () => {
	it("指定されたスロット位置に基づいて top スタイルが設定される", () => {
		render(<CurrentTimeIndicator slot={120} slotHeight={5} />);
		const indicator = screen.getByTestId("current-time-indicator");
		expect(indicator).toHaveStyle({ top: "600px" }); // 120 * 5 = 600
	});

	it("slotHeight=4 のとき、top が正しく計算される", () => {
		render(<CurrentTimeIndicator slot={60} slotHeight={4} />);
		const indicator = screen.getByTestId("current-time-indicator");
		expect(indicator).toHaveStyle({ top: "240px" }); // 60 * 4 = 240
	});

	it("赤い線としてレンダリングされる", () => {
		render(<CurrentTimeIndicator slot={0} slotHeight={5} />);
		const line = screen.getByTestId("current-time-line");
		expect(line).toHaveStyle({ backgroundColor: destructiveColor });
	});

	it("左側に赤い丸が表示される", () => {
		render(<CurrentTimeIndicator slot={0} slotHeight={5} />);
		const circle = screen.getByTestId("current-time-circle");
		expect(circle).toHaveStyle({ backgroundColor: destructiveColor });
	});
});
