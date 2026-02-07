import { describe, expect, it } from "vitest";
import { hslToHex } from "../src/tokens/hsl";
import { type PaletteTokens, generateDarkPalette, lightPalette } from "../src/tokens/palette";

describe("lightPalette", () => {
	it("23 個のトークンを持つ", () => {
		expect(Object.keys(lightPalette)).toHaveLength(23);
	});

	it("すべての値が # で始まるか rgba 形式", () => {
		for (const [key, value] of Object.entries(lightPalette)) {
			expect(
				value.startsWith("#") || value.startsWith("rgba("),
				`${key}: ${value} は HEX か rgba であるべき`,
			).toBe(true);
		}
	});

	it("必須トークンがすべて存在する", () => {
		const requiredKeys: (keyof PaletteTokens)[] = [
			"background",
			"surface",
			"surfaceRaised",
			"text",
			"textMuted",
			"textOnPrimary",
			"primary",
			"primaryMuted",
			"secondary",
			"secondaryMuted",
			"destructive",
			"destructiveMuted",
			"success",
			"successMuted",
			"warning",
			"warningMuted",
			"info",
			"infoMuted",
			"border",
			"borderMuted",
			"icon",
			"iconMuted",
			"overlay",
		];
		for (const key of requiredKeys) {
			expect(lightPalette).toHaveProperty(key);
		}
	});

	it("primary は蛍石パープル系", () => {
		expect(lightPalette.primary).toBe(hslToHex({ h: 265, s: 60, l: 55 }));
	});

	it("textOnPrimary は白固定", () => {
		expect(lightPalette.textOnPrimary).toBe("#FFFFFF");
	});

	it("overlay は rgba 形式", () => {
		expect(lightPalette.overlay).toMatch(/^rgba\(/);
	});
});

describe("generateDarkPalette", () => {
	const dark = generateDarkPalette(lightPalette);

	it("23 個のトークンを持つ", () => {
		expect(Object.keys(dark)).toHaveLength(23);
	});

	it("Light と同じキーを持つ", () => {
		expect(Object.keys(dark).sort()).toEqual(Object.keys(lightPalette).sort());
	});

	it("background は暗い色になる (L: 99→8)", () => {
		const r = Number.parseInt(dark.background.slice(1, 3), 16);
		const g = Number.parseInt(dark.background.slice(3, 5), 16);
		const b = Number.parseInt(dark.background.slice(5, 7), 16);
		// 暗い背景: RGB がそれぞれ 30 未満
		expect(r).toBeLessThan(30);
		expect(g).toBeLessThan(30);
		expect(b).toBeLessThan(30);
	});

	it("text は明るい色になる (L: 12→92)", () => {
		const r = Number.parseInt(dark.text.slice(1, 3), 16);
		const g = Number.parseInt(dark.text.slice(3, 5), 16);
		const b = Number.parseInt(dark.text.slice(5, 7), 16);
		// 明るいテキスト: RGB がそれぞれ 200 以上
		expect(r).toBeGreaterThan(200);
		expect(g).toBeGreaterThan(200);
		expect(b).toBeGreaterThan(200);
	});

	it("textOnPrimary は白のまま固定", () => {
		expect(dark.textOnPrimary).toBe("#FFFFFF");
	});

	it("overlay は alpha が大きくなる (0.4→0.7)", () => {
		expect(dark.overlay).toMatch(/^rgba\(0,\s*0,\s*0,\s*0\.7\)$/);
	});

	it("すべての値が # で始まるか rgba 形式", () => {
		for (const [key, value] of Object.entries(dark)) {
			expect(
				value.startsWith("#") || value.startsWith("rgba("),
				`${key}: ${value} は HEX か rgba であるべき`,
			).toBe(true);
		}
	});
});
