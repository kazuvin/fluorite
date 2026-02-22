import { CategoryRegistry } from "@fluorite/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { atom } from "jotai";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../vault/stores/vault-atoms", () => ({
	vaultNotesValueAtom: atom([]),
	vaultCategoryRegistryValueAtom: atom(new CategoryRegistry()),
	addNoteToVaultAtom: atom(null, async () => {}),
}));

import { resetFormAtom } from "../stores/add-event-form-atoms";

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

import { AddEvent } from "./add-event";

describe("AddEvent", () => {
	let store: ReturnType<typeof createStore>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 1, 2)); // 2026-02-02
		store = createStore();
		store.set(resetFormAtom);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function wrapper({ children }: { children: ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	function renderWithProvider(ui: React.ReactElement) {
		return render(ui, { wrapper });
	}

	const openDialog = () => {
		renderWithProvider(<AddEvent />);
		fireEvent.click(screen.getByTestId("add-event-fab"));
	};

	describe("基本レンダリング", () => {
		it("FAB ボタンが表示される", () => {
			renderWithProvider(<AddEvent />);
			expect(screen.getByTestId("add-event-fab")).toBeInTheDocument();
		});

		it("accessibilityRole が button に設定されている", () => {
			renderWithProvider(<AddEvent />);
			expect(screen.getByRole("button")).toBeInTheDocument();
		});
	});

	describe("Dialog の開閉", () => {
		it("初期状態では Dialog が表示されない", () => {
			renderWithProvider(<AddEvent />);
			expect(screen.queryByTestId("dialog-card")).toBeNull();
		});

		it("FAB を押すと Dialog が表示される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
		});

		it("Dialog にタイトルが表示される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByText("予定を追加")).toBeInTheDocument();
		});

		it("DialogHeader 内に DialogTitle と DialogClose が配置される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			const header = screen.getByTestId("dialog-header");
			expect(header).toBeInTheDocument();
			expect(screen.getByText("予定を追加")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
		});

		it("DialogContent が表示される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
		});

		it("オーバーレイを押しても Dialog は閉じない", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
			fireEvent.click(screen.getByTestId("dialog-overlay"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
		});

		it("閉じるボタンを押すと Dialog が閉じる", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByTestId("dialog-card")).toBeInTheDocument();
			fireEvent.click(screen.getByTestId("dialog-close"));
			expect(screen.queryByTestId("dialog-card")).toBeNull();
		});
	});

	describe("追加ボタン", () => {
		it("Dialog 内に追加ボタンが表示される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByText("追加する")).toBeInTheDocument();
		});
	});

	describe("タイトル入力", () => {
		it("Dialog 内にタイトル入力欄が表示される", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			expect(screen.getByPlaceholderText("タイトル")).toBeInTheDocument();
		});

		it("タイトルを入力できる", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));
			const input = screen.getByPlaceholderText("タイトル");
			fireEvent.change(input, { target: { value: "チームミーティング" } });
			expect(screen.getByDisplayValue("チームミーティング")).toBeInTheDocument();
		});

		it("Dialog を閉じて再度開くとタイトルがリセットされる", () => {
			renderWithProvider(<AddEvent />);
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
			it("開始日トリガーにデフォルトで今日の日付が表示される", () => {
				openDialog();
				expect(screen.getByTestId("date-trigger-start")).toBeInTheDocument();
				expect(screen.getByText("2026年2月2日")).toBeInTheDocument();
			});

			it("終了日トリガーが表示される", () => {
				openDialog();
				expect(screen.getByTestId("date-trigger-end")).toBeInTheDocument();
				expect(screen.getByText("終了日")).toBeInTheDocument();
			});

			it("開始日行と終了日行がそれぞれ表示される", () => {
				openDialog();
				const startRow = screen.getByTestId("date-row-start");
				const endRow = screen.getByTestId("date-row-end");
				expect(startRow).toContainElement(screen.getByTestId("date-trigger-start"));
				expect(endRow).toContainElement(screen.getByTestId("date-trigger-end"));
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

		describe("時刻表示", () => {
			it("終日がONの時、時刻ピッカーが表示されない", () => {
				openDialog();
				expect(screen.queryByTestId("time-picker-start")).toBeNull();
				expect(screen.queryByTestId("time-picker-end")).toBeNull();
			});

			it("終日をOFFにすると開始時刻・終了時刻ピッカーが表示される", () => {
				openDialog();
				const switchControl = screen.getByRole("checkbox");
				fireEvent.click(switchControl);
				expect(screen.getByTestId("time-picker-start")).toBeInTheDocument();
				expect(screen.getByTestId("time-picker-end")).toBeInTheDocument();
			});

			it("終日をOFFからONに戻すと時刻ピッカーが非表示になる", () => {
				openDialog();
				const switchControl = screen.getByRole("checkbox");
				// OFF にする
				fireEvent.click(switchControl);
				expect(screen.getByTestId("time-picker-start")).toBeInTheDocument();
				// ON に戻す
				fireEvent.click(switchControl);
				expect(screen.queryByTestId("time-picker-start")).toBeNull();
				expect(screen.queryByTestId("time-picker-end")).toBeNull();
			});
		});
	});

	describe("フォームリセット", () => {
		it("Dialog を閉じて再度開くと全フィールドがリセットされる", () => {
			renderWithProvider(<AddEvent />);
			fireEvent.click(screen.getByTestId("add-event-fab"));

			// タイトルに値を入力
			fireEvent.change(screen.getByPlaceholderText("タイトル"), {
				target: { value: "テスト予定" },
			});

			// ダイアログを閉じて再度開く
			fireEvent.click(screen.getByTestId("dialog-close"));
			fireEvent.click(screen.getByTestId("add-event-fab"));

			// フィールドがリセットされている
			expect(screen.queryByDisplayValue("テスト予定")).toBeNull();
		});
	});

	describe("日付選択モード", () => {
		describe("モード遷移", () => {
			it("日付トリガーをタップするとヘッダーが「開始日・終了日」に変わる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const header = screen.getByTestId("dialog-header");
				expect(header).toHaveTextContent("開始日・終了日");
				expect(screen.queryByText("予定を追加")).toBeNull();
			});

			it("日付トリガーをタップすると戻るアイコンが表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				expect(screen.getByTestId("date-picker-back")).toBeInTheDocument();
			});

			it("日付トリガーをタップするとタイトル入力・終日スイッチ・追加ボタンが非表示になる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				expect(screen.queryByPlaceholderText("タイトル")).toBeNull();
				expect(screen.queryByText("終日")).toBeNull();
				expect(screen.queryByText("追加する")).toBeNull();
			});

			it("日付トリガーをタップしても両方のトリガーは表示されたままになる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				expect(screen.getByTestId("date-trigger-start")).toBeInTheDocument();
				expect(screen.getByTestId("date-trigger-end")).toBeInTheDocument();
			});

			it("日付トリガーをタップするとカレンダーが表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				expect(screen.getByTestId("inline-calendar")).toBeInTheDocument();
			});

			it("日付トリガーをタップしても決定ボタンは表示されない", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				expect(screen.queryByText("決定")).toBeNull();
			});

			it("戻るアイコンをタップすると通常モードに戻る", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				fireEvent.click(screen.getByTestId("date-picker-back"));
				expect(screen.getByText("予定を追加")).toBeInTheDocument();
				expect(screen.getByPlaceholderText("タイトル")).toBeInTheDocument();
				expect(screen.queryByTestId("inline-calendar")).toBeNull();
			});

			it("日付を選択してもフォーカスは自動で切り替わらない", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				// 開始日を選択
				fireEvent.click(dayCells[10]);
				// フォーカスは開始日のまま
				const startTrigger = screen.getByTestId("date-trigger-start");
				expect(startTrigger).toHaveStyle({
					borderColor: expect.not.stringContaining("transparent"),
				});
			});
		});

		describe("即時反映", () => {
			it("日付を選択して戻ると選択した日付がトリガーに反映されている", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				// 開始日を変更
				fireEvent.click(dayCells[10]);
				// 終了日トリガーに切替して終了日を選択
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const dayCells2 = screen.getAllByTestId(/calendar-day/);
				fireEvent.click(dayCells2[15]);
				// 戻る
				fireEvent.click(screen.getByTestId("date-picker-back"));
				// 通常モードに戻り、日付が反映されている
				expect(screen.getByText("予定を追加")).toBeInTheDocument();
				expect(screen.queryByTestId("inline-calendar")).toBeNull();
				// 開始日・終了日トリガーが「開始日」「終了日」プレースホルダーではなく日付を表示
				expect(screen.queryByText("開始日")).toBeNull();
				expect(screen.queryByText("終了日")).toBeNull();
			});
		});

		describe("範囲選択表示", () => {
			it("開始日を選択するとそのセルがrange-startとして表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[10]);
				expect(screen.getByTestId("calendar-day-range-start")).toBeInTheDocument();
			});

			it("開始日と終了日を選択すると範囲内のセルがin-rangeとして表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[10]);
				// 終了日トリガーに切替して終了日を選択
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const dayCells2 = screen.getAllByTestId(/calendar-day/);
				fireEvent.click(dayCells2[15]);
				// 範囲内のセルが存在する
				const inRangeCells = screen.getAllByTestId("calendar-day-in-range");
				expect(inRangeCells.length).toBeGreaterThan(0);
			});

			it("終了日セルがrange-endとして表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[10]);
				// 終了日トリガーに切替して終了日を選択
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const dayCells2 = screen.getAllByTestId(/calendar-day/);
				fireEvent.click(dayCells2[15]);
				expect(screen.getByTestId("calendar-day-range-end")).toBeInTheDocument();
			});

			it("開始日と終了日が同じ場合はrange-startのみ表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[10]);
				// 終了日トリガーに切替して同じセルを選択
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const rangeStart = screen.getByTestId("calendar-day-range-start");
				fireEvent.click(rangeStart);
				expect(screen.queryAllByTestId("calendar-day-in-range")).toHaveLength(0);
			});
		});

		describe("日付自動スワップ", () => {
			it("終了日として開始日より前の日付を選択すると自動で開始日・終了日がスワップされる", () => {
				openDialog();
				// 開始日を後ろの日付に設定（index 15）
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[15]);
				// 終了日トリガーに切替して、開始日より前の日付を選択（index 10）
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const dayCells2 = screen.getAllByTestId(/calendar-day/);
				fireEvent.click(dayCells2[10]);
				// スワップされて range-start が前の日付、range-end が後ろの日付になる
				expect(screen.getByTestId("calendar-day-range-start")).toBeInTheDocument();
				expect(screen.getByTestId("calendar-day-range-end")).toBeInTheDocument();
				const inRangeCells = screen.getAllByTestId("calendar-day-in-range");
				expect(inRangeCells.length).toBeGreaterThan(0);
			});
		});

		describe("トリガー切替", () => {
			it("開始日編集中に終了日トリガーをタップすると終了日編集に切り替わる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				// 終了日に切替
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				// カレンダーモードのまま
				expect(screen.getByTestId("inline-calendar")).toBeInTheDocument();
			});

			it("終了日編集中に開始日トリガーをタップすると開始日編集に切り替わる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				// 開始日に切替
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				// カレンダーモードのまま
				expect(screen.getByTestId("inline-calendar")).toBeInTheDocument();
			});
		});

		describe("終了日からの開始", () => {
			it("終了日トリガーからでもヘッダーが「開始日・終了日」になる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const header = screen.getByTestId("dialog-header");
				expect(header).toHaveTextContent("開始日・終了日");
			});

			it("終了日から日付を選択して戻ると通常モードに戻る", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-end"));
				const dayCells = screen.getAllByTestId("calendar-day");
				fireEvent.click(dayCells[10]);
				fireEvent.click(screen.getByTestId("date-picker-back"));
				expect(screen.getByText("予定を追加")).toBeInTheDocument();
				expect(screen.queryByTestId("inline-calendar")).toBeNull();
			});
		});

		describe("日付選択モードからの復帰", () => {
			it("日付選択モード中に閉じるボタンで閉じて再度開くと通常モードで表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				// 戻るで通常モードに戻ってから閉じる
				fireEvent.click(screen.getByTestId("date-picker-back"));
				fireEvent.click(screen.getByTestId("dialog-close"));
				fireEvent.click(screen.getByTestId("add-event-fab"));
				expect(screen.getByText("予定を追加")).toBeInTheDocument();
				expect(screen.queryByTestId("inline-calendar")).toBeNull();
			});
		});

		describe("正方形グリッド", () => {
			it("日付セルがaspectRatio: 1で正方形になる", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				const dayCells = screen.getAllByTestId("calendar-day");
				expect(dayCells[0]).toHaveStyle({ aspectRatio: "1" });
			});
		});

		describe("6行固定グリッド", () => {
			it("カレンダーが常に6行表示される", () => {
				openDialog();
				fireEvent.click(screen.getByTestId("date-trigger-start"));
				// weekRow = 曜日ヘッダー1行 + 日付行
				// calendar-day セルは 7列 × N行
				const dayCells = screen.getAllByTestId(/calendar-day/);
				// 6行 × 7列 = 42セル
				expect(dayCells).toHaveLength(42);
			});
		});
	});
});
