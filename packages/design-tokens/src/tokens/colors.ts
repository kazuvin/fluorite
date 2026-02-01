export const colors = {
	light: {
		text: "#11181c",
		background: "#fff",
		muted: "#f1f3f5",
		tint: "#0a7ea4",
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: "#0a7ea4",
	},
	dark: {
		text: "#ecedee",
		background: "#151718",
		muted: "#2b2f31",
		tint: "#fff",
		icon: "#9ba1a6",
		tabIconDefault: "#9ba1a6",
		tabIconSelected: "#fff",
	},
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
