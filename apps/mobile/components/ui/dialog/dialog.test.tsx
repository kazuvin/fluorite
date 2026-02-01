import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import { Dialog, DialogActions, DialogClose, DialogDescription, DialogTitle } from "./dialog";

describe("Dialog", () => {
	describe("表示制御", () => {
		it("visible=true のとき表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.getByText("テスト")).toBeInTheDocument();
		});

		it("visible=false のとき表示されない", () => {
			render(
				<Dialog visible={false} onClose={vi.fn()}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.queryByText("テスト")).toBeNull();
		});
	});

	describe("Compound Components", () => {
		it("DialogTitle を表示できる", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogTitle>タイトル</DialogTitle>
				</Dialog>,
			);
			expect(screen.getByText("タイトル")).toBeInTheDocument();
		});

		it("DialogDescription を表示できる", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogDescription>説明テキスト</DialogDescription>
				</Dialog>,
			);
			expect(screen.getByText("説明テキスト")).toBeInTheDocument();
		});

		it("DialogActions を表示できる", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogActions>
						<button type="button">OK</button>
					</DialogActions>
				</Dialog>,
			);
			expect(screen.getByText("OK")).toBeInTheDocument();
		});
	});

	describe("オーバーレイ操作", () => {
		it("オーバーレイを押すと onClose が呼ばれる", () => {
			const onClose = vi.fn();
			render(
				<Dialog visible onClose={onClose}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			fireEvent.click(screen.getByTestId("dialog-overlay"));
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it("closeOnOverlayPress=false のときオーバーレイを押しても onClose が呼ばれない", () => {
			const onClose = vi.fn();
			render(
				<Dialog visible onClose={onClose} closeOnOverlayPress={false}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			fireEvent.click(screen.getByTestId("dialog-overlay"));
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe("DialogClose", () => {
		it("閉じるボタンが表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogClose />
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
		});

		it("押すと onClose が呼ばれる", () => {
			const onClose = vi.fn();
			render(
				<Dialog visible onClose={onClose}>
					<DialogClose />
				</Dialog>,
			);
			fireEvent.click(screen.getByTestId("dialog-close"));
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it("xmark アイコンが表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogClose />
				</Dialog>,
			);
			expect(screen.getByTestId("icon-xmark")).toBeInTheDocument();
		});

		it("accessibilityRole が button に設定されている", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogClose />
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-close")).toHaveAttribute("role", "button");
		});
	});

	describe("アクセシビリティ", () => {
		it("カードに accessibilityRole が設定されている", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-card")).toHaveAttribute("role", "alert");
		});
	});
});
