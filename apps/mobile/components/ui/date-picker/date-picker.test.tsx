import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../icon-symbol", () => ({
	IconSymbol: ({ name, ...props }: { name: string }) => (
		<span data-testid={`icon-${name}`} {...props} />
	),
}));

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
	describe("基本レンダリング", () => {
		it("トリガーをレンダリングする", () => {
			render(<DatePicker onValueChange={vi.fn()} />);
			expect(screen.getByTestId("date-picker-trigger")).toBeInTheDocument();
		});

		it("カスタム testID でトリガーをレンダリングする", () => {
			render(<DatePicker onValueChange={vi.fn()} testID="custom-picker" />);
			expect(screen.getByTestId("custom-picker")).toBeInTheDocument();
		});
	});

	describe("placeholder", () => {
		it("value がないとき placeholder を表示する", () => {
			render(<DatePicker onValueChange={vi.fn()} placeholder="日付を選択" />);
			expect(screen.getByText("日付を選択")).toBeInTheDocument();
		});
	});

	describe("選択された日付の表示", () => {
		it("選択された日付を日本語フォーマットで表示する", () => {
			render(<DatePicker value="2026-02-01" onValueChange={vi.fn()} />);
			expect(screen.getByText("2026年2月1日")).toBeInTheDocument();
		});
	});

	describe("カレンダーの開閉", () => {
		it("タップするとカレンダーが表示される", () => {
			render(<DatePicker onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			expect(screen.getByTestId("date-picker-calendar")).toBeInTheDocument();
		});
	});

	describe("曜日ヘッダー", () => {
		it("曜日ヘッダーが表示される", () => {
			render(<DatePicker onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			expect(screen.getByText("日")).toBeInTheDocument();
		});
	});

	describe("日付の選択", () => {
		it("日付をタップすると onValueChange が YYYY-MM-DD 形式で呼ばれる", () => {
			const onValueChange = vi.fn();
			render(<DatePicker value="2026-02-01" onValueChange={onValueChange} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			// 2026年2月のカレンダーで15日をタップ
			fireEvent.click(screen.getByText("15"));
			expect(onValueChange).toHaveBeenCalledWith("2026-02-15");
		});

		it("選択後にカレンダーが閉じる", () => {
			render(<DatePicker value="2026-02-01" onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			expect(screen.getByTestId("date-picker-calendar")).toBeInTheDocument();
			fireEvent.click(screen.getByText("15"));
			expect(screen.queryByTestId("date-picker-calendar")).not.toBeInTheDocument();
		});
	});

	describe("月の遷移", () => {
		it("右矢印をクリックで翌月に遷移する", () => {
			render(<DatePicker value="2026-02-01" onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			expect(screen.getByTestId("date-picker-header-label")).toHaveTextContent("2026年2月");
			fireEvent.click(screen.getByTestId("icon-chevron.right"));
			expect(screen.getByTestId("date-picker-header-label")).toHaveTextContent("2026年3月");
		});

		it("左矢印をクリックで前月に遷移する", () => {
			render(<DatePicker value="2026-02-01" onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("date-picker-trigger"));
			expect(screen.getByTestId("date-picker-header-label")).toHaveTextContent("2026年2月");
			fireEvent.click(screen.getByTestId("icon-chevron.left"));
			expect(screen.getByTestId("date-picker-header-label")).toHaveTextContent("2026年1月");
		});
	});
});
