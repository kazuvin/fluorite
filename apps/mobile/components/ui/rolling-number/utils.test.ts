import { describe, expect, it } from "vitest";
import { computeDirection } from "./utils";

describe("computeDirection", () => {
	it("翌月に進むと 1 を返す", () => {
		expect(computeDirection(2026, 0, 2026, 1)).toBe(1);
	});

	it("前月に戻ると -1 を返す", () => {
		expect(computeDirection(2026, 1, 2026, 0)).toBe(-1);
	});

	it("同じ月なら 1 を返す", () => {
		expect(computeDirection(2026, 5, 2026, 5)).toBe(1);
	});

	it("年をまたいで増加する場合 1 を返す", () => {
		expect(computeDirection(2025, 11, 2026, 0)).toBe(1);
	});

	it("年をまたいで減少する場合 -1 を返す", () => {
		expect(computeDirection(2026, 0, 2025, 11)).toBe(-1);
	});

	it("年だけ増加し月は同じ場合 1 を返す", () => {
		expect(computeDirection(2025, 5, 2026, 5)).toBe(1);
	});

	it("年だけ減少し月は同じ場合 -1 を返す", () => {
		expect(computeDirection(2026, 5, 2025, 5)).toBe(-1);
	});
});
