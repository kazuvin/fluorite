import { describe, expect, it } from "vitest";
import { parseCategoryDefinition } from "../category-definition-parser";
import { serializeCategoryDefinition } from "../category-definition-serializer";
import type { CategoryDefinition } from "../category-schemas";

describe("serializeCategoryDefinition", () => {
	it("単一カテゴリーの CategoryDefinition をシリアライズできる", () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [{ name: "work", color: "#4A90D9" }],
		};
		const result = serializeCategoryDefinition(def);
		expect(result).toBe(`---
version: 1
categories:
  - name: work
    color: "#4A90D9"
---
`);
	});

	it("複数カテゴリーの CategoryDefinition をシリアライズできる", () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [
				{ name: "work", color: "#4A90D9" },
				{ name: "personal", color: "#50C878" },
			],
		};
		const result = serializeCategoryDefinition(def);
		expect(result).toBe(`---
version: 1
categories:
  - name: work
    color: "#4A90D9"
  - name: personal
    color: "#50C878"
---
`);
	});

	it("空の categories 配列をシリアライズできる", () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [],
		};
		const result = serializeCategoryDefinition(def);
		expect(result).toBe(`---
version: 1
categories:
---
`);
	});

	it("parseCategoryDefinition とのラウンドトリップ: serialize → parse で元に戻る", () => {
		const def: CategoryDefinition = {
			version: 1,
			categories: [
				{ name: "work", color: "#4A90D9" },
				{ name: "personal", color: "#50C878" },
			],
		};
		const serialized = serializeCategoryDefinition(def);
		const parsed = parseCategoryDefinition(serialized);
		expect(parsed).toEqual(def);
	});

	it("parseCategoryDefinition → serialize のラウンドトリップ: parse → serialize → parse で一致", () => {
		const markdown = `---
version: 1
categories:
  - name: work
    color: "#4A90D9"
  - name: personal
    color: "#50C878"
---
`;
		const parsed = parseCategoryDefinition(markdown);
		expect(parsed).not.toBeNull();
		// biome-ignore lint/style/noNonNullAssertion: テストで null でないことを直前に検証済み
		const serialized = serializeCategoryDefinition(parsed!);
		const reparsed = parseCategoryDefinition(serialized);
		expect(reparsed).toEqual(parsed);
	});
});
