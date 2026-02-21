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

// accent (h:263, s:60, l:50) と同じ s/l で色相だけ変える（白文字が映える深めの色）
const lightHSL: Record<CategoryColorName, HSL> = {
	rose: { h: 0, s: 60, l: 50 },
	terracotta: { h: 25, s: 60, l: 50 },
	sand: { h: 45, s: 60, l: 50 },
	sage: { h: 140, s: 60, l: 50 },
	teal: { h: 185, s: 60, l: 50 },
	slate: { h: 215, s: 60, l: 50 },
	mauve: { h: 310, s: 60, l: 50 },
	blush: { h: 345, s: 60, l: 50 },
};

export const categoryPalette: CategoryPalette = Object.fromEntries(
	Object.entries(lightHSL).map(([key, hsl]) => [key, h(hsl)]),
) as CategoryPalette;

/**
 * Dark テーマ用カテゴリーパレットを生成する。
 * 既存の strong accent ルールと同じ (s+5, l+10)。
 */
export function generateDarkCategoryPalette(_light: CategoryPalette): CategoryPalette {
	return Object.fromEntries(
		Object.entries(lightHSL).map(([key, hsl]) => [
			key,
			h({
				h: hsl.h,
				s: Math.min(hsl.s + 5, 100),
				l: Math.min(hsl.l + 10, 100),
			}),
		]),
	) as CategoryPalette;
}
