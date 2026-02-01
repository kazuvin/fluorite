import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextArea } from "./text-area";

describe("TextArea", () => {
	describe("基本レンダリング", () => {
		it("TextArea をレンダリングする", () => {
			render(<TextArea />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});

		it("placeholder を表示する", () => {
			render(<TextArea placeholder="メモを入力" />);
			expect(screen.getByPlaceholderText("メモを入力")).toBeInTheDocument();
		});

		it("onChangeText が呼ばれる", () => {
			const onChangeText = vi.fn();
			render(<TextArea onChangeText={onChangeText} />);
			fireEvent.change(screen.getByRole("textbox"), {
				target: { value: "hello" },
			});
			expect(onChangeText).toHaveBeenCalled();
		});
	});

	describe("disabled 状態", () => {
		it("editable=false のとき aria-disabled が true になる", () => {
			render(<TextArea editable={false} />);
			expect(screen.getByRole("textbox")).toHaveAttribute("aria-disabled", "true");
		});
	});
});
