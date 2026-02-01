import { describe, expect, it } from "vitest";
import { parseCategoryDefinition } from "../category-definition-parser";

describe("parseCategoryDefinition", () => {
	it("基本的なカテゴリー定義をパースできる（1カテゴリー）", () => {
		const md = `---
version: 1
categories:
  - name: work
    color: "#4A90D9"
---

# カテゴリー定義
`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 1,
			categories: [{ name: "work", color: "#4A90D9" }],
		});
	});

	it("複数カテゴリーをパースできる", () => {
		const md = `---
version: 1
categories:
  - name: work
    color: "#4A90D9"
  - name: personal
    color: "#50C878"
  - name: holiday
    color: "#FF6B6B"
---

# カテゴリー定義
`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 1,
			categories: [
				{ name: "work", color: "#4A90D9" },
				{ name: "personal", color: "#50C878" },
				{ name: "holiday", color: "#FF6B6B" },
			],
		});
	});

	it("version を認識する", () => {
		const md = `---
version: 2
categories:
  - name: work
    color: "#4A90D9"
---
`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 2,
			categories: [{ name: "work", color: "#4A90D9" }],
		});
	});

	it("body がなくてもパースできる", () => {
		const md = `---
version: 1
categories:
  - name: work
    color: "#4A90D9"
---`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 1,
			categories: [{ name: "work", color: "#4A90D9" }],
		});
	});

	it("空文字列で null を返す", () => {
		expect(parseCategoryDefinition("")).toBeNull();
	});

	it("frontmatter なしで null を返す", () => {
		const md = `# カテゴリー定義

これはただのテキスト`;
		expect(parseCategoryDefinition(md)).toBeNull();
	});

	it("version がない場合 null を返す", () => {
		const md = `---
categories:
  - name: work
    color: "#4A90D9"
---`;
		expect(parseCategoryDefinition(md)).toBeNull();
	});

	it("categories がない場合 null を返す", () => {
		const md = `---
version: 1
---`;
		expect(parseCategoryDefinition(md)).toBeNull();
	});

	it("無効な color 形式のカテゴリーはスキップする", () => {
		const md = `---
version: 1
categories:
  - name: work
    color: "#4A90D9"
  - name: invalid
    color: "red"
  - name: personal
    color: "#50C878"
---`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 1,
			categories: [
				{ name: "work", color: "#4A90D9" },
				{ name: "personal", color: "#50C878" },
			],
		});
	});

	it("name が空のカテゴリーはスキップする", () => {
		const md = `---
version: 1
categories:
  - name:
    color: "#4A90D9"
  - name: personal
    color: "#50C878"
---`;
		const result = parseCategoryDefinition(md);
		expect(result).toEqual({
			version: 1,
			categories: [{ name: "personal", color: "#50C878" }],
		});
	});
});
