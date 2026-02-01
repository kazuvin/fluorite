import type { CategoryDefinition } from "./category-schemas";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function parseCategoryDefinition(markdown: string): CategoryDefinition | null {
	const trimmed = markdown.trim();
	if (trimmed === "") return null;

	const frontmatter = extractFrontmatter(trimmed);
	if (frontmatter === undefined) return null;

	const version = parseVersion(frontmatter);
	if (version === undefined) return null;

	const categories = parseCategories(frontmatter);
	if (categories === undefined) return null;

	return { version, categories };
}

function extractFrontmatter(markdown: string): string | undefined {
	if (!markdown.startsWith("---")) return undefined;

	const endIndex = markdown.indexOf("---", 3);
	if (endIndex === -1) return undefined;

	return markdown.slice(3, endIndex).trim();
}

function parseVersion(frontmatter: string): number | undefined {
	for (const line of frontmatter.split("\n")) {
		const match = line.match(/^version:\s*(\d+)$/);
		if (match) return Number(match[1]);
	}
	return undefined;
}

function parseCategories(frontmatter: string): CategoryDefinition["categories"] | undefined {
	const lines = frontmatter.split("\n");
	let inCategories = false;
	const categories: CategoryDefinition["categories"] = [];
	let currentName: string | undefined;

	for (const line of lines) {
		if (line.match(/^categories:\s*$/)) {
			inCategories = true;
			continue;
		}

		if (inCategories) {
			// 新しいトップレベルキーが来たら終了
			if (/^\w/.test(line)) {
				break;
			}

			const nameMatch = line.match(/^\s+-\s+name:\s*(.*)$/);
			if (nameMatch) {
				currentName = nameMatch[1].trim();
				continue;
			}

			const colorMatch = line.match(/^\s+color:\s*"?(#[^"]*)"?$/);
			if (colorMatch && currentName !== undefined) {
				const color = colorMatch[1];
				if (currentName.length > 0 && HEX_COLOR_PATTERN.test(color)) {
					categories.push({ name: currentName, color });
				}
				currentName = undefined;
			}
		}
	}

	if (!inCategories) return undefined;

	return categories.length > 0 ? categories : undefined;
}
