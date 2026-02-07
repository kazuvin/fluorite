import { describe, expect, it } from "vitest";
import { type HSL, hslToHex } from "../src/tokens/hsl";

describe("hslToHex", () => {
	it("赤 (h=0, s=100, l=50) → #FF0000", () => {
		expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#FF0000");
	});

	it("緑 (h=120, s=100, l=50) → #00FF00", () => {
		expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe("#00FF00");
	});

	it("青 (h=240, s=100, l=50) → #0000FF", () => {
		expect(hslToHex({ h: 240, s: 100, l: 50 })).toBe("#0000FF");
	});

	it("白 (h=0, s=0, l=100) → #FFFFFF", () => {
		expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe("#FFFFFF");
	});

	it("黒 (h=0, s=0, l=0) → #000000", () => {
		expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe("#000000");
	});

	it("蛍石パープル (h=265, s=60, l=55) が紫系 HEX になること", () => {
		const hex = hslToHex({ h: 265, s: 60, l: 55 });
		// 紫系: R > B, G は低め
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		expect(r).toBeGreaterThan(g);
		expect(b).toBeGreaterThan(g);
		expect(hex).toMatch(/^#[0-9A-F]{6}$/);
	});

	it("h=360 と h=0 は同値", () => {
		expect(hslToHex({ h: 360, s: 100, l: 50 })).toBe(hslToHex({ h: 0, s: 100, l: 50 }));
	});

	it("s=0 で彩度なしグレー", () => {
		const hex = hslToHex({ h: 180, s: 0, l: 50 });
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		expect(r).toBe(g);
		expect(g).toBe(b);
	});
});
