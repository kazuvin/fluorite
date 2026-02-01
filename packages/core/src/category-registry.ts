import type { Category, CategoryDefinition } from "./category-schemas";

export class CategoryRegistry {
	private categories: Map<string, Category> = new Map();

	set(name: string, color: string): void {
		this.categories.set(name, { name, color });
	}

	get(name: string): Category | undefined {
		return this.categories.get(name);
	}

	getColor(name: string): string | undefined {
		return this.categories.get(name)?.color;
	}

	has(name: string): boolean {
		return this.categories.has(name);
	}

	delete(name: string): boolean {
		return this.categories.delete(name);
	}

	all(): Category[] {
		return [...this.categories.values()];
	}

	clear(): void {
		this.categories.clear();
	}

	serialize(): CategoryDefinition {
		return {
			version: 1,
			categories: this.all(),
		};
	}

	static deserialize(def: CategoryDefinition): CategoryRegistry {
		const registry = new CategoryRegistry();
		for (const category of def.categories) {
			registry.set(category.name, category.color);
		}
		return registry;
	}
}
