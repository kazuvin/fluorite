import { type HSL, hslToHex } from "./hsl";

export type PaletteTokens = {
	background: string;
	surface: string;
	surfaceRaised: string;
	card: string;
	cardForeground: string;
	text: string;
	textMuted: string;
	textOnPrimary: string;
	primary: string;
	primaryMuted: string;
	accent: string;
	accentMuted: string;
	destructive: string;
	destructiveMuted: string;
	success: string;
	successMuted: string;
	warning: string;
	warningMuted: string;
	info: string;
	infoMuted: string;
	border: string;
	borderMuted: string;
	icon: string;
	iconMuted: string;
	overlay: string;
};

const h = hslToHex;

export const lightPalette: PaletteTokens = {
	// Base
	background: h({ h: 263, s: 8, l: 96 }),
	surface: h({ h: 263, s: 12, l: 91 }),
	surfaceRaised: h({ h: 0, s: 0, l: 100 }),
	card: h({ h: 0, s: 0, l: 100 }),
	cardForeground: h({ h: 263, s: 8, l: 18 }),
	// Text
	text: h({ h: 263, s: 8, l: 18 }),
	textMuted: h({ h: 263, s: 8, l: 46 }),
	textOnPrimary: "#FFFFFF",
	// Primary (ニアブラック — モノトーン UI)
	primary: h({ h: 263, s: 10, l: 15 }),
	primaryMuted: h({ h: 263, s: 5, l: 95 }),
	// Accent (蛍石パープル — カテゴリと統一したパステルトーン)
	accent: h({ h: 263, s: 50, l: 82 }),
	accentMuted: h({ h: 263, s: 30, l: 94 }),
	// Status
	destructive: h({ h: 0, s: 65, l: 52 }),
	destructiveMuted: h({ h: 0, s: 40, l: 95 }),
	success: h({ h: 152, s: 55, l: 38 }),
	successMuted: h({ h: 152, s: 35, l: 93 }),
	warning: h({ h: 38, s: 85, l: 48 }),
	warningMuted: h({ h: 38, s: 50, l: 94 }),
	info: h({ h: 215, s: 65, l: 52 }),
	infoMuted: h({ h: 215, s: 40, l: 94 }),
	// UI
	border: h({ h: 263, s: 10, l: 86 }),
	borderMuted: h({ h: 263, s: 8, l: 92 }),
	icon: h({ h: 263, s: 8, l: 46 }),
	iconMuted: h({ h: 263, s: 6, l: 64 }),
	overlay: "rgba(0, 0, 0, 0.4)",
};

// Light HSL 定義（Dark 変換用の参照テーブル）
const lightHSL: Record<keyof PaletteTokens, HSL | null> = {
	background: { h: 263, s: 8, l: 96 },
	surface: { h: 263, s: 12, l: 91 },
	surfaceRaised: { h: 0, s: 0, l: 100 },
	card: { h: 0, s: 0, l: 100 },
	cardForeground: { h: 263, s: 8, l: 18 },
	text: { h: 263, s: 8, l: 18 },
	textMuted: { h: 263, s: 8, l: 46 },
	textOnPrimary: null,
	primary: { h: 263, s: 10, l: 15 },
	primaryMuted: { h: 263, s: 5, l: 95 },
	accent: { h: 263, s: 50, l: 82 },
	accentMuted: { h: 263, s: 30, l: 94 },
	destructive: { h: 0, s: 65, l: 52 },
	destructiveMuted: { h: 0, s: 40, l: 95 },
	success: { h: 152, s: 55, l: 38 },
	successMuted: { h: 152, s: 35, l: 93 },
	warning: { h: 38, s: 85, l: 48 },
	warningMuted: { h: 38, s: 50, l: 94 },
	info: { h: 215, s: 65, l: 52 },
	infoMuted: { h: 215, s: 40, l: 94 },
	border: { h: 263, s: 10, l: 86 },
	borderMuted: { h: 263, s: 8, l: 92 },
	icon: { h: 263, s: 8, l: 46 },
	iconMuted: { h: 263, s: 6, l: 64 },
	overlay: null,
};

// Strong accent トークン（L+10, S+5）— ステータス色用
const strongAccentKeys = new Set<keyof PaletteTokens>([
	"destructive",
	"success",
	"warning",
	"info",
]);

// Pastel (Muted) トークン（L→15, S×0.5）
const pastelKeys = new Set<keyof PaletteTokens>([
	"accentMuted",
	"destructiveMuted",
	"successMuted",
	"warningMuted",
	"infoMuted",
]);

export function generateDarkPalette(_light: PaletteTokens): PaletteTokens {
	const dark = {} as Record<keyof PaletteTokens, string>;

	for (const key of Object.keys(lightHSL) as (keyof PaletteTokens)[]) {
		const hsl = lightHSL[key];

		if (key === "textOnPrimary") {
			dark[key] = "#FFFFFF";
			continue;
		}

		if (key === "overlay") {
			dark[key] = "rgba(0, 0, 0, 0.7)";
			continue;
		}

		if (!hsl) continue;

		if (key === "primary") {
			// ニアブラック → ライトグレー（ダークモードで反転）
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s, l: 88 });
			continue;
		}
		if (key === "primaryMuted") {
			// ライトグレー → ダークグレー（ダークモードで反転）
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s, l: 15 });
			continue;
		}

		if (key === "accent") {
			// パステル accent: カテゴリと同じルール (s+5, l→75)
			dark[key] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 100), l: 75 });
			continue;
		}
		if (key === "background") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s, l: 8 });
		} else if (key === "surface") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.5, l: 12 });
		} else if (key === "surfaceRaised") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s, l: 16 });
		} else if (key === "card") {
			dark[key] = hslToHex({ h: 263, s: 8, l: 16 });
		} else if (key === "cardForeground") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.5, l: 92 });
		} else if (key === "text") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.5, l: 92 });
		} else if (key === "textMuted" || key === "icon") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.6, l: 58 });
		} else if (key === "iconMuted") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.5, l: 38 });
		} else if (key === "border") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.4, l: 22 });
		} else if (key === "borderMuted") {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.4, l: 18 });
		} else if (strongAccentKeys.has(key)) {
			dark[key] = hslToHex({
				h: hsl.h,
				s: Math.min(hsl.s + 5, 100),
				l: Math.min(hsl.l + 10, 100),
			});
		} else if (pastelKeys.has(key)) {
			dark[key] = hslToHex({ h: hsl.h, s: hsl.s * 0.5, l: 15 });
		} else {
			dark[key] = hslToHex(hsl);
		}
	}

	return dark as PaletteTokens;
}
