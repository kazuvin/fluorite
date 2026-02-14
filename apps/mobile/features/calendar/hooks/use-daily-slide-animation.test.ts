import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDailySlideAnimation } from "./use-daily-slide-animation";

const { withTimingMock } = vi.hoisted(() => ({
	withTimingMock: vi.fn((_value: number, _config?: object) => _value),
}));

vi.mock("react-native-reanimated", () => {
	const easingFn = vi.fn();
	return {
		useSharedValue: (initial: number) => ({ value: initial }),
		useAnimatedStyle: (fn: () => object) => fn(),
		withTiming: withTimingMock,
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

	it("同じ週内の日付タップでスライドアニメーションが発火する", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		withTimingMock.mockClear();

		// 同じ週内: 2026-01-15(木) → 2026-01-16(金) - 未来方向
		act(() => {
			result.current.onDateKeyChange("2026-01-16");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週境界越えの日付タップでスライドアニメーションが発火する", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-17");
		});
		withTimingMock.mockClear();

		// 2026-01-17(土) → 2026-01-18(日) は週境界越え
		act(() => {
			result.current.onDateKeyChange("2026-01-18");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週スワイプ + 未来方向の日付変更でスライドアニメーションが発火する", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		act(() => {
			result.current.markWeekSwipe();
		});
		withTimingMock.mockClear();

		act(() => {
			result.current.onDateKeyChange("2026-01-22");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("週スワイプ + 過去方向の日付変更でスライドアニメーションが発火する", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		act(() => {
			result.current.markWeekSwipe();
		});
		withTimingMock.mockClear();

		act(() => {
			result.current.onDateKeyChange("2026-01-08");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
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

		// 2回目はスワイプフラグが消費済み → タップ扱いでスライドが発火
		withTimingMock.mockClear();
		act(() => {
			result.current.onDateKeyChange("2026-01-29");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("markDailySwipe + 週境界越えではアニメーションが発火しない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-17");
		});
		act(() => {
			result.current.markDailySwipe();
		});
		withTimingMock.mockClear();

		// 2026-01-17(土) → 2026-01-18(日) は週境界越え
		act(() => {
			result.current.onDateKeyChange("2026-01-18");
		});

		expect(withTimingMock).not.toHaveBeenCalled();
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("markDailySwipe + 同じ週内ではアニメーションが発火しない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		act(() => {
			result.current.markDailySwipe();
		});
		withTimingMock.mockClear();

		// 同じ週内: 2026-01-15(木) → 2026-01-16(金)
		act(() => {
			result.current.onDateKeyChange("2026-01-16");
		});

		expect(withTimingMock).not.toHaveBeenCalled();
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});

	it("markDailySwipe は1回の日付変更で消費される", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-17");
		});
		act(() => {
			result.current.markDailySwipe();
		});

		// 1回目: デイリースワイプ → アニメーション無し
		act(() => {
			result.current.onDateKeyChange("2026-01-18");
		});

		// 2回目: マークなし → タップ扱いでスライドアニメーションが発火
		withTimingMock.mockClear();
		act(() => {
			result.current.onDateKeyChange("2026-01-24");
		});

		expect(withTimingMock).toHaveBeenCalledWith(0, expect.any(Object));
	});

	it("null の日付変更ではアニメーションが発火しない", () => {
		const { result } = renderHook(() => useDailySlideAnimation(375));

		act(() => {
			result.current.onDateKeyChange("2026-01-15");
		});
		act(() => {
			result.current.markWeekSwipe();
		});
		withTimingMock.mockClear();

		act(() => {
			result.current.onDateKeyChange(null);
		});

		expect(withTimingMock).not.toHaveBeenCalled();
		expect(result.current.slideStyle.transform).toContainEqual({
			translateX: 0,
		});
	});
});
