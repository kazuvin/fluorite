import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	describe("基本レンダリング", () => {
		it("ラベルが表示される", () => {
			render(<Badge label="work" onPress={() => {}} />);
			expect(screen.getByText("work")).toBeInTheDocument();
		});

		it("accessibilityRole が button に設定される", () => {
			render(<Badge label="work" onPress={() => {}} />);
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		it("testID が設定される", () => {
			render(<Badge label="work" testID="badge-work" onPress={() => {}} />);
			expect(screen.getByTestId("badge-work")).toBeInTheDocument();
		});
	});

	describe("選択状態", () => {
		it("selected=false のとき aria-selected が false", () => {
			render(<Badge label="work" testID="badge" onPress={() => {}} />);
			expect(screen.getByTestId("badge")).toHaveAttribute("aria-selected", "false");
		});

		it("selected=true のとき aria-selected が true", () => {
			render(<Badge label="work" testID="badge" selected onPress={() => {}} />);
			expect(screen.getByTestId("badge")).toHaveAttribute("aria-selected", "true");
		});
	});

	describe("カラードット", () => {
		it("color を指定するとドットが表示される", () => {
			render(<Badge label="work" color="#4A90D9" testID="badge" onPress={() => {}} />);
			expect(screen.getByTestId("badge-dot")).toBeInTheDocument();
		});

		it("color を指定しないとドットが表示されない", () => {
			render(<Badge label="すべて" testID="badge" onPress={() => {}} />);
			expect(screen.queryByTestId("badge-dot")).toBeNull();
		});
	});

	describe("インタラクション", () => {
		it("タップで onPress が呼ばれる", () => {
			const onPress = vi.fn();
			render(<Badge label="work" onPress={onPress} />);
			fireEvent.click(screen.getByText("work"));
			expect(onPress).toHaveBeenCalledOnce();
		});
	});
});
