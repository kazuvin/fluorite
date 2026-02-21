import { categoryPalette, generateDarkCategoryPalette } from "./category-palette";
import { generateDarkPalette, lightPalette } from "./palette";

export const colors = {
	light: { ...lightPalette, ...prefixKeys(categoryPalette, "category") },
	dark: {
		...generateDarkPalette(lightPalette),
		...prefixKeys(generateDarkCategoryPalette(categoryPalette), "category"),
	},
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;

function prefixKeys<T extends Record<string, string>>(
	obj: T,
	prefix: string,
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [
			`${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`,
			value,
		]),
	);
}
