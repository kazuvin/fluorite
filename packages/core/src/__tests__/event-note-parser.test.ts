import { describe, expect, it } from "vitest";
import { parseEventNote } from "../event-note-parser";

describe("parseEventNote", () => {
	it("終日イベント（allDay + tags）をパースできる", () => {
		const md = `---
start: 2026-01-01
end: 2026-01-03
allDay: true
tags:
  - personal
---

# 正月休み

家族で過ごす`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "正月休み",
			start: "2026-01-01",
			end: "2026-01-03",
			allDay: true,
			tags: ["personal"],
			body: "家族で過ごす",
		});
	});

	it("時刻指定イベント（time range）をパースできる", () => {
		const md = `---
start: 2026-02-14
end: 2026-02-14
time: "09:00 - 17:00"
tags:
  - work
---

# カンファレンス`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "カンファレンス",
			start: "2026-02-14",
			end: "2026-02-14",
			time: { start: "09:00", end: "17:00" },
			tags: ["work"],
		});
	});

	it("開始時刻のみのイベントをパースできる", () => {
		const md = `---
start: 2026-03-01
end: 2026-03-01
time: "10:00"
---

# 歯医者`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "歯医者",
			start: "2026-03-01",
			end: "2026-03-01",
			time: { start: "10:00" },
		});
	});

	it("body ありのイベントをパースできる", () => {
		const md = `---
start: 2026-01-10
end: 2026-01-12
allDay: true
---

# 合宿

チームビルディング
場所は箱根`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "合宿",
			start: "2026-01-10",
			end: "2026-01-12",
			allDay: true,
			body: "チームビルディング\n場所は箱根",
		});
	});

	it("body なしのイベントをパースできる", () => {
		const md = `---
start: 2026-01-01
end: 2026-01-01
allDay: true
---

# 元日`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "元日",
			start: "2026-01-01",
			end: "2026-01-01",
			allDay: true,
		});
	});

	it("tags なしのイベントをパースできる", () => {
		const md = `---
start: 2026-04-01
end: 2026-04-03
allDay: true
---

# 出張

大阪オフィス`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "出張",
			start: "2026-04-01",
			end: "2026-04-03",
			allDay: true,
			body: "大阪オフィス",
		});
	});

	it("空文字列で null を返す", () => {
		expect(parseEventNote("")).toBeNull();
	});

	it("frontmatter なしで null を返す", () => {
		const md = `# タイトルだけ

本文テキスト`;
		expect(parseEventNote(md)).toBeNull();
	});

	it("start/end 欠落で null を返す", () => {
		const md = `---
allDay: true
tags:
  - personal
---

# タイトル`;
		expect(parseEventNote(md)).toBeNull();
	});

	it("metadata 付きイベントをパースできる", () => {
		const md = `---
start: 2026-01-01
end: 2026-01-03
allDay: true
tags:
  - personal
location: 明治神宮
url: https://example.com
---

# 初詣`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "初詣",
			start: "2026-01-01",
			end: "2026-01-03",
			allDay: true,
			tags: ["personal"],
			metadata: {
				location: "明治神宮",
				url: "https://example.com",
			},
		});
	});

	it("metadata なしのイベントで metadata が含まれない", () => {
		const md = `---
start: 2026-01-01
end: 2026-01-01
allDay: true
---

# 元日`;
		const result = parseEventNote(md);
		expect(result).not.toHaveProperty("metadata");
	});

	it("category フィールドをパースできる", () => {
		const md = `---
start: 2026-05-01
end: 2026-05-01
allDay: true
category: meeting
---

# 定例会議`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "定例会議",
			start: "2026-05-01",
			end: "2026-05-01",
			allDay: true,
			category: "meeting",
		});
	});

	it("category と tags の両方を含むイベントをパースできる", () => {
		const md = `---
start: 2026-06-15
end: 2026-06-15
category: travel
tags:
  - business
  - overseas
---

# 海外出張`;
		const result = parseEventNote(md);
		expect(result).toEqual({
			title: "海外出張",
			start: "2026-06-15",
			end: "2026-06-15",
			category: "travel",
			tags: ["business", "overseas"],
		});
	});
});
