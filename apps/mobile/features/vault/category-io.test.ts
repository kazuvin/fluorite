import { CategoryRegistry } from "@fluorite/core";
import type { CategoryDefinition } from "@fluorite/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-file-system", () => ({
	getInfoAsync: vi.fn(),
	readAsStringAsync: vi.fn(),
	writeAsStringAsync: vi.fn(),
}));

import * as FileSystem from "expo-file-system";
import { loadCategories, saveCategories } from "./category-io";

const mocked = vi.mocked(FileSystem);

beforeEach(() => {
	vi.clearAllMocks();
});

const VAULT_DIR = "file:///data/documents/vault/";
const CATEGORIES_PATH = `${VAULT_DIR}.fluorite/categories.json`;

// ---------------------------------------------------------------------------
// loadCategories
// ---------------------------------------------------------------------------
describe("loadCategories", () => {
	it("ファイルが存在する場合: CategoryRegistry を返す", async () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [
				{ name: "work", color: "#AABBCC" },
				{ name: "personal", color: "#112233" },
			],
		};
		mocked.getInfoAsync.mockResolvedValue({
			exists: true,
			isDirectory: false,
			uri: CATEGORIES_PATH,
		});
		mocked.readAsStringAsync.mockResolvedValue(JSON.stringify(def));

		const result = await loadCategories(VAULT_DIR);

		expect(result).toBeInstanceOf(CategoryRegistry);
		expect(result?.all()).toEqual([
			{ name: "work", color: "#AABBCC" },
			{ name: "personal", color: "#112233" },
		]);
		expect(mocked.getInfoAsync).toHaveBeenCalledWith(CATEGORIES_PATH);
		expect(mocked.readAsStringAsync).toHaveBeenCalledWith(CATEGORIES_PATH);
	});

	it("ファイルが存在しない場合: null を返す", async () => {
		mocked.getInfoAsync.mockResolvedValue({
			exists: false,
			isDirectory: false,
			uri: CATEGORIES_PATH,
		});

		const result = await loadCategories(VAULT_DIR);

		expect(result).toBeNull();
		expect(mocked.readAsStringAsync).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
// saveCategories
// ---------------------------------------------------------------------------
describe("saveCategories", () => {
	it("CategoryRegistry を JSON ファイルとして書き込む", async () => {
		const registry = new CategoryRegistry();
		registry.set("work", "#AABBCC");
		registry.set("personal", "#112233");

		await saveCategories(VAULT_DIR, registry);

		const expectedJson = JSON.stringify(registry.serialize());
		expect(mocked.writeAsStringAsync).toHaveBeenCalledWith(CATEGORIES_PATH, expectedJson);
	});
});
