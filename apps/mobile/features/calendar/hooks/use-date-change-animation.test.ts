import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDateChangeAnimation } from "./use-date-change-animation";

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
			bezier: vi.fn(() => easingFn),
		},
	};
});

describe("useDateChangeAnimation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns animated style with opacity 1 and scale 1 on initial render", () => {
		const { result } = renderHook(() => useDateChangeAnimation("2025-01-01"));
		expect(result.current.animatedStyle).toEqual({
			opacity: 1,
			transform: [{ scale: 1 }],
		});
	});

	it("does not trigger animation on initial render", () => {
		renderHook(() => useDateChangeAnimation("2025-01-01"));
		expect(withTimingMock).not.toHaveBeenCalled();
	});

	it("triggers animation when dateKey changes to a different date", () => {
		const { rerender } = renderHook(({ dateKey }) => useDateChangeAnimation(dateKey), {
			initialProps: { dateKey: "2025-01-01" as string | null },
		});

		withTimingMock.mockClear();
		rerender({ dateKey: "2025-01-02" });

		expect(withTimingMock).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 200 }));
	});

	it("does not trigger animation when dateKey changes from null to a value", () => {
		const { rerender } = renderHook(({ dateKey }) => useDateChangeAnimation(dateKey), {
			initialProps: { dateKey: null as string | null },
		});

		withTimingMock.mockClear();
		rerender({ dateKey: "2025-01-01" });

		expect(withTimingMock).not.toHaveBeenCalled();
	});

	it("does not trigger animation when dateKey changes from a value to null", () => {
		const { rerender } = renderHook(({ dateKey }) => useDateChangeAnimation(dateKey), {
			initialProps: { dateKey: "2025-01-01" as string | null },
		});

		withTimingMock.mockClear();
		rerender({ dateKey: null });

		expect(withTimingMock).not.toHaveBeenCalled();
	});

	it("does not trigger animation when rerendered with the same dateKey", () => {
		const { rerender } = renderHook(({ dateKey }) => useDateChangeAnimation(dateKey), {
			initialProps: { dateKey: "2025-01-01" as string | null },
		});

		withTimingMock.mockClear();
		rerender({ dateKey: "2025-01-01" });

		expect(withTimingMock).not.toHaveBeenCalled();
	});
});
