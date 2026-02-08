import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCalendarTransition } from "./use-calendar-transition";

describe("useCalendarTransition", () => {
	it("初期状態は month モードである", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.mode).toBe("month");
		expect(result.current.showWeekCalendar).toBe(false);
	});

	it("日付が選択されると collapsing モードに遷移し、週カレンダーがプリマウントされる", () => {
		const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
			initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
		});

		rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });

		expect(result.current.mode).toBe("collapsing");
		// プリマウント（opacity=0で不可視だがDOMに存在）
		expect(result.current.showWeekCalendar).toBe(true);
		expect(result.current.weekCalendarOpacity.value).toBe(0);
	});

	it("containerHeight の SharedValue が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.containerHeight).toBeDefined();
		expect(result.current.containerHeight.value).toBe(480);
	});

	it("monthTranslateY の SharedValue が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.monthTranslateY).toBeDefined();
		expect(result.current.monthTranslateY.value).toBe(0);
	});

	it("nonSelectedRowOpacity の SharedValue が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.nonSelectedRowOpacity).toBeDefined();
		expect(result.current.nonSelectedRowOpacity.value).toBe(1);
	});

	it("weekCalendarOpacity の SharedValue が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.weekCalendarOpacity).toBeDefined();
		expect(result.current.weekCalendarOpacity.value).toBe(0);
	});

	it("calendarContainerStyle が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.calendarContainerStyle).toBeDefined();
	});

	it("monthInnerStyle が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.monthInnerStyle).toBeDefined();
	});

	it("weekCalendarStyle が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.weekCalendarStyle).toBeDefined();
	});

	it("dayInfoOpacity の SharedValue が返される", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.dayInfoOpacity).toBeDefined();
		expect(result.current.dayInfoOpacity.value).toBe(0);
	});

	it("monthScrollEnabled は month モードで true", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.monthScrollEnabled).toBe(true);
	});

	it("monthScrollEnabled は日付選択時に false", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 }),
		);
		expect(result.current.monthScrollEnabled).toBe(false);
	});

	it("日付解除時に expanding モードに遷移し、weekCalendarOpacity がフェードアウトする", () => {
		const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
			initialProps: { selectedDateKey: "2026-01-15" as string | null, selectedWeekIndex: 2 },
		});

		rerender({ selectedDateKey: null, selectedWeekIndex: -1 });

		expect(result.current.mode).toBe("expanding");
		// withTiming モックは即座に目標値を返すので、opacity は 0 になる
		expect(result.current.weekCalendarOpacity.value).toBe(0);
	});

	it("monthPointerEvents は month モードで auto", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.monthPointerEvents).toBe("auto");
	});

	it("monthPointerEvents は collapsing モードで none", () => {
		const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
			initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
		});

		rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });

		expect(result.current.mode).toBe("collapsing");
		expect(result.current.monthPointerEvents).toBe("none");
	});

	it("monthOpacity の初期値は 1 である", () => {
		const { result } = renderHook(() =>
			useCalendarTransition({ selectedDateKey: null, selectedWeekIndex: -1 }),
		);
		expect(result.current.monthOpacity).toBeDefined();
		expect(result.current.monthOpacity.value).toBe(1);
	});

	it("日付選択の collapsing 開始時点では monthOpacity は 1 のままである", () => {
		const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
			initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
		});

		rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });

		expect(result.current.mode).toBe("collapsing");
		// collapsing 中は月カレンダーの選択行が視覚的アンカーとして残る
		expect(result.current.monthOpacity.value).toBe(1);
	});

	it("折りたたみ完了後 monthOpacity は即時 0 になる（withTiming なし）", async () => {
		const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
			initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
		});

		rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });

		// week モードに遷移するのを待つ
		await waitFor(() => {
			expect(result.current.mode).toBe("week");
		});

		// 折りたたみ完了後、monthOpacity は即時 0
		expect(result.current.monthOpacity.value).toBe(0);
		// weekCalendarOpacity は即時 1
		expect(result.current.weekCalendarOpacity.value).toBe(1);
	});

	describe("週モードでの日付変更", () => {
		it("週モードで別の週の日付を選択してもモードは week のまま（collapsing に戻らない）", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			// 日付を選択 → collapsing
			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			expect(result.current.mode).toBe("collapsing");

			// タイマーが発火して week モードに遷移するのを待つ
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// 別の週の日付を選択
			rerender({ selectedDateKey: "2026-01-22", selectedWeekIndex: 3 });

			// week モードのまま、collapsing に戻らない
			expect(result.current.mode).toBe("week");
		});

		it("週モードで同じ週の別の日付を選択してもモードは week のまま", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// 同じ週内の別の日付を選択
			rerender({ selectedDateKey: "2026-01-16", selectedWeekIndex: 2 });

			expect(result.current.mode).toBe("week");
		});
	});
});
