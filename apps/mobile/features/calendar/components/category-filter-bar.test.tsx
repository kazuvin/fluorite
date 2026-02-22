import { fireEvent, render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../vault/stores/vault-atoms", async () => {
	const { CategoryRegistry } = await import("@fluorite/core");
	const { categoryPalette: palette } = await import("@fluorite/design-tokens");
	const { atom: a } = await import("jotai");
	const registry = new CategoryRegistry();
	registry.set("work", palette.slate);
	registry.set("personal", palette.sage);
	registry.set("holiday", palette.rose);
	return {
		vaultNotesValueAtom: a([]),
		vaultCategoryRegistryValueAtom: a(registry),
	};
});

import { categoryRegistryValueAtom, selectedCategoriesValueAtom } from "../stores/calendar-atoms";
import { CategoryFilterBar } from "./category-filter-bar";

function renderWithStore(ui: ReactNode, store = createStore()) {
	return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

describe("CategoryFilterBar", () => {
	it("「すべて」バッジが表示される", () => {
		renderWithStore(<CategoryFilterBar />);
		expect(screen.getByText("すべて")).toBeInTheDocument();
	});

	it("各カテゴリのバッジが表示される", () => {
		const { store } = renderWithStore(<CategoryFilterBar />);
		const registry = store.get(categoryRegistryValueAtom);
		for (const category of registry.all()) {
			expect(screen.getByText(category.name)).toBeInTheDocument();
		}
	});

	it("初期状態で「すべて」が選択されている", () => {
		renderWithStore(<CategoryFilterBar />);
		const badge = screen.getByTestId("filter-badge-all");
		expect(badge).toHaveAttribute("aria-selected", "true");
	});

	it("カテゴリバッジをタップすると選択状態になる", () => {
		const { store } = renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		const selected = store.get(selectedCategoriesValueAtom);
		expect(selected.has("work")).toBe(true);
		expect(screen.getByTestId("filter-badge-work")).toHaveAttribute("aria-selected", "true");
	});

	it("複数のカテゴリを同時に選択できる", () => {
		const { store } = renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		fireEvent.click(screen.getByText("personal"));
		const selected = store.get(selectedCategoriesValueAtom);
		expect(selected.has("work")).toBe(true);
		expect(selected.has("personal")).toBe(true);
		expect(screen.getByTestId("filter-badge-work")).toHaveAttribute("aria-selected", "true");
		expect(screen.getByTestId("filter-badge-personal")).toHaveAttribute("aria-selected", "true");
	});

	it("選択中のカテゴリバッジを再タップすると選択解除される", () => {
		const { store } = renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		fireEvent.click(screen.getByText("work"));
		const selected = store.get(selectedCategoriesValueAtom);
		expect(selected.has("work")).toBe(false);
	});

	it("カテゴリが1つでも選択されると「すべて」は非選択になる", () => {
		renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		expect(screen.getByTestId("filter-badge-all")).toHaveAttribute("aria-selected", "false");
	});

	it("全カテゴリの選択を解除すると「すべて」が選択状態に戻る", () => {
		renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		fireEvent.click(screen.getByText("work"));
		expect(screen.getByTestId("filter-badge-all")).toHaveAttribute("aria-selected", "true");
	});

	it("「すべて」をタップすると全選択がリセットされる", () => {
		const { store } = renderWithStore(<CategoryFilterBar />);
		fireEvent.click(screen.getByText("work"));
		fireEvent.click(screen.getByText("personal"));
		fireEvent.click(screen.getByText("すべて"));
		const selected = store.get(selectedCategoriesValueAtom);
		expect(selected.size).toBe(0);
		expect(screen.getByTestId("filter-badge-all")).toHaveAttribute("aria-selected", "true");
	});

	it("横スクロール可能な ScrollView でラップされている", () => {
		renderWithStore(<CategoryFilterBar />);
		expect(screen.getByTestId("category-filter-scroll")).toBeInTheDocument();
	});

	it("カテゴリバッジがカラー pill として表示される", () => {
		renderWithStore(<CategoryFilterBar />);
		expect(screen.getByTestId("filter-badge-work")).toBeInTheDocument();
		expect(screen.getByTestId("filter-badge-personal")).toBeInTheDocument();
		expect(screen.getByTestId("filter-badge-holiday")).toBeInTheDocument();
	});
});
