import { describe, expect, it } from "vitest";
import {
	type CategoryColorName,
	categoryPalette,
	generateDarkCategoryPalette,
} from "../src/tokens/category-palette";
import { hslToHex } from "../src/tokens/hsl";

describe("categoryPalette", () => {
	it("8 色を持つ", () => {
		expect(Object.keys(categoryPalette)).toHaveLength(8);
	});

	it("すべての値が HEX 形式", () => {
		for (const [key, value] of Object.entries(categoryPalette)) {
			expect(value, `${key}: ${value} は HEX であるべき`).toMatch(/^#[0-9A-F]{6}$/);
		}
	});

	it("必須カラー名がすべて存在する", () => {
		const requiredNames: CategoryColorName[] = [
			"rose",
			"terracotta",
			"sand",
			"sage",
			"teal",
			"slate",
			"mauve",
			"blush",
		];
		for (const name of requiredNames) {
			expect(categoryPalette).toHaveProperty(name);
		}
	});

	it("s:55, l:78 の淡いパステルに深み（黒文字が映える明るさ）", () => {
		for (const value of Object.values(categoryPalette)) {
			const r = Number.parseInt(value.slice(1, 3), 16);
			const g = Number.parseInt(value.slice(3, 5), 16);
			const b = Number.parseInt(value.slice(5, 7), 16);
			const avg = (r + g + b) / 3;
			// s:55, l:78 なので平均 RGB は 175〜215 の範囲
			expect(avg, `${value} の明るさが範囲外`).toBeGreaterThan(175);
			expect(avg, `${value} の明るさが範囲外`).toBeLessThan(215);
		}
	});
});

describe("generateDarkCategoryPalette", () => {
	const dark = generateDarkCategoryPalette(categoryPalette);

	it("8 色を持つ", () => {
		expect(Object.keys(dark)).toHaveLength(8);
	});

	it("Light と同じキーを持つ", () => {
		expect(Object.keys(dark).sort()).toEqual(Object.keys(categoryPalette).sort());
	});

	it("すべての値が HEX 形式", () => {
		for (const [key, value] of Object.entries(dark)) {
			expect(value, `${key}: ${value} は HEX であるべき`).toMatch(/^#[0-9A-F]{6}$/);
		}
	});

	it("Dark は Light よりやや深い (l:88→75)", () => {
		for (const key of Object.keys(categoryPalette) as CategoryColorName[]) {
			const lightR = Number.parseInt(categoryPalette[key].slice(1, 3), 16);
			const lightG = Number.parseInt(categoryPalette[key].slice(3, 5), 16);
			const lightB = Number.parseInt(categoryPalette[key].slice(5, 7), 16);
			const darkR = Number.parseInt(dark[key].slice(1, 3), 16);
			const darkG = Number.parseInt(dark[key].slice(3, 5), 16);
			const darkB = Number.parseInt(dark[key].slice(5, 7), 16);
			const lightLuminance = (lightR + lightG + lightB) / 3;
			const darkLuminance = (darkR + darkG + darkB) / 3;
			expect(
				darkLuminance,
				`${key}: Dark (${dark[key]}) は Light (${categoryPalette[key]}) よりやや深いべき`,
			).toBeLessThan(lightLuminance);
		}
	});
});
