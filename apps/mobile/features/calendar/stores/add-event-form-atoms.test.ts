import { atom, createStore } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../vault/stores/vault-atoms", () => ({
	vaultNotesValueAtom: atom([]),
	addNoteToVaultAtom: atom(null, async () => {}),
}));
import {
	allDayValueAtom,
	closeFormAtom,
	datePickerTargetValueAtom,
	displayMonthValueAtom,
	displayYearValueAtom,
	endTimeValueAtom,
	endValueAtom,
	enterDatePickerModeAtom,
	exitDatePickerModeAtom,
	gridValueAtom,
	hasRangeValueAtom,
	isDatePickerModeValueAtom,
	nextMonthAtom,
	openFormAtom,
	prevMonthAtom,
	resetFormAtom,
	selectDayAtom,
	setAllDayAtom,
	setEndTimeAtom,
	setStartTimeAtom,
	setTitleAtom,
	startTimeValueAtom,
	startValueAtom,
	switchDatePickerTargetAtom,
	titleValueAtom,
	visibleValueAtom,
} from "./add-event-form-atoms";

describe("add-event-form-atoms", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2025, 0, 15)); // 2025-01-15
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function createResetStore() {
		const store = createStore();
		store.set(resetFormAtom);
		return store;
	}

	describe("初期状態（リセット後）", () => {
		it("visibleValueAtom が false を返す", () => {
			const store = createResetStore();
			expect(store.get(visibleValueAtom)).toBe(false);
		});

		it("titleValueAtom が空文字を返す", () => {
			const store = createResetStore();
			expect(store.get(titleValueAtom)).toBe("");
		});

		it("startValueAtom が今日の日付を返す", () => {
			const store = createResetStore();
			expect(store.get(startValueAtom)).toBe("2025-01-15");
		});

		it("endValueAtom が空文字を返す", () => {
			const store = createResetStore();
			expect(store.get(endValueAtom)).toBe("");
		});

		it("allDayValueAtom が true を返す", () => {
			const store = createResetStore();
			expect(store.get(allDayValueAtom)).toBe(true);
		});

		it("datePickerTargetValueAtom が null を返す", () => {
			const store = createResetStore();
			expect(store.get(datePickerTargetValueAtom)).toBeNull();
		});

		it("displayYearValueAtom が現在の年を返す", () => {
			const store = createResetStore();
			expect(store.get(displayYearValueAtom)).toBe(2025);
		});

		it("displayMonthValueAtom が現在の月を返す", () => {
			const store = createResetStore();
			expect(store.get(displayMonthValueAtom)).toBe(0);
		});

		it("startTimeValueAtom が空文字を返す", () => {
			const store = createResetStore();
			expect(store.get(startTimeValueAtom)).toBe("");
		});

		it("endTimeValueAtom が空文字を返す", () => {
			const store = createResetStore();
			expect(store.get(endTimeValueAtom)).toBe("");
		});
	});

	describe("派生状態", () => {
		it("isDatePickerModeValueAtom: datePickerTarget が null の時 false", () => {
			const store = createResetStore();
			expect(store.get(isDatePickerModeValueAtom)).toBe(false);
		});

		it("isDatePickerModeValueAtom: datePickerTarget が設定されている時 true", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			expect(store.get(isDatePickerModeValueAtom)).toBe(true);
		});

		it("hasRangeValueAtom: end が空の時 false", () => {
			const store = createResetStore();
			expect(store.get(hasRangeValueAtom)).toBe(false);
		});

		it("hasRangeValueAtom: start と end が同じ時 false", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			store.set(selectDayAtom, "2025-01-15"); // start と同じ
			expect(store.get(hasRangeValueAtom)).toBe(false);
		});

		it("hasRangeValueAtom: start と end が異なる時 true", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			store.set(selectDayAtom, "2025-01-20");
			expect(store.get(hasRangeValueAtom)).toBe(true);
		});

		it("gridValueAtom: カレンダーグリッドを生成する", () => {
			const store = createResetStore();
			const grid = store.get(gridValueAtom);
			expect(grid).toHaveLength(6); // パディングされて6行
			expect(grid[0]).toHaveLength(7); // 7日/週
		});
	});

	describe("フォーム開閉", () => {
		it("openFormAtom でフォームを開く", () => {
			const store = createResetStore();
			store.set(openFormAtom);
			expect(store.get(visibleValueAtom)).toBe(true);
		});

		it("closeFormAtom でフォームを閉じてリセットする", () => {
			const store = createResetStore();
			store.set(openFormAtom);
			store.set(setTitleAtom, "テスト");
			store.set(setStartTimeAtom, "09:00");
			store.set(setEndTimeAtom, "17:00");
			store.set(closeFormAtom);

			expect(store.get(visibleValueAtom)).toBe(false);
			expect(store.get(titleValueAtom)).toBe("");
			expect(store.get(startValueAtom)).toBe("2025-01-15");
			expect(store.get(endValueAtom)).toBe("");
			expect(store.get(allDayValueAtom)).toBe(true);
			expect(store.get(datePickerTargetValueAtom)).toBeNull();
			expect(store.get(startTimeValueAtom)).toBe("");
			expect(store.get(endTimeValueAtom)).toBe("");
		});
	});

	describe("フォーム状態更新", () => {
		it("setTitleAtom でタイトルを更新", () => {
			const store = createResetStore();
			store.set(setTitleAtom, "新しい予定");
			expect(store.get(titleValueAtom)).toBe("新しい予定");
		});

		it("setAllDayAtom で終日フラグを更新", () => {
			const store = createResetStore();
			store.set(setAllDayAtom, false);
			expect(store.get(allDayValueAtom)).toBe(false);
		});

		it("setStartTimeAtom で開始時刻を更新", () => {
			const store = createResetStore();
			store.set(setStartTimeAtom, "09:00");
			expect(store.get(startTimeValueAtom)).toBe("09:00");
		});

		it("setEndTimeAtom で終了時刻を更新", () => {
			const store = createResetStore();
			store.set(setEndTimeAtom, "17:00");
			expect(store.get(endTimeValueAtom)).toBe("17:00");
		});
	});

	describe("DatePicker モード", () => {
		it("enterDatePickerModeAtom で start 選択モードに入る", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			expect(store.get(datePickerTargetValueAtom)).toBe("start");
			expect(store.get(isDatePickerModeValueAtom)).toBe(true);
		});

		it("enterDatePickerModeAtom で end 選択モードに入る", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			expect(store.get(datePickerTargetValueAtom)).toBe("end");
		});

		it("enterDatePickerModeAtom: start に値がある時、その年月を表示", () => {
			const store = createResetStore();
			// start は 2025-01-15 で初期化されている
			store.set(enterDatePickerModeAtom, "start");
			expect(store.get(displayYearValueAtom)).toBe(2025);
			expect(store.get(displayMonthValueAtom)).toBe(0); // January
		});

		it("enterDatePickerModeAtom: end に値がない時、現在の年月を表示", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			expect(store.get(displayYearValueAtom)).toBe(2025);
			expect(store.get(displayMonthValueAtom)).toBe(0);
		});

		it("switchDatePickerTargetAtom でターゲットを切り替え", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			store.set(switchDatePickerTargetAtom, "end");
			expect(store.get(datePickerTargetValueAtom)).toBe("end");
		});

		it("exitDatePickerModeAtom で選択モードを終了", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			store.set(exitDatePickerModeAtom);
			expect(store.get(datePickerTargetValueAtom)).toBeNull();
			expect(store.get(isDatePickerModeValueAtom)).toBe(false);
		});
	});

	describe("日付選択", () => {
		it("selectDayAtom: start モードで日付を選択", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			store.set(selectDayAtom, "2025-01-20");
			expect(store.get(startValueAtom)).toBe("2025-01-20");
		});

		it("selectDayAtom: end モードで日付を選択", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			store.set(selectDayAtom, "2025-01-25");
			expect(store.get(endValueAtom)).toBe("2025-01-25");
		});

		it("selectDayAtom: end が start より前の場合、スワップする", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			store.set(selectDayAtom, "2025-01-20");

			store.set(enterDatePickerModeAtom, "end");
			store.set(selectDayAtom, "2025-01-10"); // start より前

			expect(store.get(startValueAtom)).toBe("2025-01-10");
			expect(store.get(endValueAtom)).toBe("2025-01-20");
		});

		it("selectDayAtom: start が end より後の場合、スワップする", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "end");
			store.set(selectDayAtom, "2025-01-20");

			store.set(enterDatePickerModeAtom, "start");
			store.set(selectDayAtom, "2025-01-25"); // end より後

			expect(store.get(startValueAtom)).toBe("2025-01-20");
			expect(store.get(endValueAtom)).toBe("2025-01-25");
		});
	});

	describe("カレンダーナビゲーション", () => {
		it("prevMonthAtom: 1月から12月に移動（年跨ぎ）", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			// start は 2025-01-15 なので displayMonth は 0 (January)
			store.set(prevMonthAtom);
			expect(store.get(displayMonthValueAtom)).toBe(11);
			expect(store.get(displayYearValueAtom)).toBe(2024);
		});

		it("nextMonthAtom: 次月に移動", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			store.set(nextMonthAtom);
			expect(store.get(displayMonthValueAtom)).toBe(1);
			expect(store.get(displayYearValueAtom)).toBe(2025);
		});

		it("prevMonthAtom: 通常の月移動", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			// まず2月に移動
			store.set(nextMonthAtom);
			expect(store.get(displayMonthValueAtom)).toBe(1);

			// 前月に戻る
			store.set(prevMonthAtom);
			expect(store.get(displayMonthValueAtom)).toBe(0);
			expect(store.get(displayYearValueAtom)).toBe(2025);
		});

		it("nextMonthAtom: 12月から1月（年跨ぎ）", () => {
			const store = createResetStore();
			store.set(enterDatePickerModeAtom, "start");
			// 11回 nextMonth して December に移動
			for (let i = 0; i < 11; i++) {
				store.set(nextMonthAtom);
			}
			expect(store.get(displayMonthValueAtom)).toBe(11);
			expect(store.get(displayYearValueAtom)).toBe(2025);

			// もう1回で January 2026
			store.set(nextMonthAtom);
			expect(store.get(displayMonthValueAtom)).toBe(0);
			expect(store.get(displayYearValueAtom)).toBe(2026);
		});
	});
});
