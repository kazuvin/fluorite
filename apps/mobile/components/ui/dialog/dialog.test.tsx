import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import {
	Dialog,
	DialogActions,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./dialog";

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

	describe("DialogHeader", () => {
		it("DialogHeader が表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogHeader>
						<DialogTitle>タイトル</DialogTitle>
						<DialogClose />
					</DialogHeader>
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
		});

		it("DialogTitle と DialogClose が横並びで配置される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogHeader>
						<DialogTitle>タイトル</DialogTitle>
						<DialogClose />
					</DialogHeader>
				</Dialog>,
			);
			const header = screen.getByTestId("dialog-header");
			expect(header).toHaveStyle({ flexDirection: "row" });
			expect(header).toHaveStyle({ justifyContent: "space-between" });
			expect(header).toHaveStyle({ alignItems: "center" });
		});
	});

	describe("DialogContent", () => {
		it("DialogContent が表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogContent>
						<DialogDescription>本文</DialogDescription>
					</DialogContent>
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
		});

		it("子要素を表示できる", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogContent>
						<span>カスタムコンテンツ</span>
					</DialogContent>
				</Dialog>,
			);
			expect(screen.getByText("カスタムコンテンツ")).toBeInTheDocument();
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

	describe("KeyboardAvoidingView", () => {
		it("キーボード回避用のコンテナが存在する", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-keyboard-avoiding")).toBeInTheDocument();
		});
	});

	describe("スワイプで閉じる", () => {
		it("swipeToDismiss=true のときドラッグハンドルが表示される", () => {
			render(
				<Dialog visible onClose={vi.fn()} swipeToDismiss>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.getByTestId("dialog-drag-handle")).toBeInTheDocument();
		});

		it("swipeToDismiss=false のときドラッグハンドルが表示されない", () => {
			render(
				<Dialog visible onClose={vi.fn()} swipeToDismiss={false}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.queryByTestId("dialog-drag-handle")).toBeNull();
		});

		it("デフォルトではドラッグハンドルが表示されない", () => {
			render(
				<Dialog visible onClose={vi.fn()}>
					<DialogTitle>テスト</DialogTitle>
				</Dialog>,
			);
			expect(screen.queryByTestId("dialog-drag-handle")).toBeNull();
		});
	});
});
