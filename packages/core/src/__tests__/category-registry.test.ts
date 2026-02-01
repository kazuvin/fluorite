import { describe, expect, it } from "vitest";
import { CategoryRegistry } from "../category-registry";
import type { Category, CategoryDefinition } from "../category-schemas";

describe("CategoryRegistry", () => {
	it("初期状態で all() は空配列を返す", () => {
		const registry = new CategoryRegistry();
		expect(registry.all()).toEqual([]);
	});

	it("set/get でカテゴリーを追加・取得できる", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");

		const category = registry.get("仕事");
		expect(category).toEqual({ name: "仕事", color: "#FF0000" });
	});

	it("getColor で色だけ取得できる", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");

		expect(registry.getColor("仕事")).toBe("#FF0000");
	});

	it("存在しないカテゴリーで get は undefined を返す", () => {
		const registry = new CategoryRegistry();
		expect(registry.get("存在しない")).toBeUndefined();
	});

	it("存在しないカテゴリーで getColor は undefined を返す", () => {
		const registry = new CategoryRegistry();
		expect(registry.getColor("存在しない")).toBeUndefined();
	});

	it("has で存在確認できる", () => {
		const registry = new CategoryRegistry();
		expect(registry.has("仕事")).toBe(false);

		registry.set("仕事", "#FF0000");
		expect(registry.has("仕事")).toBe(true);
	});

	it("delete で削除できる", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");

		const result = registry.delete("仕事");
		expect(result).toBe(true);
		expect(registry.has("仕事")).toBe(false);
	});

	it("delete で存在しないカテゴリーを削除すると false を返す", () => {
		const registry = new CategoryRegistry();
		expect(registry.delete("存在しない")).toBe(false);
	});

	it("set で同名のカテゴリーを上書きできる", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");
		registry.set("仕事", "#00FF00");

		expect(registry.getColor("仕事")).toBe("#00FF00");
		expect(registry.all()).toHaveLength(1);
	});

	it("clear で全削除できる", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");
		registry.set("趣味", "#00FF00");

		registry.clear();
		expect(registry.all()).toEqual([]);
	});

	it("all() は全カテゴリーを返す", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");
		registry.set("趣味", "#00FF00");
		registry.set("家事", "#0000FF");

		const categories = registry.all();
		expect(categories).toHaveLength(3);
		expect(categories).toContainEqual({ name: "仕事", color: "#FF0000" });
		expect(categories).toContainEqual({ name: "趣味", color: "#00FF00" });
		expect(categories).toContainEqual({ name: "家事", color: "#0000FF" });
	});

	it("serialize() で CategoryDefinition を返す", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");
		registry.set("趣味", "#00FF00");

		const def = registry.serialize();
		expect(def.version).toBe(1);
		expect(def.categories).toHaveLength(2);
		expect(def.categories).toContainEqual({ name: "仕事", color: "#FF0000" });
		expect(def.categories).toContainEqual({ name: "趣味", color: "#00FF00" });
	});

	it("deserialize() で CategoryRegistry を復元できる", () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [
				{ name: "仕事", color: "#FF0000" },
				{ name: "趣味", color: "#00FF00" },
			],
		};

		const registry = CategoryRegistry.deserialize(def);
		expect(registry.get("仕事")).toEqual({ name: "仕事", color: "#FF0000" });
		expect(registry.get("趣味")).toEqual({ name: "趣味", color: "#00FF00" });
		expect(registry.all()).toHaveLength(2);
	});

	it("serialize → deserialize のラウンドトリップ", () => {
		const registry = new CategoryRegistry();
		registry.set("仕事", "#FF0000");
		registry.set("趣味", "#00FF00");
		registry.set("家事", "#0000FF");

		const restored = CategoryRegistry.deserialize(registry.serialize());

		expect(restored.all()).toHaveLength(3);
		expect(restored.get("仕事")).toEqual(registry.get("仕事"));
		expect(restored.get("趣味")).toEqual(registry.get("趣味"));
		expect(restored.get("家事")).toEqual(registry.get("家事"));
	});
});
