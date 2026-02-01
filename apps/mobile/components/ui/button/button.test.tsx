import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import { ButtonText } from "./button-text";

describe("Button", () => {
	describe("基本レンダリング", () => {
		it("children を表示する", () => {
			render(
				<Button onPress={vi.fn()}>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByText("保存")).toBeInTheDocument();
		});

		it("onPress が呼ばれる", () => {
			const onPress = vi.fn();
			render(
				<Button onPress={onPress}>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			fireEvent.click(screen.getByRole("button"));
			expect(onPress).toHaveBeenCalledTimes(1);
		});

		it("accessibilityRole が button に設定されている", () => {
			render(
				<Button onPress={vi.fn()}>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByRole("button")).toBeInTheDocument();
		});
	});

	describe("disabled 状態", () => {
		it("disabled=true のとき onPress が呼ばれない", () => {
			const onPress = vi.fn();
			render(
				<Button onPress={onPress} disabled>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			fireEvent.click(screen.getByRole("button"));
			expect(onPress).not.toHaveBeenCalled();
		});

		it("disabled=true のとき aria-disabled が設定される", () => {
			render(
				<Button onPress={vi.fn()} disabled>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
		});
	});

	describe("loading 状態", () => {
		it("loading=true のとき ActivityIndicator を表示する", () => {
			render(
				<Button onPress={vi.fn()} loading>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByTestId("button-loading")).toBeInTheDocument();
		});

		it("loading=true のとき children を非表示にする", () => {
			render(
				<Button onPress={vi.fn()} loading>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.queryByText("保存")).toBeNull();
		});

		it("loading=true のとき onPress が呼ばれない", () => {
			const onPress = vi.fn();
			render(
				<Button onPress={onPress} loading>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			fireEvent.click(screen.getByRole("button"));
			expect(onPress).not.toHaveBeenCalled();
		});
	});

	describe("icon を含む children", () => {
		it("アイコンとテキストを自由にレイアウトできる", () => {
			render(
				<Button onPress={vi.fn()}>
					<span data-testid="icon-left">★</span>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByTestId("icon-left")).toBeInTheDocument();
			expect(screen.getByText("保存")).toBeInTheDocument();
		});

		it("loading=true のとき children 全体が非表示になる", () => {
			render(
				<Button onPress={vi.fn()} loading>
					<span data-testid="icon-left">★</span>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.queryByTestId("icon-left")).toBeNull();
			expect(screen.queryByText("保存")).toBeNull();
		});
	});

	describe("variant", () => {
		it.each(["primary", "secondary", "outline", "ghost"] as const)(
			"variant=%s をエラーなくレンダリングできる",
			(variant) => {
				render(
					<Button onPress={vi.fn()} variant={variant}>
						<ButtonText>保存</ButtonText>
					</Button>,
				);
				expect(screen.getByRole("button")).toBeInTheDocument();
			},
		);
	});

	describe("size", () => {
		it.each(["sm", "md", "lg"] as const)("size=%s をエラーなくレンダリングできる", (size) => {
			render(
				<Button onPress={vi.fn()} size={size}>
					<ButtonText>保存</ButtonText>
				</Button>,
			);
			expect(screen.getByRole("button")).toBeInTheDocument();
		});
	});
});
