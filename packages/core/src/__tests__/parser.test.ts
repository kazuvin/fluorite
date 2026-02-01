import { describe, expect, it } from "vitest";
import { parseDailyNote } from "../parser";

describe("parseDailyNote", () => {
	it("空文字列を渡すと entries が空の DailyNote を返さない", () => {
		expect(parseDailyNote("")).toBeNull();
	});

	it("日付見出しのみのノートをパースできる", () => {
		const result = parseDailyNote("# 2026-01-01\n");
		expect(result).toEqual({
			date: "2026-01-01",
			entries: [],
		});
	});

	it("終日イベントをパースできる", () => {
		const md = `# 2026-01-01

- [all-day] 元日
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "元日", allDay: true }]);
	});

	it("開始時刻のみのイベントをパースできる", () => {
		const md = `# 2026-01-01

- [10:00] 初詣
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "初詣", time: { start: "10:00" } }]);
	});

	it("時間範囲のあるイベントをパースできる", () => {
		const md = `# 2026-01-01

- [10:00 - 12:00] 会議A
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "会議A", time: { start: "10:00", end: "12:00" } }]);
	});

	it("メモ（ブラケットなし）をパースできる", () => {
		const md = `# 2026-01-01

- 買い物メモ
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "買い物メモ" }]);
	});

	it("タスクをパースできる", () => {
		const md = `# 2026-01-01

- [ ] 買い物
- [x] 掃除
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([
			{ title: "買い物", isTask: true, done: false },
			{ title: "掃除", isTask: true, done: true },
		]);
	});

	it("タスク + 時刻をパースできる", () => {
		const md = `# 2026-01-01

- [ ] [10:00 - 12:00] 会議A
- [x] [09:00] 朝会
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([
			{
				title: "会議A",
				time: { start: "10:00", end: "12:00" },
				isTask: true,
				done: false,
			},
			{
				title: "朝会",
				time: { start: "09:00" },
				isTask: true,
				done: true,
			},
		]);
	});

	it("タスク + 終日をパースできる", () => {
		const md = `# 2026-01-01

- [ ] [all-day] 大掃除
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "大掃除", allDay: true, isTask: true, done: false }]);
	});

	it("インラインタグをパースできる", () => {
		const md = `# 2026-01-01

- [10:00 - 12:00] 会議A #work #important
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([
			{
				title: "会議A",
				time: { start: "10:00", end: "12:00" },
				tags: ["work", "important"],
			},
		]);
	});

	it("数字始まりの # はタグとして認識しない", () => {
		const md = `# 2026-01-01

- レビュー: PR #123 の確認 #work
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "レビュー: PR #123 の確認", tags: ["work"] }]);
	});

	it("C# のようにスペースなしの # はタグとして認識しない", () => {
		const md = `# 2026-01-01

- C#の勉強会 #work
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([{ title: "C#の勉強会", tags: ["work"] }]);
	});

	it("メタデータをパースできる", () => {
		const md = `# 2026-01-01

- [10:00 - 12:00] 会議A #work
  - location: 会議室B
  - memo: 先方との機能要件のすり合わせ
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([
			{
				title: "会議A",
				time: { start: "10:00", end: "12:00" },
				tags: ["work"],
				metadata: {
					location: "会議室B",
					memo: "先方との機能要件のすり合わせ",
				},
			},
		]);
	});

	it("自由記述の body をパースできる", () => {
		const md = `# 2026-01-01

- [10:00 - 12:00] 会議A
  - memo: 議事録
  - 要件1が承認された
  - スケジュールは来週再確認
`;
		const result = parseDailyNote(md);
		expect(result?.entries).toEqual([
			{
				title: "会議A",
				time: { start: "10:00", end: "12:00" },
				metadata: { memo: "議事録" },
				body: ["要件1が承認された", "スケジュールは来週再確認"],
			},
		]);
	});

	it("frontmatter をパースできる", () => {
		const md = `---
timezone: America/New_York
---

# 2026-01-01

- [all-day] 元日
`;
		const result = parseDailyNote(md);
		expect(result?.frontmatter).toBe("timezone: America/New_York");
		expect(result?.date).toBe("2026-01-01");
		expect(result?.entries).toEqual([{ title: "元日", allDay: true }]);
	});

	it("複合的な Daily Note をパースできる", () => {
		const md = `---
timezone: America/New_York
---

# 2026-01-01

- [all-day] 元日 #holiday
- [10:00] 初詣 #personal
  - location: 明治神宮
- [10:00 - 12:00] 会議A #work
  - memo: 先方との機能要件のすり合わせ
  - location: 会議室B
  - url: https://meet.google.com/xxx
- [ ] お年玉を用意する #personal
- [ ] [14:00 - 15:00] レビュー会 #work
- [x] [09:00] 朝会 #work
- [ ] [all-day] 大掃除 #personal
`;
		const result = parseDailyNote(md);

		expect(result?.frontmatter).toBe("timezone: America/New_York");
		expect(result?.date).toBe("2026-01-01");
		expect(result?.entries).toHaveLength(7);

		expect(result?.entries[0]).toEqual({
			title: "元日",
			allDay: true,
			tags: ["holiday"],
		});
		expect(result?.entries[1]).toEqual({
			title: "初詣",
			time: { start: "10:00" },
			tags: ["personal"],
			metadata: { location: "明治神宮" },
		});
		expect(result?.entries[2]).toEqual({
			title: "会議A",
			time: { start: "10:00", end: "12:00" },
			tags: ["work"],
			metadata: {
				memo: "先方との機能要件のすり合わせ",
				location: "会議室B",
				url: "https://meet.google.com/xxx",
			},
		});
		expect(result?.entries[3]).toEqual({
			title: "お年玉を用意する",
			isTask: true,
			done: false,
			tags: ["personal"],
		});
		expect(result?.entries[4]).toEqual({
			title: "レビュー会",
			time: { start: "14:00", end: "15:00" },
			isTask: true,
			done: false,
			tags: ["work"],
		});
		expect(result?.entries[5]).toEqual({
			title: "朝会",
			time: { start: "09:00" },
			isTask: true,
			done: true,
			tags: ["work"],
		});
		expect(result?.entries[6]).toEqual({
			title: "大掃除",
			allDay: true,
			isTask: true,
			done: false,
			tags: ["personal"],
		});
	});
});
