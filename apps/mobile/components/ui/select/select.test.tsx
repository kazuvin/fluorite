import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";
import type { SelectOption } from "./select";

vi.mock("../icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const options: SelectOption[] = [
	{ label: "りんご", value: "apple" },
	{ label: "みかん", value: "orange", color: "#FFA500" },
	{ label: "ぶどう", value: "grape", color: "#800080" },
];

describe("Select", () => {
	describe("基本レンダリング", () => {
		it("トリガーをレンダリングする", () => {
			render(<Select options={options} onValueChange={vi.fn()} />);
			expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
		});

		it("testID を指定できる", () => {
			render(<Select options={options} onValueChange={vi.fn()} testID="my-select" />);
			expect(screen.getByTestId("my-select")).toBeInTheDocument();
		});

		it("chevron.down アイコンを表示する", () => {
			render(<Select options={options} onValueChange={vi.fn()} />);
			expect(screen.getByTestId("icon-chevron.down")).toBeInTheDocument();
		});
	});

	describe("placeholder", () => {
		it("value 未選択時に placeholder を表示する", () => {
			render(<Select options={options} onValueChange={vi.fn()} placeholder="選択してください" />);
			expect(screen.getByText("選択してください")).toBeInTheDocument();
		});
	});

	describe("選択された値", () => {
		it("選択された値のラベルを表示する", () => {
			render(<Select options={options} value="apple" onValueChange={vi.fn()} />);
			expect(screen.getByText("りんご")).toBeInTheDocument();
		});
	});

	describe("オプション展開", () => {
		it("タップするとオプションが表示される", () => {
			render(<Select options={options} onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("select-trigger"));
			expect(screen.getByTestId("select-options")).toBeInTheDocument();
			expect(screen.getByText("りんご")).toBeInTheDocument();
			expect(screen.getByText("みかん")).toBeInTheDocument();
			expect(screen.getByText("ぶどう")).toBeInTheDocument();
		});

		it("オプションをタップすると onValueChange が呼ばれる", () => {
			const onValueChange = vi.fn();
			render(<Select options={options} onValueChange={onValueChange} />);
			fireEvent.click(screen.getByTestId("select-trigger"));
			fireEvent.click(screen.getByText("みかん"));
			expect(onValueChange).toHaveBeenCalledWith("orange");
		});

		it("選択後にドロップダウンが閉じる", () => {
			render(<Select options={options} onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("select-trigger"));
			expect(screen.getByTestId("select-options")).toBeInTheDocument();
			fireEvent.click(screen.getByText("りんご"));
			expect(screen.queryByTestId("select-options")).not.toBeInTheDocument();
		});
	});

	describe("カラードット", () => {
		it("color がある場合にカラードットが表示される", () => {
			render(<Select options={options} onValueChange={vi.fn()} />);
			fireEvent.click(screen.getByTestId("select-trigger"));
			expect(screen.getByTestId("color-dot-orange")).toBeInTheDocument();
			expect(screen.getByTestId("color-dot-grape")).toBeInTheDocument();
			expect(screen.queryByTestId("color-dot-apple")).not.toBeInTheDocument();
		});
	});

	describe("disabled 状態", () => {
		it("disabled のとき開かない", () => {
			render(<Select options={options} onValueChange={vi.fn()} disabled />);
			fireEvent.click(screen.getByTestId("select-trigger"));
			expect(screen.queryByTestId("select-options")).not.toBeInTheDocument();
		});
	});
});
