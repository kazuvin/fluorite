import type { CategoryDefinition } from "./category-schemas";

export function serializeCategoryDefinition(def: CategoryDefinition): string {
	const lines: string[] = [];

	lines.push("---");
	lines.push(`version: ${def.version}`);
	lines.push("categories:");

	for (const category of def.categories) {
		lines.push(`  - name: ${category.name}`);
		lines.push(`    color: "${category.color}"`);
	}

	lines.push("---");
	lines.push("");

	return lines.join("\n");
}
