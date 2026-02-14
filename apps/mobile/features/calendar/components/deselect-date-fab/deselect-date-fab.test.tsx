import { fireEvent, render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { selectDateAtom, selectedDateValueAtom } from "../../stores/selected-date-atoms";

vi.mock("../../../../components/ui/icon-symbol", () => ({
	IconSymbol: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

import { DeselectDateFab } from "./deselect-date-fab";

describe("DeselectDateFab", () => {
	let store: ReturnType<typeof createStore>;

	function wrapper({ children }: { children: ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	function renderWithProvider(ui: React.ReactElement) {
		store = createStore();
		return render(ui, { wrapper });
	}

	function renderWithSelectedDate(dateKey = "2026-02-15") {
		store = createStore();
		store.set(selectDateAtom, dateKey);
		return render(<DeselectDateFab />, { wrapper });
	}

	it("日付未選択時は表示されない", () => {
		renderWithProvider(<DeselectDateFab />);
		expect(screen.queryByTestId("deselect-date-fab")).toBeNull();
	});

	it("日付選択時に ✗ ボタンが表示される", () => {
		renderWithSelectedDate();
		expect(screen.getByTestId("deselect-date-fab")).toBeInTheDocument();
	});

	it("✗ ボタンをクリックすると selectedDateAtom が null になる", () => {
		renderWithSelectedDate();
		fireEvent.click(screen.getByTestId("deselect-date-fab"));
		expect(store.get(selectedDateValueAtom)).toBeNull();
	});
});
