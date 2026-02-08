import { act, renderHook } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useSelectedDate } from "./use-selected-date";

const createWrapper =
	(store: ReturnType<typeof createStore>) =>
	({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

describe("useSelectedDate", () => {
	it("初期状態で selectedDateKey が null を返す", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		expect(result.current.selectedDateKey).toBeNull();
	});

	it("初期状態で selectedWeekIndex が -1 を返す", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		expect(result.current.selectedWeekIndex).toBe(-1);
	});

	it("handleSelectDate で日付が選択される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});

		expect(result.current.selectedDateKey).toBe("2026-01-15");
	});

	it("handleSelectDate で同じ日付を選択するとトグルされる", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-15");

		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBeNull();
	});

	it("handleClearDate で選択が解除される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-15");

		act(() => {
			result.current.handleClearDate();
		});
		expect(result.current.selectedDateKey).toBeNull();
	});

	it("selectedWeekIndex が選択された日付の週インデックスを返す", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		// 2026-01-01 は木曜日、カレンダーの1行目に含まれる
		act(() => {
			result.current.handleSelectDate("2026-01-01");
		});
		expect(result.current.selectedWeekIndex).toBeGreaterThanOrEqual(0);
	});

	it("handleWeekChange で同じ曜日の日付に更新される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		// 木曜日(2026-01-15)を選択
		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-15");

		// 次週の水曜(center)を渡す → 次週の木曜に更新される
		act(() => {
			result.current.handleWeekChange("2026-01-21");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-22");
	});

	it("handleWeekChange は選択日が null の場合は何もしない", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		expect(result.current.selectedDateKey).toBeNull();

		act(() => {
			result.current.handleWeekChange("2026-01-21");
		});
		expect(result.current.selectedDateKey).toBeNull();
	});

	it("handleNavigateToDate で同じ週内の日付はそのまま設定される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		// 木曜日(2026-01-15)を選択
		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-15");

		// 同じ週内の水曜日に移動 → そのまま設定
		act(() => {
			result.current.handleNavigateToDate("2026-01-14");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-14");
	});

	it("handleNavigateToDate で週境界を越えた場合もそのまま設定される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		act(() => {
			result.current.handleSelectDate("2026-01-15");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-15");

		// 翌週の日曜に移動 → そのまま設定
		act(() => {
			result.current.handleNavigateToDate("2026-01-18");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-18");
	});

	it("handleNavigateToDate で選択がない場合はそのまま設定される", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		expect(result.current.selectedDateKey).toBeNull();

		act(() => {
			result.current.handleNavigateToDate("2026-01-18");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-18");
	});

	it("handleWeekChange はトグルせず強制セットする", () => {
		const store = createStore();
		const { result } = renderHook(() => useSelectedDate(2026, 0), {
			wrapper: createWrapper(store),
		});

		// 水曜日(2026-01-14)を選択
		act(() => {
			result.current.handleSelectDate("2026-01-14");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-14");

		// 同じ水曜の center を渡す → 同じ日付が返るが、トグルではなく維持される
		act(() => {
			result.current.handleWeekChange("2026-01-14");
		});
		expect(result.current.selectedDateKey).toBe("2026-01-14");
	});
});
