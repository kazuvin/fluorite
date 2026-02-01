import { describe, expect, it } from "vitest";
import { parseDailyNote } from "../parser";
import type { DailyNote } from "../schemas";
import { serializeDailyNote } from "../serializer";

describe("serializeDailyNote", () => {
	it("エントリなしの DailyNote をシリアライズできる", () => {
		const note: DailyNote = { date: "2026-01-01", entries: [] };
		expect(serializeDailyNote(note)).toBe("# 2026-01-01\n");
	});

	it("終日イベントをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [{ title: "元日", allDay: true }],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [all-day] 元日
`,
		);
	});

	it("時刻イベントをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [{ title: "会議A", time: { start: "10:00", end: "12:00" } }],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [10:00 - 12:00] 会議A
`,
		);
	});

	it("開始時刻のみのイベントをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [{ title: "初詣", time: { start: "10:00" } }],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [10:00] 初詣
`,
		);
	});

	it("メモをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [{ title: "買い物メモ" }],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- 買い物メモ
`,
		);
	});

	it("タスクをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [
				{ title: "買い物", isTask: true, done: false },
				{ title: "掃除", isTask: true, done: true },
			],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [ ] 買い物
- [x] 掃除
`,
		);
	});

	it("タスク + 時刻をシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [
				{
					title: "会議A",
					time: { start: "10:00", end: "12:00" },
					isTask: true,
					done: false,
				},
			],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [ ] [10:00 - 12:00] 会議A
`,
		);
	});

	it("タグをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [
				{
					title: "会議A",
					time: { start: "10:00", end: "12:00" },
					tags: ["work", "important"],
				},
			],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [10:00 - 12:00] 会議A #work #important
`,
		);
	});

	it("メタデータをシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [
				{
					title: "会議A",
					time: { start: "10:00", end: "12:00" },
					metadata: { location: "会議室B", memo: "議事録" },
				},
			],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- [10:00 - 12:00] 会議A
  - location: 会議室B
  - memo: 議事録
`,
		);
	});

	it("body をシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			entries: [
				{
					title: "会議A",
					metadata: { memo: "議事録" },
					body: ["要件1が承認された", "スケジュールは来週再確認"],
				},
			],
		};
		expect(serializeDailyNote(note)).toBe(
			`# 2026-01-01

- 会議A
  - memo: 議事録
  - 要件1が承認された
  - スケジュールは来週再確認
`,
		);
	});

	it("frontmatter をシリアライズできる", () => {
		const note: DailyNote = {
			date: "2026-01-01",
			frontmatter: "timezone: America/New_York",
			entries: [{ title: "元日", allDay: true }],
		};
		expect(serializeDailyNote(note)).toBe(
			`---
timezone: America/New_York
---

# 2026-01-01

- [all-day] 元日
`,
		);
	});
});

describe("ラウンドトリップ", () => {
	it("パース → シリアライズ → パースで同じ結果になる", () => {
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
		const parsed1 = parseDailyNote(md);
		if (!parsed1) throw new Error("parsed1 is null");
		const serialized = serializeDailyNote(parsed1);
		const parsed2 = parseDailyNote(serialized);

		expect(parsed2).toEqual(parsed1);
	});
});
