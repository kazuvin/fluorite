import { colors } from "./tokens/colors";
import { radius } from "./tokens/radius";
import { spacing } from "./tokens/spacing";
import { fontSize, fontWeight, lineHeight } from "./tokens/typography";

function formatEntries(entries: Record<string, string>, prefix: string): string {
	return Object.entries(entries)
		.map(([key, value]) => `\t--${prefix}-${key}: ${value};`)
		.join("\n");
}

/**
 * Tailwind v4 の @theme ブロック用 CSS を生成する。
 * light テーマをデフォルトとし、dark テーマは prefers-color-scheme で切り替える。
 */
export function generateThemeCSS(): string {
	const lines: string[] = [];

	// @theme block for Tailwind v4
	lines.push("@theme {");
	lines.push(formatEntries(spacing, "spacing"));
	lines.push(formatEntries(fontSize, "font-size"));
	lines.push(formatEntries(lineHeight, "line-height"));
	lines.push(formatEntries(fontWeight, "font-weight"));
	lines.push(formatEntries(radius, "radius"));
	lines.push("");
	lines.push("\t/* Light theme colors (default) */");
	lines.push(formatEntries(colors.light, "color"));
	lines.push("}");

	lines.push("");

	// Dark mode override
	lines.push("@media (prefers-color-scheme: dark) {");
	lines.push("\t:root {");
	for (const [key, value] of Object.entries(colors.dark)) {
		lines.push(`\t\t--color-${key}: ${value};`);
	}
	lines.push("\t}");
	lines.push("}");

	return `${lines.join("\n")}\n`;
}
