export {
	categoryForeground,
	categoryPalette,
	colors,
	spacing,
	fontFamily,
	fontSize,
	lineHeight,
	fontWeight,
	radius,
	type CategoryColorName,
	type CategoryPalette,
	type ColorScheme,
	type ColorToken,
	type SpacingToken,
	type FontFamilyToken,
	type FontSizeToken,
	type LineHeightToken,
	type FontWeightToken,
	type RadiusToken,
} from "./tokens";

/**
 * CSS 値文字列から数値を抽出する。React Native の StyleSheet で利用。
 * @example parseNumeric("16px") // 16
 * @example parseNumeric("1.5") // 1.5
 */
export function parseNumeric(value: string): number {
	const num = Number.parseFloat(value);
	if (Number.isNaN(num)) {
		throw new Error(`Cannot parse numeric value from "${value}"`);
	}
	return num;
}
