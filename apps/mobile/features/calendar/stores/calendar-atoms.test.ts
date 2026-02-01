import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
	calendarGridValueAtom,
	goToNextMonthAtom,
	goToPrevMonthAtom,
	monthValueAtom,
	yearValueAtom,
} from "./calendar-atoms";

describe("calendar-atoms", () => {
	it("初期状態: yearValueAtom が現在の年を返す", () => {
		const store = createStore();
		expect(store.get(yearValueAtom)).toBe(new Date().getFullYear());
	});

	it("初期状態: monthValueAtom が現在の月を返す", () => {
		const store = createStore();
		expect(store.get(monthValueAtom)).toBe(new Date().getMonth());
	});

	it("calendarGridValueAtom が 6x7 のグリッドを返す", () => {
		const store = createStore();
		const grid = store.get(calendarGridValueAtom);
		expect(grid).toHaveLength(6);
		for (const week of grid) {
			expect(week).toHaveLength(7);
		}
	});

	it("goToPrevMonthAtom で月が1つ戻る", () => {
		const store = createStore();
		const initialMonth = store.get(monthValueAtom);
		const initialYear = store.get(yearValueAtom);

		store.set(goToPrevMonthAtom);

		if (initialMonth === 0) {
			expect(store.get(monthValueAtom)).toBe(11);
			expect(store.get(yearValueAtom)).toBe(initialYear - 1);
		} else {
			expect(store.get(monthValueAtom)).toBe(initialMonth - 1);
			expect(store.get(yearValueAtom)).toBe(initialYear);
		}
	});

	it("goToNextMonthAtom で月が1つ進む", () => {
		const store = createStore();
		const initialMonth = store.get(monthValueAtom);
		const initialYear = store.get(yearValueAtom);

		store.set(goToNextMonthAtom);

		if (initialMonth === 11) {
			expect(store.get(monthValueAtom)).toBe(0);
			expect(store.get(yearValueAtom)).toBe(initialYear + 1);
		} else {
			expect(store.get(monthValueAtom)).toBe(initialMonth + 1);
			expect(store.get(yearValueAtom)).toBe(initialYear);
		}
	});

	it("1月から前月に戻ると前年12月になる", () => {
		const store = createStore();
		// 2026年1月にセット
		store.set(goToPrevMonthAtom); // 現在月に関わらず初期化

		// 確実に1月にするためナビゲーションで調整
		// まず既知の状態にリセット: 直接テスト用に atom の初期値を利用
		// createStore で新しいストアを作り、1月まで戻る
		const testStore = createStore();
		const currentMonth = testStore.get(monthValueAtom);

		// 1月（0）になるまで戻る
		for (let i = 0; i < currentMonth; i++) {
			testStore.set(goToPrevMonthAtom);
		}
		expect(testStore.get(monthValueAtom)).toBe(0);

		const yearBefore = testStore.get(yearValueAtom);
		testStore.set(goToPrevMonthAtom);

		expect(testStore.get(monthValueAtom)).toBe(11);
		expect(testStore.get(yearValueAtom)).toBe(yearBefore - 1);
	});

	it("12月から次月に進むと翌年1月になる", () => {
		const testStore = createStore();
		const currentMonth = testStore.get(monthValueAtom);

		// 12月（11）になるまで進む
		for (let i = 0; i < 11 - currentMonth; i++) {
			testStore.set(goToNextMonthAtom);
		}
		expect(testStore.get(monthValueAtom)).toBe(11);

		const yearBefore = testStore.get(yearValueAtom);
		testStore.set(goToNextMonthAtom);

		expect(testStore.get(monthValueAtom)).toBe(0);
		expect(testStore.get(yearValueAtom)).toBe(yearBefore + 1);
	});

	it("グリッドが月の変更に連動する", () => {
		const store = createStore();
		const gridBefore = store.get(calendarGridValueAtom);

		store.set(goToNextMonthAtom);

		const gridAfter = store.get(calendarGridValueAtom);
		// グリッドの内容が変わっていることを検証
		const flatBefore = gridBefore.flat().map((d) => `${d.year}-${d.month}-${d.date}`);
		const flatAfter = gridAfter.flat().map((d) => `${d.year}-${d.month}-${d.date}`);
		expect(flatAfter).not.toEqual(flatBefore);
	});
});
