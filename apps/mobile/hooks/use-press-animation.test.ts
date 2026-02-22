import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePressAnimation } from "./use-press-animation";

describe("usePressAnimation", () => {
	it("初期状態で scale が 1", () => {
		const { result } = renderHook(() => usePressAnimation());
		expect(result.current.animatedStyle).toEqual({
			transform: [{ scale: 1 }],
		});
	});

	it("onPressIn で scale が縮小される", () => {
		const { result, rerender } = renderHook(() => usePressAnimation());
		act(() => {
			result.current.onPressIn();
		});
		rerender();
		expect(result.current.animatedStyle).toEqual({
			transform: [{ scale: 0.96 }],
		});
	});

	it("onPressOut で scale が 1 に戻る", () => {
		const { result, rerender } = renderHook(() => usePressAnimation());
		act(() => {
			result.current.onPressIn();
		});
		act(() => {
			result.current.onPressOut();
		});
		rerender();
		expect(result.current.animatedStyle).toEqual({
			transform: [{ scale: 1 }],
		});
	});
});
