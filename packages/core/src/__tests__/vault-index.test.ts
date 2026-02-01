import { describe, expect, it } from "vitest";
import type { DailyNote } from "../schemas";
import { VaultIndex } from "../vault-index";

// --- ヘルパー ---

function makeNote(
	date: string,
	entries: DailyNote["entries"] = [],
	frontmatter?: string,
): DailyNote {
	const note: DailyNote = { date, entries };
	if (frontmatter !== undefined) note.frontmatter = frontmatter;
	return note;
}

// --- テスト ---

describe("VaultIndex", () => {
	describe("インメモリ操作", () => {
		it("初期状態で size が 0", () => {
			const index = new VaultIndex();
			expect(index.size).toBe(0);
		});

		it("set でエントリを追加できる", () => {
			const index = new VaultIndex();
			const note = makeNote("2026-01-01");
			index.set("2026/01/2026-01-01.md", 1000, note);

			expect(index.size).toBe(1);
			expect(index.has("2026/01/2026-01-01.md")).toBe(true);
		});

		it("get でエントリを取得できる", () => {
			const index = new VaultIndex();
			const note = makeNote("2026-01-01");
			index.set("2026/01/2026-01-01.md", 1000, note);

			const entry = index.get("2026/01/2026-01-01.md");
			expect(entry).toEqual({
				path: "2026/01/2026-01-01.md",
				mtime: 1000,
				note,
			});
		});

		it("存在しないパスの get は undefined を返す", () => {
			const index = new VaultIndex();
			expect(index.get("nonexistent.md")).toBeUndefined();
		});

		it("set で既存エントリを上書きできる", () => {
			const index = new VaultIndex();
			const note1 = makeNote("2026-01-01", [{ title: "古い" }]);
			const note2 = makeNote("2026-01-01", [{ title: "新しい" }]);

			index.set("2026/01/2026-01-01.md", 1000, note1);
			index.set("2026/01/2026-01-01.md", 2000, note2);

			expect(index.size).toBe(1);
			expect(index.get("2026/01/2026-01-01.md")?.note.entries[0].title).toBe("新しい");
			expect(index.get("2026/01/2026-01-01.md")?.mtime).toBe(2000);
		});

		it("delete でエントリを削除できる", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));

			expect(index.delete("2026/01/2026-01-01.md")).toBe(true);
			expect(index.size).toBe(0);
			expect(index.has("2026/01/2026-01-01.md")).toBe(false);
		});

		it("存在しないパスの delete は false を返す", () => {
			const index = new VaultIndex();
			expect(index.delete("nonexistent.md")).toBe(false);
		});

		it("allEntries で全エントリを取得できる", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-02.md", 2000, makeNote("2026-01-02"));

			const all = index.allEntries();
			expect(all).toHaveLength(2);
		});
	});

	describe("クエリ: getByDate", () => {
		it("日付で DailyNote を取得できる", () => {
			const index = new VaultIndex();
			const note = makeNote("2026-01-15", [{ title: "テスト" }]);
			index.set("2026/01/2026-01-15.md", 1000, note);

			expect(index.getByDate("2026-01-15")).toEqual(note);
		});

		it("存在しない日付は undefined を返す", () => {
			const index = new VaultIndex();
			expect(index.getByDate("2026-12-31")).toBeUndefined();
		});
	});

	describe("クエリ: getByDateRange", () => {
		it("日付範囲で DailyNote を取得できる", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-05.md", 1000, makeNote("2026-01-05"));
			index.set("2026/01/2026-01-10.md", 1000, makeNote("2026-01-10"));
			index.set("2026/01/2026-01-15.md", 1000, makeNote("2026-01-15"));

			const results = index.getByDateRange("2026-01-03", "2026-01-12");
			expect(results).toHaveLength(2);
			expect(results[0].date).toBe("2026-01-05");
			expect(results[1].date).toBe("2026-01-10");
		});

		it("境界値を含む", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-31.md", 1000, makeNote("2026-01-31"));

			const results = index.getByDateRange("2026-01-01", "2026-01-31");
			expect(results).toHaveLength(2);
		});

		it("結果が日付順にソートされる", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-10.md", 1000, makeNote("2026-01-10"));
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-05.md", 1000, makeNote("2026-01-05"));

			const results = index.getByDateRange("2026-01-01", "2026-01-31");
			expect(results.map((r) => r.date)).toEqual(["2026-01-01", "2026-01-05", "2026-01-10"]);
		});

		it("該当なしで空配列を返す", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));

			expect(index.getByDateRange("2026-02-01", "2026-02-28")).toEqual([]);
		});
	});

	describe("クエリ: getByTag", () => {
		it("タグで DailyNote を検索できる", () => {
			const index = new VaultIndex();
			index.set(
				"2026/01/2026-01-01.md",
				1000,
				makeNote("2026-01-01", [{ title: "会議", tags: ["work"] }]),
			);
			index.set(
				"2026/01/2026-01-02.md",
				1000,
				makeNote("2026-01-02", [{ title: "散歩", tags: ["personal"] }]),
			);

			const results = index.getByTag("work");
			expect(results).toHaveLength(1);
			expect(results[0].date).toBe("2026-01-01");
		});

		it("複数のエントリに同じタグがある場合", () => {
			const index = new VaultIndex();
			index.set(
				"2026/01/2026-01-01.md",
				1000,
				makeNote("2026-01-01", [
					{ title: "朝会", tags: ["work"] },
					{ title: "昼会", tags: ["work"] },
				]),
			);

			const results = index.getByTag("work");
			expect(results).toHaveLength(1); // DailyNote 単位で1つ
		});

		it("該当なしで空配列を返す", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01", [{ title: "メモ" }]));

			expect(index.getByTag("nonexistent")).toEqual([]);
		});
	});

	describe("クエリ: getIncompleteTasks", () => {
		it("未完了タスクを取得できる", () => {
			const index = new VaultIndex();
			index.set(
				"2026/01/2026-01-01.md",
				1000,
				makeNote("2026-01-01", [
					{ title: "完了済み", isTask: true, done: true },
					{ title: "未完了", isTask: true, done: false },
					{ title: "メモ" },
				]),
			);

			const results = index.getIncompleteTasks();
			expect(results).toHaveLength(1);
			expect(results[0].entry.title).toBe("未完了");
			expect(results[0].date).toBe("2026-01-01");
		});

		it("複数日にまたがる未完了タスクを日付順で返す", () => {
			const index = new VaultIndex();
			index.set(
				"2026/01/2026-01-05.md",
				1000,
				makeNote("2026-01-05", [{ title: "タスクB", isTask: true, done: false }]),
			);
			index.set(
				"2026/01/2026-01-01.md",
				1000,
				makeNote("2026-01-01", [{ title: "タスクA", isTask: true, done: false }]),
			);

			const results = index.getIncompleteTasks();
			expect(results).toHaveLength(2);
			expect(results[0].date).toBe("2026-01-01");
			expect(results[1].date).toBe("2026-01-05");
		});

		it("未完了タスクがなければ空配列を返す", () => {
			const index = new VaultIndex();
			index.set(
				"2026/01/2026-01-01.md",
				1000,
				makeNote("2026-01-01", [{ title: "完了", isTask: true, done: true }]),
			);

			expect(index.getIncompleteTasks()).toEqual([]);
		});
	});

	describe("キャッシュ差分判定: computeStalePaths", () => {
		it("新規ファイルを toUpdate に含める", () => {
			const index = new VaultIndex();
			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];

			const { toUpdate, toRemove } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([{ path: "2026/01/2026-01-01.md", mtime: 1000 }]);
			expect(toRemove).toEqual([]);
		});

		it("mtime が新しいファイルを toUpdate に含める", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 2000 }];
			const { toUpdate } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([{ path: "2026/01/2026-01-01.md", mtime: 2000 }]);
		});

		it("mtime が同じファイルは toUpdate に含めない", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];
			const { toUpdate } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([]);
		});

		it("ファイルシステムから消えたエントリを toRemove に含める", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-02.md", 1000, makeNote("2026-01-02"));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];
			const { toRemove } = index.computeStalePaths(files);
			expect(toRemove).toEqual(["2026/01/2026-01-02.md"]);
		});

		it("空のファイルリストで全エントリを toRemove に含める", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));

			const { toUpdate, toRemove } = index.computeStalePaths([]);
			expect(toUpdate).toEqual([]);
			expect(toRemove).toEqual(["2026/01/2026-01-01.md"]);
		});

		it("複合ケース: 新規・更新・削除が混在", () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01")); // 変更なし
			index.set("2026/01/2026-01-02.md", 1000, makeNote("2026-01-02")); // 更新あり
			index.set("2026/01/2026-01-03.md", 1000, makeNote("2026-01-03")); // 削除

			const files = [
				{ path: "2026/01/2026-01-01.md", mtime: 1000 }, // 変更なし
				{ path: "2026/01/2026-01-02.md", mtime: 2000 }, // 更新
				{ path: "2026/01/2026-01-04.md", mtime: 1000 }, // 新規
			];

			const { toUpdate, toRemove } = index.computeStalePaths(files);
			expect(toUpdate).toHaveLength(2);
			expect(toUpdate.map((f) => f.path).sort()).toEqual([
				"2026/01/2026-01-02.md",
				"2026/01/2026-01-04.md",
			]);
			expect(toRemove).toEqual(["2026/01/2026-01-03.md"]);
		});
	});

	describe("applySync", () => {
		it("新規ファイルを読み込んで Index に追加する", async () => {
			const index = new VaultIndex();
			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];
			const readFile = async (path: string) => {
				if (path === "2026/01/2026-01-01.md") return "# 2026-01-01\n\n- 会議\n";
				return "";
			};

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.getByDate("2026-01-01")?.entries[0].title).toBe("会議");
			expect(result.updated).toEqual(["2026/01/2026-01-01.md"]);
			expect(result.removed).toEqual([]);
		});

		it("更新されたファイルのみ再パースする", async () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01", [{ title: "古い" }]));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 2000 }];
			const readFile = async (_path: string) => "# 2026-01-01\n\n- 新しい\n";

			await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.getByDate("2026-01-01")?.entries[0].title).toBe("新しい");
			expect(index.get("2026/01/2026-01-01.md")?.mtime).toBe(2000);
		});

		it("mtime が同じファイルは readFile を呼ばない", async () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01", [{ title: "元のまま" }]));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];
			let readCalled = false;
			const readFile = async (_path: string) => {
				readCalled = true;
				return "";
			};

			const result = await index.applySync(files, readFile);

			expect(readCalled).toBe(false);
			expect(index.getByDate("2026-01-01")?.entries[0].title).toBe("元のまま");
			expect(result.updated).toEqual([]);
			expect(result.removed).toEqual([]);
		});

		it("ファイルシステムから消えたエントリを削除する", async () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01"));
			index.set("2026/01/2026-01-02.md", 1000, makeNote("2026-01-02"));

			const files = [{ path: "2026/01/2026-01-01.md", mtime: 1000 }];
			const readFile = async (_path: string) => "";

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.has("2026/01/2026-01-02.md")).toBe(false);
			expect(result.removed).toEqual(["2026/01/2026-01-02.md"]);
		});

		it("パースに失敗したファイルはスキップする", async () => {
			const index = new VaultIndex();
			const files = [
				{ path: "2026/01/2026-01-01.md", mtime: 1000 },
				{ path: "2026/01/2026-01-02.md", mtime: 1000 },
			];
			const readFile = async (path: string) => {
				if (path === "2026/01/2026-01-01.md") return "不正なMarkdown";
				return "# 2026-01-02\n\n- OK\n";
			};

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.has("2026/01/2026-01-01.md")).toBe(false);
			expect(index.has("2026/01/2026-01-02.md")).toBe(true);
			expect(result.updated).toEqual(["2026/01/2026-01-02.md"]);
		});

		it("複合ケース: 新規・更新・削除が一括で処理される", async () => {
			const index = new VaultIndex();
			index.set("2026/01/2026-01-01.md", 1000, makeNote("2026-01-01", [{ title: "変更なし" }]));
			index.set("2026/01/2026-01-02.md", 1000, makeNote("2026-01-02", [{ title: "古い" }]));
			index.set("2026/01/2026-01-03.md", 1000, makeNote("2026-01-03")); // 削除対象

			const files = [
				{ path: "2026/01/2026-01-01.md", mtime: 1000 }, // 変更なし
				{ path: "2026/01/2026-01-02.md", mtime: 2000 }, // 更新
				{ path: "2026/01/2026-01-04.md", mtime: 1000 }, // 新規
			];
			const readFile = async (path: string) => {
				if (path === "2026/01/2026-01-02.md") return "# 2026-01-02\n\n- 更新済み\n";
				if (path === "2026/01/2026-01-04.md") return "# 2026-01-04\n\n- 新規\n";
				return "";
			};

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(3);
			expect(index.getByDate("2026-01-01")?.entries[0].title).toBe("変更なし");
			expect(index.getByDate("2026-01-02")?.entries[0].title).toBe("更新済み");
			expect(index.getByDate("2026-01-04")?.entries[0].title).toBe("新規");
			expect(index.has("2026/01/2026-01-03.md")).toBe(false);
			expect(result.updated.sort()).toEqual(["2026/01/2026-01-02.md", "2026/01/2026-01-04.md"]);
			expect(result.removed).toEqual(["2026/01/2026-01-03.md"]);
		});
	});

	describe("シリアライズ/デシリアライズ", () => {
		it("空の Index をシリアライズできる", () => {
			const index = new VaultIndex();
			expect(index.serialize()).toEqual({ version: 1, entries: [] });
		});

		it("エントリを含む Index をシリアライズできる", () => {
			const index = new VaultIndex();
			const note = makeNote("2026-01-01", [{ title: "テスト" }]);
			index.set("2026/01/2026-01-01.md", 1000, note);

			const cache = index.serialize();
			expect(cache.version).toBe(1);
			expect(cache.entries).toHaveLength(1);
			expect(cache.entries[0]).toEqual({
				path: "2026/01/2026-01-01.md",
				mtime: 1000,
				note,
			});
		});

		it("デシリアライズで VaultIndex を復元できる", () => {
			const note = makeNote("2026-01-01", [{ title: "テスト" }]);
			const cache = {
				version: 1 as const,
				entries: [{ path: "2026/01/2026-01-01.md", mtime: 1000, note }],
			};

			const index = VaultIndex.deserialize(cache);
			expect(index.size).toBe(1);
			expect(index.get("2026/01/2026-01-01.md")?.note).toEqual(note);
		});

		it("シリアライズ → デシリアライズのラウンドトリップ", () => {
			const index = new VaultIndex();
			const note1 = makeNote("2026-01-01", [{ title: "会議", tags: ["work"] }]);
			const note2 = makeNote("2026-01-02", [{ title: "買い物", isTask: true, done: false }]);
			index.set("2026/01/2026-01-01.md", 1000, note1);
			index.set("2026/01/2026-01-02.md", 2000, note2);

			const serialized = index.serialize();
			const restored = VaultIndex.deserialize(serialized);

			expect(restored.size).toBe(2);
			expect(restored.getByDate("2026-01-01")).toEqual(note1);
			expect(restored.getByDate("2026-01-02")).toEqual(note2);
		});
	});
});
