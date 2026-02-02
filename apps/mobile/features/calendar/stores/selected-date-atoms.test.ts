import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
	clearSelectedDateAtom,
	selectDateAtom,
	selectedDateValueAtom,
	setSelectedDateAtom,
} from "./selected-date-atoms";

describe("selected-date-atoms", () => {
	it("初期状態: selectedDateValueAtom が null を返す", () => {
		const store = createStore();
		expect(store.get(selectedDateValueAtom)).toBeNull();
	});

	it("selectDateAtom で日付を選択できる", () => {
		const store = createStore();
		store.set(selectDateAtom, "2025-01-15");
		expect(store.get(selectedDateValueAtom)).toBe("2025-01-15");
	});

	it("selectDateAtom で同じ日付を再度選択すると null に戻る（トグル）", () => {
		const store = createStore();
		store.set(selectDateAtom, "2025-01-15");
		store.set(selectDateAtom, "2025-01-15");
		expect(store.get(selectedDateValueAtom)).toBeNull();
	});

	it("selectDateAtom で別の日付を選択すると切り替わる", () => {
		const store = createStore();
		store.set(selectDateAtom, "2025-01-15");
		store.set(selectDateAtom, "2025-01-20");
		expect(store.get(selectedDateValueAtom)).toBe("2025-01-20");
	});

	it("clearSelectedDateAtom で選択を解除できる", () => {
		const store = createStore();
		store.set(selectDateAtom, "2025-01-15");
		store.set(clearSelectedDateAtom);
		expect(store.get(selectedDateValueAtom)).toBeNull();
	});

	it("clearSelectedDateAtom を未選択時に呼んでもエラーにならない", () => {
		const store = createStore();
		store.set(clearSelectedDateAtom);
		expect(store.get(selectedDateValueAtom)).toBeNull();
	});

	it("setSelectedDateAtom で日付を強制セットできる（トグルしない）", () => {
		const store = createStore();
		store.set(setSelectedDateAtom, "2025-01-15");
		expect(store.get(selectedDateValueAtom)).toBe("2025-01-15");
		// 同じ日付をセットしてもトグルしない
		store.set(setSelectedDateAtom, "2025-01-15");
		expect(store.get(selectedDateValueAtom)).toBe("2025-01-15");
	});
});
