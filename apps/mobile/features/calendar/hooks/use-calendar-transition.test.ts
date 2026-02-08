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

	describe("週→月の展開トランジション (expanding)", () => {
		it("week モードから日付解除すると expanding モードに遷移する", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			// month → collapsing → week
			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// week → expanding
			rerender({ selectedDateKey: null, selectedWeekIndex: -1 });
			expect(result.current.mode).toBe("expanding");
		});

		it("expanding 開始時に月カレンダーが即時表示され週カレンダーが即時非表示になる（collapsing の逆）", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// week モードでは monthOpacity=0, weekCalendarOpacity=1
			expect(result.current.monthOpacity.value).toBe(0);
			expect(result.current.weekCalendarOpacity.value).toBe(1);

			rerender({ selectedDateKey: null, selectedWeekIndex: -1 });

			// expanding 開始: 即時に切り替え（フェードアウト待ちなし）
			expect(result.current.monthOpacity.value).toBe(1);
			expect(result.current.weekCalendarOpacity.value).toBe(0);
		});

		it("expanding 開始時に opacity は即時切り替え、高さと位置のみアニメーションする", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// week モードでは折りたたまれた状態
			expect(result.current.containerHeight.value).toBe(80); // WEEK_HEIGHT
			expect(result.current.nonSelectedRowOpacity.value).toBe(0);

			rerender({ selectedDateKey: null, selectedWeekIndex: -1 });

			// opacity はすべて即時切り替え（フェード不要）
			expect(result.current.nonSelectedRowOpacity.value).toBe(1);
			expect(result.current.dayInfoOpacity.value).toBe(0);
			// 高さと位置は withTiming（モックで即座に目標値）
			expect(result.current.containerHeight.value).toBe(480); // MONTH_HEIGHT
			expect(result.current.monthTranslateY.value).toBe(0);
		});

		it("展開完了後に showWeekCalendar が false になり month モードに遷移する", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			rerender({ selectedDateKey: null, selectedWeekIndex: -1 });
			expect(result.current.mode).toBe("expanding");

			await waitFor(() => {
				expect(result.current.mode).toBe("month");
			});

			expect(result.current.showWeekCalendar).toBe(false);
		});
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

		it("週スワイプで selectedWeekIndex が -1 になっても week モードを維持する", async () => {
			const { result, rerender } = renderHook((props) => useCalendarTransition(props), {
				initialProps: { selectedDateKey: null as string | null, selectedWeekIndex: -1 },
			});

			rerender({ selectedDateKey: "2026-01-15", selectedWeekIndex: 2 });
			await waitFor(() => {
				expect(result.current.mode).toBe("week");
			});

			// 週スワイプにより selectedDateKey は更新されたが、
			// viewingMonth のグリッド外のため selectedWeekIndex は -1
			rerender({ selectedDateKey: "2026-03-19", selectedWeekIndex: -1 });

			// week モードを維持すべき（expanding に遷移してはいけない）
			expect(result.current.mode).toBe("week");
			expect(result.current.showWeekCalendar).toBe(true);
			expect(result.current.monthScrollEnabled).toBe(false);
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
