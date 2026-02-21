export const fontFamily = {
	sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export type FontFamilyToken = keyof typeof fontFamily;

export const fontSize = {
	xs: "12px",
	sm: "14px",
	base: "16px",
	lg: "18px",
	xl: "20px",
	"2xl": "24px",
	"3xl": "32px",
} as const;

export const lineHeight = {
	tight: "1.25",
	normal: "1.5",
	relaxed: "1.75",
} as const;

export const fontWeight = {
	normal: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type LineHeightToken = keyof typeof lineHeight;
export type FontWeightToken = keyof typeof fontWeight;
