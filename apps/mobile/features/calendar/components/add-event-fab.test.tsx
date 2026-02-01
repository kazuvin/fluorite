import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../components/ui/icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("../../../components/ui/date-picker", () => ({
	DatePicker: ({
		testID,
		placeholder,
		value,
		onValueChange,
	}: {
		testID?: string;
		placeholder?: string;
		value?: string;
		onValueChange: (v: string) => void;
	}) => (
		<input
			data-testid={testID}
			placeholder={placeholder}
			value={value || ""}
			onChange={(e) => onValueChange(e.target.value)}
		/>
	),
}));

vi.mock("../../../components/ui/time-picker", () => ({
	TimePicker: ({
		testID,
		placeholder,
		value,
		onValueChange,
	}: {
		testID?: string;
		placeholder?: string;
		value?: string;
		onValueChange: (v: string) => void;
	}) => (
		<input
			data-testid={testID}
			placeholder={placeholder}
			value={value || ""}
			onChange={(e) => onValueChange(e.target.value)}
		/>
	),
}));

vi.mock("../../../components/ui/switch", () => ({
	Switch: ({
		label,
		value,
		onValueChange,
		testID,
	}: { label?: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string }) => (
		<label>
			{label}
			<input
				data-testid={testID}
				type="checkbox"
				checked={value}
				onChange={(e) => onValueChange(e.target.checked)}
			/>
		</label>
	),
}));

vi.mock("../../../components/ui/select", () => ({
	Select: ({
		testID,
		placeholder,
		value,
		onValueChange,
		options,
	}: {
		testID?: string;
		placeholder?: string;
		value?: string;
		onValueChange: (v: string) => void;
		options?: { label: string; value: string }[];
	}) => (
		<select
			data-testid={testID}
			value={value || ""}
			onChange={(e) => onValueChange(e.target.value)}
		>
			<option value="">{placeholder}</option>
			{options?.map((opt) => (
				<option key={opt.value} value={opt.value}>
					{opt.label}
				</option>
			))}
		</select>
	),
}));

vi.mock("../../../components/ui/text-area", () => ({
	TextArea: ({
		placeholder,
		value,
		onChangeText,
	}: { placeholder?: string; value?: string; onChangeText: (v: string) => void }) => (
		<textarea
			placeholder={placeholder}
			value={value || ""}
			onChange={(e) => onChangeText(e.target.value)}
		/>
	),
}));

import { AddEventFab } from "./add-event-fab";

describe("AddEventFab", () => {
	const openDialog = () => {
		render(<AddEventFab />);
		fireEvent.click(screen.getByTestId("add-event-fab"));
	};

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
			expect(screen.getByText("追加する")).toBeInTheDocument();
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

	describe("フォームフィールド", () => {
		describe("開始日・終了日", () => {
			it("開始日フィールドが表示される", () => {
				openDialog();
				expect(screen.getByTestId("date-picker-start")).toBeInTheDocument();
				expect(screen.getByPlaceholderText("開始日")).toBeInTheDocument();
			});

			it("終了日フィールドが表示される", () => {
				openDialog();
				expect(screen.getByTestId("date-picker-end")).toBeInTheDocument();
				expect(screen.getByPlaceholderText("終了日")).toBeInTheDocument();
			});

			it("開始日と終了日が横並びで表示される", () => {
				openDialog();
				const row = screen.getByTestId("date-row");
				expect(row).toBeInTheDocument();
				expect(row).toContainElement(screen.getByTestId("date-picker-start"));
				expect(row).toContainElement(screen.getByTestId("date-picker-end"));
			});
		});

		describe("終日スイッチ", () => {
			it("終日スイッチが表示される", () => {
				openDialog();
				expect(screen.getByText("終日")).toBeInTheDocument();
			});

			it("デフォルトで終日がONである", () => {
				openDialog();
				const switchControl = screen.getByRole("checkbox");
				expect(switchControl).toBeChecked();
			});
		});
	});

	describe("フォームリセット", () => {
		it("Dialog を閉じて再度開くと全フィールドがリセットされる", () => {
			render(<AddEventFab />);
			fireEvent.click(screen.getByTestId("add-event-fab"));

			// 各フィールドに値を入力
			fireEvent.change(screen.getByPlaceholderText("タイトル"), {
				target: { value: "テスト予定" },
			});
			fireEvent.change(screen.getByTestId("date-picker-start"), {
				target: { value: "2025-01-15" },
			});
			fireEvent.change(screen.getByTestId("date-picker-end"), {
				target: { value: "2025-01-16" },
			});

			// ダイアログを閉じて再度開く
			fireEvent.click(screen.getByTestId("dialog-close"));
			fireEvent.click(screen.getByTestId("add-event-fab"));

			// 全フィールドがリセットされている
			expect(screen.queryByDisplayValue("テスト予定")).toBeNull();
			expect(screen.queryByDisplayValue("2025-01-15")).toBeNull();
			expect(screen.queryByDisplayValue("2025-01-16")).toBeNull();
		});
	});
});
