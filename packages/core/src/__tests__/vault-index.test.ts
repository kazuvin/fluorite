import { describe, expect, it } from "vitest";
import type { EventNote } from "../event-note-schemas";
import { VaultIndex } from "../vault-index";

// --- ヘルパー ---

function makeNote(
	title: string,
	start: string,
	end: string,
	opts?: Partial<Omit<EventNote, "title" | "start" | "end">>,
): EventNote {
	const note: EventNote = { title, start, end };
	if (opts?.allDay) note.allDay = opts.allDay;
	if (opts?.time) note.time = opts.time;
	if (opts?.tags) note.tags = opts.tags;
	if (opts?.body) note.body = opts.body;
	if (opts?.metadata) note.metadata = opts.metadata;
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
			const note = makeNote("会議", "2026-01-01", "2026-01-01");
			index.set("events/会議.md", 1000, note);

			expect(index.size).toBe(1);
			expect(index.has("events/会議.md")).toBe(true);
		});

		it("get でエントリを取得できる", () => {
			const index = new VaultIndex();
			const note = makeNote("会議", "2026-01-01", "2026-01-01");
			index.set("events/会議.md", 1000, note);

			const entry = index.get("events/会議.md");
			expect(entry).toEqual({
				path: "events/会議.md",
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
			const note1 = makeNote("古い会議", "2026-01-01", "2026-01-01");
			const note2 = makeNote("新しい会議", "2026-01-01", "2026-01-01");

			index.set("events/会議.md", 1000, note1);
			index.set("events/会議.md", 2000, note2);

			expect(index.size).toBe(1);
			expect(index.get("events/会議.md")?.note.title).toBe("新しい会議");
			expect(index.get("events/会議.md")?.mtime).toBe(2000);
		});

		it("delete でエントリを削除できる", () => {
			const index = new VaultIndex();
			index.set("events/会議.md", 1000, makeNote("会議", "2026-01-01", "2026-01-01"));

			expect(index.delete("events/会議.md")).toBe(true);
			expect(index.size).toBe(0);
			expect(index.has("events/会議.md")).toBe(false);
		});

		it("存在しないパスの delete は false を返す", () => {
			const index = new VaultIndex();
			expect(index.delete("nonexistent.md")).toBe(false);
		});

		it("allEntries で全エントリを取得できる", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 2000, makeNote("B", "2026-01-02", "2026-01-02"));

			const all = index.allEntries();
			expect(all).toHaveLength(2);
		});
	});

	describe("クエリ: getByDate", () => {
		it("指定日に含まれる EventNote を取得できる", () => {
			const index = new VaultIndex();
			const note = makeNote("会議", "2026-01-15", "2026-01-15");
			index.set("events/会議.md", 1000, note);

			const results = index.getByDate("2026-01-15");
			expect(results).toHaveLength(1);
			expect(results[0]).toEqual(note);
		});

		it("複数日にまたがるイベントの中間日でも取得できる", () => {
			const index = new VaultIndex();
			const note = makeNote("合宿", "2026-01-10", "2026-01-12");
			index.set("events/合宿.md", 1000, note);

			expect(index.getByDate("2026-01-10")).toHaveLength(1);
			expect(index.getByDate("2026-01-11")).toHaveLength(1);
			expect(index.getByDate("2026-01-12")).toHaveLength(1);
			expect(index.getByDate("2026-01-09")).toHaveLength(0);
			expect(index.getByDate("2026-01-13")).toHaveLength(0);
		});

		it("同一日に複数のイベントがある場合すべて返す", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-15", "2026-01-15"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-15", "2026-01-15"));

			expect(index.getByDate("2026-01-15")).toHaveLength(2);
		});

		it("存在しない日付は空配列を返す", () => {
			const index = new VaultIndex();
			expect(index.getByDate("2026-12-31")).toEqual([]);
		});
	});

	describe("クエリ: getByDateRange", () => {
		it("日付範囲にオーバーラップする EventNote を取得できる", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-05", "2026-01-07"));
			index.set("events/C.md", 1000, makeNote("C", "2026-01-10", "2026-01-10"));
			index.set("events/D.md", 1000, makeNote("D", "2026-01-15", "2026-01-15"));

			const results = index.getByDateRange("2026-01-03", "2026-01-12");
			expect(results).toHaveLength(2);
			expect(results.map((n) => n.title)).toContain("B");
			expect(results.map((n) => n.title)).toContain("C");
		});

		it("境界値を含む", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-31", "2026-01-31"));

			const results = index.getByDateRange("2026-01-01", "2026-01-31");
			expect(results).toHaveLength(2);
		});

		it("範囲の一部だけオーバーラップするイベントも含む", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2025-12-30", "2026-01-02"));

			const results = index.getByDateRange("2026-01-01", "2026-01-31");
			expect(results).toHaveLength(1);
		});

		it("結果が start 日付順にソートされる", () => {
			const index = new VaultIndex();
			index.set("events/C.md", 1000, makeNote("C", "2026-01-10", "2026-01-10"));
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-05", "2026-01-05"));

			const results = index.getByDateRange("2026-01-01", "2026-01-31");
			expect(results.map((r) => r.title)).toEqual(["A", "B", "C"]);
		});

		it("該当なしで空配列を返す", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));

			expect(index.getByDateRange("2026-02-01", "2026-02-28")).toEqual([]);
		});
	});

	describe("クエリ: getByTag", () => {
		it("タグで EventNote を検索できる", () => {
			const index = new VaultIndex();
			index.set(
				"events/A.md",
				1000,
				makeNote("会議", "2026-01-01", "2026-01-01", { tags: ["work"] }),
			);
			index.set(
				"events/B.md",
				1000,
				makeNote("散歩", "2026-01-02", "2026-01-02", { tags: ["personal"] }),
			);

			const results = index.getByTag("work");
			expect(results).toHaveLength(1);
			expect(results[0].title).toBe("会議");
		});

		it("該当なしで空配列を返す", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("メモ", "2026-01-01", "2026-01-01"));

			expect(index.getByTag("nonexistent")).toEqual([]);
		});

		it("結果が start 日付順にソートされる", () => {
			const index = new VaultIndex();
			index.set("events/B.md", 1000, makeNote("B", "2026-01-05", "2026-01-05", { tags: ["work"] }));
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01", { tags: ["work"] }));

			const results = index.getByTag("work");
			expect(results.map((r) => r.title)).toEqual(["A", "B"]);
		});
	});

	describe("キャッシュ差分判定: computeStalePaths", () => {
		it("新規ファイルを toUpdate に含める", () => {
			const index = new VaultIndex();
			const files = [{ path: "events/A.md", mtime: 1000 }];

			const { toUpdate, toRemove } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([{ path: "events/A.md", mtime: 1000 }]);
			expect(toRemove).toEqual([]);
		});

		it("mtime が新しいファイルを toUpdate に含める", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));

			const files = [{ path: "events/A.md", mtime: 2000 }];
			const { toUpdate } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([{ path: "events/A.md", mtime: 2000 }]);
		});

		it("mtime が同じファイルは toUpdate に含めない", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));

			const files = [{ path: "events/A.md", mtime: 1000 }];
			const { toUpdate } = index.computeStalePaths(files);
			expect(toUpdate).toEqual([]);
		});

		it("ファイルシステムから消えたエントリを toRemove に含める", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-02", "2026-01-02"));

			const files = [{ path: "events/A.md", mtime: 1000 }];
			const { toRemove } = index.computeStalePaths(files);
			expect(toRemove).toEqual(["events/B.md"]);
		});

		it("複合ケース: 新規・更新・削除が混在", () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-02", "2026-01-02"));
			index.set("events/C.md", 1000, makeNote("C", "2026-01-03", "2026-01-03"));

			const files = [
				{ path: "events/A.md", mtime: 1000 },
				{ path: "events/B.md", mtime: 2000 },
				{ path: "events/D.md", mtime: 1000 },
			];

			const { toUpdate, toRemove } = index.computeStalePaths(files);
			expect(toUpdate).toHaveLength(2);
			expect(toUpdate.map((f) => f.path).sort()).toEqual(["events/B.md", "events/D.md"]);
			expect(toRemove).toEqual(["events/C.md"]);
		});
	});

	describe("applySync", () => {
		it("新規ファイルを読み込んで Index に追加する", async () => {
			const index = new VaultIndex();
			const files = [{ path: "events/会議.md", mtime: 1000 }];
			const readFile = async (_path: string) => `---
start: 2026-01-01
end: 2026-01-01
---

# 会議
`;

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			const notes = index.getByDate("2026-01-01");
			expect(notes).toHaveLength(1);
			expect(notes[0].title).toBe("会議");
			expect(result.updated).toEqual(["events/会議.md"]);
			expect(result.removed).toEqual([]);
		});

		it("更新されたファイルのみ再パースする", async () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("古い", "2026-01-01", "2026-01-01"));

			const files = [{ path: "events/A.md", mtime: 2000 }];
			const readFile = async (_path: string) => `---
start: 2026-01-01
end: 2026-01-01
---

# 新しい
`;

			await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			const notes = index.getByDate("2026-01-01");
			expect(notes[0].title).toBe("新しい");
		});

		it("mtime が同じファイルは readFile を呼ばない", async () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("元のまま", "2026-01-01", "2026-01-01"));

			const files = [{ path: "events/A.md", mtime: 1000 }];
			let readCalled = false;
			const readFile = async (_path: string) => {
				readCalled = true;
				return "";
			};

			const result = await index.applySync(files, readFile);

			expect(readCalled).toBe(false);
			const notes = index.getByDate("2026-01-01");
			expect(notes[0].title).toBe("元のまま");
			expect(result.updated).toEqual([]);
			expect(result.removed).toEqual([]);
		});

		it("ファイルシステムから消えたエントリを削除する", async () => {
			const index = new VaultIndex();
			index.set("events/A.md", 1000, makeNote("A", "2026-01-01", "2026-01-01"));
			index.set("events/B.md", 1000, makeNote("B", "2026-01-02", "2026-01-02"));

			const files = [{ path: "events/A.md", mtime: 1000 }];
			const readFile = async (_path: string) => "";

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.has("events/B.md")).toBe(false);
			expect(result.removed).toEqual(["events/B.md"]);
		});

		it("パースに失敗したファイルはスキップする", async () => {
			const index = new VaultIndex();
			const files = [
				{ path: "events/A.md", mtime: 1000 },
				{ path: "events/B.md", mtime: 1000 },
			];
			const readFile = async (path: string) => {
				if (path === "events/A.md") return "不正なMarkdown";
				return `---
start: 2026-01-02
end: 2026-01-02
---

# OK
`;
			};

			const result = await index.applySync(files, readFile);

			expect(index.size).toBe(1);
			expect(index.has("events/A.md")).toBe(false);
			expect(index.has("events/B.md")).toBe(true);
			expect(result.updated).toEqual(["events/B.md"]);
		});
	});

	describe("シリアライズ/デシリアライズ", () => {
		it("空の Index をシリアライズできる", () => {
			const index = new VaultIndex();
			expect(index.serialize()).toEqual({ version: 1, entries: [] });
		});

		it("エントリを含む Index をシリアライズできる", () => {
			const index = new VaultIndex();
			const note = makeNote("テスト", "2026-01-01", "2026-01-01");
			index.set("events/テスト.md", 1000, note);

			const cache = index.serialize();
			expect(cache.version).toBe(1);
			expect(cache.entries).toHaveLength(1);
			expect(cache.entries[0]).toEqual({
				path: "events/テスト.md",
				mtime: 1000,
				note,
			});
		});

		it("デシリアライズで VaultIndex を復元できる", () => {
			const note = makeNote("テスト", "2026-01-01", "2026-01-01");
			const cache = {
				version: 1 as const,
				entries: [{ path: "events/テスト.md", mtime: 1000, note }],
			};

			const index = VaultIndex.deserialize(cache);
			expect(index.size).toBe(1);
			expect(index.get("events/テスト.md")?.note).toEqual(note);
		});

		it("シリアライズ → デシリアライズのラウンドトリップ", () => {
			const index = new VaultIndex();
			const note1 = makeNote("会議", "2026-01-01", "2026-01-01", { tags: ["work"] });
			const note2 = makeNote("旅行", "2026-01-10", "2026-01-12", { allDay: true });
			index.set("events/会議.md", 1000, note1);
			index.set("events/旅行.md", 2000, note2);

			const serialized = index.serialize();
			const restored = VaultIndex.deserialize(serialized);

			expect(restored.size).toBe(2);
			const jan1 = restored.getByDate("2026-01-01");
			expect(jan1).toHaveLength(1);
			expect(jan1[0].title).toBe("会議");
		});
	});
});
