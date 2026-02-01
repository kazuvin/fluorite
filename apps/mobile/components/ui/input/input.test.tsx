import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./input";

describe("Input", () => {
	describe("基本レンダリング", () => {
		it("TextInput をレンダリングする", () => {
			render(<Input />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});

		it("placeholder を表示する", () => {
			render(<Input placeholder="メールアドレス" />);
			expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
		});

		it("value を表示する", () => {
			render(<Input value="test@example.com" onChangeText={vi.fn()} />);
			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
		});

		it("onChangeText が呼ばれる", () => {
			const onChangeText = vi.fn();
			render(<Input onChangeText={onChangeText} />);
			fireEvent.change(screen.getByRole("textbox"), {
				target: { value: "hello" },
			});
			expect(onChangeText).toHaveBeenCalled();
		});
	});

	describe("disabled 状態", () => {
		it("editable=false のとき入力を受け付けない", () => {
			render(<Input editable={false} />);
			expect(screen.getByRole("textbox")).toHaveAttribute("aria-disabled", "true");
		});
	});

	describe("secureTextEntry", () => {
		it("secureTextEntry を設定できる", () => {
			render(<Input secureTextEntry />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});
	});

	describe("multiline", () => {
		it("multiline を設定できる", () => {
			render(<Input multiline />);
			expect(screen.getByRole("textbox")).toBeInTheDocument();
		});
	});
});
