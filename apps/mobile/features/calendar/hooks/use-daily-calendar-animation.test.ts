import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDailyCalendarAnimation } from "./use-daily-calendar-animation";

vi.mock("react-native-reanimated", () => {
	const { useRef } = require("react");
	const easingFn = vi.fn();

	/**
	 * withTiming モック: 実際の reanimated と同様に、
	 * SharedValue へ代入すると前のアニメーションがキャンセルされる挙動を再現する。
	 * タグ付きオブジェクトを返し、SharedValue の setter が検出して
	 * per-shared-value で setTimeout を管理する。
	 */
	return {
		useSharedValue: (initial: number) => {
			const ref = useRef(null);
			if (ref.current === null) {
				ref.current = {
					_value: initial,
					_timer: null as ReturnType<typeof setTimeout> | null,
					get value() {
						return this._value;
					},
					set value(v: unknown) {
						// 既存タイマーを常にキャンセル（前のアニメーション中断）
						if (this._timer !== null) {
							clearTimeout(this._timer);
							this._timer = null;
						}
						if (v && typeof v === "object" && "__timing" in v) {
							const tagged = v as {
								__timing: true;
								value: number;
								duration: number;
								callback?: (finished: boolean) => void;
							};
							this._value = tagged.value;
							if (tagged.callback) {
								this._timer = setTimeout(() => {
									tagged.callback?.(true);
									this._timer = null;
								}, tagged.duration);
							}
						} else {
							this._value = v as number;
						}
					},
				};
			}
			return ref.current;
		},
		useAnimatedStyle: (fn: () => object) => fn(),
		withTiming: (
			value: number,
			config?: { duration?: number },
			callback?: (finished: boolean) => void,
		) => ({
			__timing: true,
			value,
			duration: config?.duration ?? 200,
			callback,
		}),
		runOnJS: (fn: unknown) => fn,
		Easing: {
			out: vi.fn(() => easingFn),
			in: vi.fn(() => easingFn),
			inOut: vi.fn(() => easingFn),
			bezier: vi.fn(() => easingFn),
			ease: easingFn,
		},
	};
});

describe("useDailyCalendarAnimation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns animated style", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(false));
		expect(result.current.animatedStyle).toBeDefined();
	});

	it("has opacity 0 when not selected", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(false));
		expect(result.current.animatedStyle.opacity).toBe(0);
	});

	it("has opacity 1 when selected", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(true));
		expect(result.current.animatedStyle.opacity).toBe(1);
	});

	describe("entering animation は次のイベントループまで遅延する", () => {
		it("false → true 遷移直後はアニメーション値がまだ初期状態のまま", () => {
			const { result, rerender } = renderHook(
				({ isSelected }) => useDailyCalendarAnimation(isSelected),
				{ initialProps: { isSelected: false } },
			);

			rerender({ isSelected: true });
			// setTimeout(0) 前: アニメーション値はまだ更新されていない
			expect(result.current.animatedStyle.opacity).toBe(0);
		});

		it("false → true 遷移後、次のイベントループでアニメーション値が目標値に更新される", () => {
			const { result, rerender } = renderHook(
				({ isSelected }) => useDailyCalendarAnimation(isSelected),
				{ initialProps: { isSelected: false } },
			);

			rerender({ isSelected: true });
			// setTimeout(0) を発火
			act(() => {
				vi.advanceTimersByTime(1);
			});
			// shared value 更新は React state を変えないため、明示的にリレンダーして animatedStyle を再評価
			rerender({ isSelected: true });
			expect(result.current.animatedStyle.opacity).toBe(1);
		});
	});

	describe("showDailyCalendar", () => {
		it("isSelected=false のとき showDailyCalendar は false", () => {
			const { result } = renderHook(() => useDailyCalendarAnimation(false));
			expect(result.current.showDailyCalendar).toBe(false);
		});

		it("isSelected=true のとき showDailyCalendar は true", () => {
			const { result } = renderHook(() => useDailyCalendarAnimation(true));
			expect(result.current.showDailyCalendar).toBe(true);
		});

		it("isSelected が false → true になったとき useEffect 後に showDailyCalendar が true になる", () => {
			const { result, rerender } = renderHook(
				({ isSelected }) => useDailyCalendarAnimation(isSelected),
				{ initialProps: { isSelected: false } },
			);
			expect(result.current.showDailyCalendar).toBe(false);

			rerender({ isSelected: true });
			expect(result.current.showDailyCalendar).toBe(true);
		});

		it("isSelected が true → false になったとき即座に false にならず withTiming 完了後に false になる", () => {
			const { result, rerender } = renderHook(
				({ isSelected }) => useDailyCalendarAnimation(isSelected),
				{ initialProps: { isSelected: true } },
			);
			expect(result.current.showDailyCalendar).toBe(true);

			rerender({ isSelected: false });
			// 退場アニメーション中はまだ表示
			expect(result.current.showDailyCalendar).toBe(true);

			// withTiming(200ms = ANIMATION.layout.duration) 完了後に非表示
			act(() => {
				vi.advanceTimersByTime(200);
			});
			expect(result.current.showDailyCalendar).toBe(false);
		});

		it("退場中に再度 isSelected=true になったらアニメーションがキャンセルされ表示を維持する", () => {
			const { result, rerender } = renderHook(
				({ isSelected }) => useDailyCalendarAnimation(isSelected),
				{ initialProps: { isSelected: true } },
			);

			// 退場開始
			rerender({ isSelected: false });
			expect(result.current.showDailyCalendar).toBe(true);

			// 100ms 後に再選択 → 退場アニメーションがキャンセルされる
			act(() => {
				vi.advanceTimersByTime(100);
			});
			rerender({ isSelected: true });
			expect(result.current.showDailyCalendar).toBe(true);

			// さらに 200ms 経過しても表示が維持される（退場コールバックはキャンセル済み）
			act(() => {
				vi.advanceTimersByTime(200);
			});
			expect(result.current.showDailyCalendar).toBe(true);
		});
	});
});
