import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { CategoryDefinitionSchema, CategorySchema } from "../category-schemas";

describe("CategorySchema", () => {
	it("有効な Category をバリデーションできる", () => {
		const result = v.safeParse(CategorySchema, {
			name: "work",
			color: "#4A90D9",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output).toEqual({ name: "work", color: "#4A90D9" });
		}
	});

	it("name が空文字の場合はバリデーション失敗", () => {
		const result = v.safeParse(CategorySchema, {
			name: "",
			color: "#4A90D9",
		});
		expect(result.success).toBe(false);
	});

	it("color が有効な 6桁 hex (#FFFFFF 形式) であること", () => {
		const validColors = ["#000000", "#FFFFFF", "#4A90D9", "#abcdef"];
		for (const color of validColors) {
			const result = v.safeParse(CategorySchema, {
				name: "test",
				color,
			});
			expect(result.success).toBe(true);
		}
	});

	it("無効な color を拒否する", () => {
		const invalidColors = ["#12345", "red", "", "#GGGGGG"];
		for (const color of invalidColors) {
			const result = v.safeParse(CategorySchema, {
				name: "test",
				color,
			});
			expect(result.success).toBe(false);
		}
	});
});

describe("CategoryDefinitionSchema", () => {
	it("有効な CategoryDefinition をバリデーションできる", () => {
		const result = v.safeParse(CategoryDefinitionSchema, {
			version: 1,
			categories: [
				{ name: "work", color: "#4A90D9" },
				{ name: "personal", color: "#FF6B6B" },
			],
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output).toEqual({
				version: 1,
				categories: [
					{ name: "work", color: "#4A90D9" },
					{ name: "personal", color: "#FF6B6B" },
				],
			});
		}
	});

	it("空の categories 配列も許容する", () => {
		const result = v.safeParse(CategoryDefinitionSchema, {
			version: 1,
			categories: [],
		});
		expect(result.success).toBe(true);
	});

	it("version が整数 >= 1 であること", () => {
		const invalidVersions = [0, -1, 0.5, 1.5];
		for (const version of invalidVersions) {
			const result = v.safeParse(CategoryDefinitionSchema, {
				version,
				categories: [],
			});
			expect(result.success).toBe(false);
		}

		const result = v.safeParse(CategoryDefinitionSchema, {
			version: 1,
			categories: [],
		});
		expect(result.success).toBe(true);
	});
});
