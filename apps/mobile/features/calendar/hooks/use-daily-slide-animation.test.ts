import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDailySlideAnimation } from "./use-daily-slide-animation";

vi.mock("react-native-reanimated", () => {
	const easingFn = vi.fn();
	return {
		useSharedValue: (initial: number) => ({ value: initial }),
		useAnimatedStyle: (fn: () => object) => fn(),
		withTiming: (_value: number, _config?: object) => _value,
		Easing: {
			out: vi.fn(() => easingFn),
			in: vi.fn(() => easingFn),
			inOut: vi.fn(() => easingFn),
			bezier: vi.fn(() => easingFn),
			ease: easingFn,
		},
	};
});

describe("useDailySlideAnimation", () => {
	it("初期状態で translateX が 0 である", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週スワイプなしで日付変更しても translateX は 0 のまま", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		act(() => {
			result.current.onDateKeyChange("2026-01-16");
		});

		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週スワイプ + 未来方向の日付変更で translateX が 0 になる（アニメーション後）", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		// 初回の日付セット
		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		// 週スワイプをマーク
		act(() => {
			result.current.markWeekSwipe();
		});

		// 未来方向の日付変更
		act(() => {
			result.current.onDateKeyChange("2026-01-22");
		});

		// withTiming mock は即座に最終値を返すため 0
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週スワイプ + 過去方向の日付変更で translateX が 0 になる（アニメーション後）", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		act(() => {
			result.current.markWeekSwipe();
		});

		act(() => {
			result.current.onDateKeyChange("2026-01-08");
		});

		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("markWeekSwipe は1回の日付変更で消費される", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		act(() => {
			result.current.markWeekSwipe();
		});

		act(() => {
			result.current.onDateKeyChange("2026-01-22");
		});

		// 2回目はスワイプフラグが消費済み
		act(() => {
			result.current.onDateKeyChange("2026-01-29");
		});

		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("デイリーで週境界を越えた場合フェードアニメーションが発火する（opacity が 0→1）", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-17");
		});

		// markWeekSwipe なし → デイリースワイプ扱い
		// 2026-01-17(土) → 2026-01-18(日) は週境界越え
		act(() => {
			result.current.onDateKeyChange("2026-01-18");
		});

		// withTiming mock は即座に最終値を返すため opacity=1
		expect(result.current.slideStyle.opacity).toBe(1);
		// translateX は変わらない
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("デイリーで同じ週内の日付変更ではフェードしない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		// 同じ週内: 2026-01-15(木) → 2026-01-16(金)
		act(() => {
			result.current.onDateKeyChange("2026-01-16");
		});

		expect(result.current.slideStyle.opacity).toBe(1);
	});

	it("週スワイプで週境界を越えた場合はスライドでありフェードではない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		act(() => {
			result.current.markWeekSwipe();
		});

		act(() => {
			result.current.onDateKeyChange("2026-01-22");
		});

		// スライド: translateX が最終値 0
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
		// opacity は 1 のまま（フェードなし）
		expect(result.current.slideStyle.opacity).toBe(1);
	});

	it("null の日付変更ではアニメーションが発火しない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});

		act(() => {
			result.current.markWeekSwipe();
		});

		act(() => {
			result.current.onDateKeyChange(null);
		});

		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});
});
