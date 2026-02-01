import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../components/ui/icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import { AddEventFab } from "./add-event-fab";

describe("AddEventFab", () => {
	describe("基本レンダリング", () => {
		it("FAB ボタンが表示される", () => {
			render(<AddEventFab />);
			expect(screen.getByTestId("add-event-fab")).toBeInTheDocument();
		});

		it("accessibilityRole が button に設定されている", () => {
			render(<AddEventFab />);
			expect(screen.getByRole("button")).toBeInTheDocument();
		});
	});

	describe("Dialog の開閉", () => {
		it("初期状態では Dialog が表示されない", () => {
			render(<AddEventFab />);
			expect(screen.queryByTestId("dialog-card")).toBeNull();
		});

		it("FAB を押すと Dialog が表示される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
		});

		it("Dialog にタイトルが表示される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByText("予定を追加")).toBeInTheDocument();
		});

		it("DialogHeader 内に DialogTitle と DialogClose が配置される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			const header = screen.getByTestId("dialog-header");
			expect(header).toBeInTheDocument();
			expect(screen.getByText("予定を追加")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
		});

		it("DialogContent が表示される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
		});

		it("オーバーレイを押すと Dialog が閉じる", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
			fireEvent.click(screen.getByTestId("dialog-overlay"));
			expect(screen.queryByTestId("dialog-card")).toBeNull();
		});

		it("閉じるボタンを押すと Dialog が閉じる", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
			fireEvent.click(screen.getByTestId("dialog-close"));
			expect(screen.queryByTestId("dialog-card")).toBeNull();
		});
	});

	describe("追加ボタン", () => {
		it("Dialog 内に追加ボタンが表示される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
		});
	});

	describe("タイトル入力", () => {
		it("Dialog 内にタイトル入力欄が表示される", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByPlaceholderText("タイトル")).toBeInTheDocument();
		});

		it("タイトルを入力できる", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			const input = screen.getByPlaceholderText("タイトル");
			fireEvent.change(input, { target: { value: "チームミーティング" } });
			expect(screen.getByDisplayValue("チームミーティング")).toBeInTheDocument();
		});

		it("Dialog を閉じて再度開くとタイトルがリセットされる", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			const input = screen.getByPlaceholderText("タイトル");
			fireEvent.change(input, { target: { value: "チームミーティング" } });
			fireEvent.click(screen.getByTestId("dialog-close"));
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByPlaceholderText("タイトル")).toBeInTheDocument();
			expect(screen.queryByDisplayValue("チームミーティング")).toBeNull();
		});
	});
});
