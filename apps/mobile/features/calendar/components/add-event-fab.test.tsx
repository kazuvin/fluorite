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
});
