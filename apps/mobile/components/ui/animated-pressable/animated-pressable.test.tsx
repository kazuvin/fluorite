import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnimatedPressable } from "./animated-pressable";

describe("AnimatedPressable", () => {
	describe("基本レンダリング", () => {
		it("children を表示する", () => {
			render(
				<AnimatedPressable onPress={() => {}}>
					<span>テスト</span>
				</AnimatedPressable>,
			);
			expect(screen.getByText("テスト")).toBeInTheDocument();
		});

		it("accessibilityRole が透過される", () => {
			render(
				<AnimatedPressable accessibilityRole="button" testID="ap" onPress={() => {}}>
					<span>テスト</span>
				</AnimatedPressable>,
			);
			expect(screen.getByTestId("ap")).toBeInTheDocument();
		});
	});

	describe("インタラクション", () => {
		it("onPress が呼ばれる", () => {
			const onPress = vi.fn();
			render(
				<AnimatedPressable onPress={onPress}>
					<span>テスト</span>
				</AnimatedPressable>,
			);
			fireEvent.click(screen.getByText("テスト"));
			expect(onPress).toHaveBeenCalledOnce();
		});

		it("disabled=true のとき onPress が呼ばれない", () => {
			const onPress = vi.fn();
			render(
				<AnimatedPressable onPress={onPress} disabled>
					<span>テスト</span>
				</AnimatedPressable>,
			);
			fireEvent.click(screen.getByText("テスト"));
			expect(onPress).not.toHaveBeenCalled();
		});
	});
});
