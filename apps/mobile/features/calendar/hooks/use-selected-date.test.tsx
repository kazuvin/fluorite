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
});
