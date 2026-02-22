import { CategoryRegistry } from "@fluorite/core";
import type { CategoryDefinition } from "@fluorite/core";
import * as FileSystem from "expo-file-system";

const CATEGORIES_FILE = ".fluorite/categories.json";

export async function loadCategories(vaultDir: string): Promise<CategoryRegistry | null> {
	const path = `${vaultDir}${CATEGORIES_FILE}`;
	const info = await FileSystem.getInfoAsync(path);
	if (!info.exists) {
		return null;
	}
	const raw = await FileSystem.readAsStringAsync(path);
	const parsed: CategoryDefinition = JSON.parse(raw);
	return CategoryRegistry.deserialize(parsed);
}

export async function saveCategories(vaultDir: string, registry: CategoryRegistry): Promise<void> {
	const path = `${vaultDir}${CATEGORIES_FILE}`;
	const json = JSON.stringify(registry.serialize());
	await FileSystem.writeAsStringAsync(path, json);
}
