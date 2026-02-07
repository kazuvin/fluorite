import { generateDarkPalette, lightPalette } from "./palette";

export const colors = {
	light: lightPalette,
	dark: generateDarkPalette(lightPalette),
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
