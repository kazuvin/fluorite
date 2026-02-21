import { type HSL, hslToHex } from "./hsl";

export type CategoryColorName =
	| "rose"
	| "terracotta"
	| "sand"
	| "sage"
	| "teal"
	| "slate"
	| "mauve"
	| "blush";

export type CategoryPalette = Record<CategoryColorName, string>;

const h = hslToHex;

// 淡いパステルに深みを加えた色（s:55, l:78 — accent と統一）
const lightHSL: Record<CategoryColorName, HSL> = {
	rose: { h: 0, s: 55, l: 78 },
	terracotta: { h: 25, s: 55, l: 78 },
	sand: { h: 45, s: 55, l: 78 },
	sage: { h: 140, s: 55, l: 78 },
	teal: { h: 185, s: 55, l: 78 },
	slate: { h: 215, s: 55, l: 78 },
	mauve: { h: 310, s: 55, l: 78 },
	blush: { h: 345, s: 55, l: 78 },
};

export const categoryPalette: CategoryPalette = Object.fromEntries(
	Object.entries(lightHSL).map(([key, hsl]) => [key, h(hsl)]),
) as CategoryPalette;

/**
 * Dark テーマ用カテゴリーパレットを生成する。
 * ダーク背景でやや深めだが黒文字が読めるパステル (s+5, l→71)。
 */
/** カテゴリ背景上のテキスト色（パステル背景に合うソフトダーク） */
export const categoryForeground = hslToHex({ h: 263, s: 10, l: 35 });

export function generateDarkCategoryPalette(_light: CategoryPalette): CategoryPalette {
	return Object.fromEntries(
		Object.entries(lightHSL).map(([key, hsl]) => [
			key,
			h({
				h: hsl.h,
				s: Math.min(hsl.s + 5, 100),
				l: 71,
			}),
		]),
	) as CategoryPalette;
}
