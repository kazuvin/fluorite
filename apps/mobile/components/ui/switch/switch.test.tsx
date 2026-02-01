import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

describe("Switch", () => {
	describe("基本レンダリング", () => {
		it("Switch をレンダリングする", () => {
			render(<Switch value={false} onValueChange={vi.fn()} testID="my-switch" />);
			expect(screen.getByTestId("my-switch")).toBeInTheDocument();
		});
	});

	describe("label 表示", () => {
		it("label を表示する", () => {
			render(<Switch value={false} onValueChange={vi.fn()} label="通知を有効にする" />);
			expect(screen.getByText("通知を有効にする")).toBeInTheDocument();
		});

		it("label なしの場合は Text が表示されない", () => {
			const { container } = render(
				<Switch value={false} onValueChange={vi.fn()} testID="no-label" />,
			);
			expect(screen.queryByText(/.+/)).toBeNull();
		});
	});

	describe("value の制御", () => {
		it("value=true のとき Switch に value が渡される", () => {
			render(<Switch value={true} onValueChange={vi.fn()} testID="on-switch" />);
			const switchEl = screen.getByRole("switch");
			expect(switchEl).toBeChecked();
		});
	});

	describe("onValueChange", () => {
		it("タップすると onValueChange が呼ばれる", () => {
			const onValueChange = vi.fn();
			render(<Switch value={false} onValueChange={onValueChange} />);
			const switchEl = screen.getByRole("switch");
			fireEvent.click(switchEl);
			expect(onValueChange).toHaveBeenCalled();
		});
	});

	describe("disabled 状態", () => {
		it("disabled のとき aria-disabled が true になる", () => {
			render(<Switch value={false} onValueChange={vi.fn()} disabled={true} />);
			const switchEl = screen.getByRole("switch");
			expect(switchEl).toBeDisabled();
		});
	});
});
