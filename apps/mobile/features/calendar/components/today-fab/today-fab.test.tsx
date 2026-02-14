import { fireEvent, render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { selectedDateValueAtom } from "../../stores/selected-date-atoms";
import { TodayFab } from "./today-fab";

describe("TodayFab", () => {
	let store: ReturnType<typeof createStore>;

	function wrapper({ children }: { children: ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	function renderWithProvider(ui: React.ReactElement) {
		store = createStore();
		return render(ui, { wrapper });
	}

	it("Today ボタンが常に表示される", () => {
		renderWithProvider(<TodayFab />);
		expect(screen.getByTestId("today-fab")).toBeInTheDocument();
	});

	it("クリックすると selectedDateValueAtom が今日の dateKey になる", () => {
		renderWithProvider(<TodayFab />);
		fireEvent.click(screen.getByTestId("today-fab"));

		const today = new Date();
		const expectedDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		expect(store.get(selectedDateValueAtom)).toBe(expectedDateKey);
	});
});
