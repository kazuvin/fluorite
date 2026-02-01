import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TimePicker } from "./time-picker";

describe("TimePicker", () => {
	describe("基本レンダリング", () => {
		it("トリガーをレンダリングする", () => {
			render(<TimePicker onValueChange={vi.fn()} />);
			expect(screen.getByTestId("time-picker-trigger")).toBeInTheDocument();
		});

		it("testID を指定できる", () => {
			render(<TimePicker onValueChange={vi.fn()} testID="custom-picker" />);
			expect(screen.getByTestId("custom-picker")).toBeInTheDocument();
		});
	});

	describe("placeholder 表示", () => {
		it("value がないとき placeholder を表示する", () => {
			render(<TimePicker onValueChange={vi.fn()} placeholder="時刻を選択" />);
			expect(screen.getByText("時刻を選択")).toBeInTheDocument();
		});
	});

	describe("選択された時刻の表示", () => {
		it("value があるとき選択された時刻を表示する", () => {
			render(<TimePicker onValueChange={vi.fn()} value="09:30" />);
			expect(screen.getByText("09:30")).toBeInTheDocument();
		});
	});

	describe("ピッカーの展開", () => {
		it("タップするとピッカーが表示される", () => {
			render(<TimePicker onValueChange={vi.fn()} />);
			expect(screen.queryByTestId("time-picker-panel")).toBeNull();
			fireEvent.click(screen.getByTestId("time-picker-trigger"));
			expect(screen.getByTestId("time-picker-panel")).toBeInTheDocument();
		});

		it("時と分のヘッダーが表示される", () => {
			render(<TimePicker onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("time-picker-trigger"));
			expect(screen.getByText("時")).toBeInTheDocument();
			expect(screen.getByText("分")).toBeInTheDocument();
		});
	});

	describe("選択ロジック", () => {
		it("時をタップすると選択状態になる（まだ閉じない）", () => {
			render(<TimePicker onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("time-picker-trigger"));
			fireEvent.click(screen.getByTestId("hour-09"));
			// パネルはまだ表示されている
			expect(screen.getByTestId("time-picker-panel")).toBeInTheDocument();
		});

		it("時と分の両方を選択すると onValueChange が HH:MM 形式で呼ばれる", () => {
			const onValueChange = vi.fn();
			render(<TimePicker onValueChange={onValueChange} />);
			fireEvent.click(screen.getByTestId("time-picker-trigger"));
			fireEvent.click(screen.getByTestId("hour-09"));
			fireEvent.click(screen.getByTestId("minute-30"));
			expect(onValueChange).toHaveBeenCalledWith("09:30");
		});

		it("選択完了後にピッカーが閉じる", () => {
			render(<TimePicker onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("time-picker-trigger"));
			fireEvent.click(screen.getByTestId("hour-09"));
			fireEvent.click(screen.getByTestId("minute-30"));
			expect(screen.queryByTestId("time-picker-panel")).toBeNull();
		});
	});
});
