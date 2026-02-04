import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useDailyCalendarAnimation } from "./use-daily-calendar-animation";

vi.mock("react-native-reanimated", () => ({
	useSharedValue: (initial: number) => ({ value: initial }),
	useAnimatedStyle: (fn: () => object) => fn(),
	withTiming: (_value: number, _config?: object) => _value,
	Easing: {
		out: vi.fn((fn) => fn),
		cubic: vi.fn(),
	},
}));

describe("useDailyCalendarAnimation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns animated style", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(false));
		expect(result.current.animatedStyle).toBeDefined();
	});

	it("returns DAILY_CALENDAR_HEIGHT constant", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(false));
		expect(result.current.DAILY_CALENDAR_HEIGHT).toBe(400);
	});

	it("has opacity 0 and translateY offset when not selected", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(false));
		expect(result.current.animatedStyle.opacity).toBe(0);
		expect(result.current.animatedStyle.transform).toContainEqual({ translateY: 20 });
	});

	it("has opacity 1 and translateY 0 when selected", () => {
		const { result } = renderHook(() => useDailyCalendarAnimation(true));
		expect(result.current.animatedStyle.opacity).toBe(1);
		expect(result.current.animatedStyle.transform).toContainEqual({ translateY: 0 });
	});
});
