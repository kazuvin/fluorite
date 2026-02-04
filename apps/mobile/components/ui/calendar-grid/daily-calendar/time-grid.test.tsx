import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimeGrid } from "./time-grid";

describe("TimeGrid", () => {
	it("24時間分の時間ラベルが表示される", () => {
		render(<TimeGrid textColor="#000" hourHeight={60} />);
		// 0時から23時までの時間ラベルが表示される
		expect(screen.getByText("0:00")).toBeInTheDocument();
		expect(screen.getByText("12:00")).toBeInTheDocument();
		expect(screen.getByText("23:00")).toBeInTheDocument();
	});

	it("24本の時間区切り線が表示される", () => {
		render(<TimeGrid textColor="#000" hourHeight={60} />);
		const lines = screen.getAllByTestId(/^hour-line-/);
		expect(lines).toHaveLength(24);
	});

	it("コンテナの高さが 24時間 * hourHeight になる", () => {
		render(<TimeGrid textColor="#000" hourHeight={60} />);
		const container = screen.getByTestId("time-grid");
		expect(container).toHaveStyle({ height: "1440px" }); // 24 * 60
	});

	it("hourHeight=80 のとき、コンテナの高さが 1920px になる", () => {
		render(<TimeGrid textColor="#000" hourHeight={80} />);
		const container = screen.getByTestId("time-grid");
		expect(container).toHaveStyle({ height: "1920px" }); // 24 * 80
	});

	it("時間ラベルが指定されたテキスト色で表示される", () => {
		render(<TimeGrid textColor="#FF0000" hourHeight={60} />);
		const label = screen.getByText("0:00");
		expect(label).toHaveStyle({ color: "#FF0000" });
	});
});
