import { renderHook } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { setViewingMonthAtom } from "../stores/calendar-atoms";
import { useCalendarState } from "./use-calendar-state";

const createWrapper =
	(store: ReturnType<typeof createStore>) =>
	({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

describe("useCalendarState", () => {
	it("初期状態で現在の年月を返す", () => {
		const store = createStore();
		const { result } = renderHook(() => useCalendarState(), {
			wrapper: createWrapper(store),
		});

		const now = new Date();
		expect(result.current.baseYear).toBe(now.getFullYear());
		expect(result.current.baseMonth).toBe(now.getMonth());
		expect(result.current.viewingYear).toBe(now.getFullYear());
		expect(result.current.viewingMonth).toBe(now.getMonth());
	});

	it("handleMonthChange で viewingYear/viewingMonth が更新される", () => {
		const store = createStore();
		const { result, rerender } = renderHook(() => useCalendarState(), {
			wrapper: createWrapper(store),
		});

		result.current.handleMonthChange(2025, 3);
		rerender();

		expect(result.current.viewingYear).toBe(2025);
		expect(result.current.viewingMonth).toBe(3);
	});

	it("direction: 翌月に進むと 1 を返す", () => {
		const store = createStore();
		store.set(setViewingMonthAtom, { year: 2026, month: 0 });

		const { result, rerender } = renderHook(() => useCalendarState(), {
			wrapper: createWrapper(store),
		});

		store.set(setViewingMonthAtom, { year: 2026, month: 1 });
		rerender();

		expect(result.current.direction).toBe(1);
	});

	it("direction: 前月に戻ると -1 を返す", () => {
		const store = createStore();
		store.set(setViewingMonthAtom, { year: 2026, month: 1 });

		const { result, rerender } = renderHook(() => useCalendarState(), {
			wrapper: createWrapper(store),
		});

		store.set(setViewingMonthAtom, { year: 2026, month: 0 });
		rerender();

		expect(result.current.direction).toBe(-1);
	});

	it("filteredCalendarEvents を返す", () => {
		const store = createStore();
		const { result } = renderHook(() => useCalendarState(), {
			wrapper: createWrapper(store),
		});

		expect(Array.isArray(result.current.filteredCalendarEvents)).toBe(true);
	});
});
