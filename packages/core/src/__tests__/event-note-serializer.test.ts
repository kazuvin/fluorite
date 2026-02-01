import { describe, expect, it } from "vitest";
import { parseEventNote } from "../event-note-parser";
import type { EventNote } from "../event-note-schemas";
import { serializeEventNote } from "../event-note-serializer";

describe("serializeEventNote", () => {
	it("終日イベントをシリアライズできる", () => {
		const note: EventNote = {
			title: "正月休み",
			start: "2026-01-01",
			end: "2026-01-03",
			allDay: true,
			tags: ["personal"],
			body: "家族で過ごす",
		};
		const result = serializeEventNote(note);
		expect(result).toBe(`---
start: 2026-01-01
end: 2026-01-03
allDay: true
tags:
  - personal
---

# 正月休み

家族で過ごす
`);
	});

	it("時刻イベントをシリアライズできる", () => {
		const note: EventNote = {
			title: "カンファレンス",
			start: "2026-02-14",
			end: "2026-02-14",
			time: { start: "09:00", end: "17:00" },
			tags: ["work"],
		};
		const result = serializeEventNote(note);
		expect(result).toBe(`---
start: 2026-02-14
end: 2026-02-14
time: "09:00 - 17:00"
tags:
  - work
---

# カンファレンス
`);
	});

	it("body ありのイベントをシリアライズできる", () => {
		const note: EventNote = {
			title: "合宿",
			start: "2026-01-10",
			end: "2026-01-12",
			allDay: true,
			body: "チームビルディング\n場所は箱根",
		};
		const result = serializeEventNote(note);
		expect(result).toBe(`---
start: 2026-01-10
end: 2026-01-12
allDay: true
---

# 合宿

チームビルディング
場所は箱根
`);
	});

	it("ラウンドトリップ: serializeEventNote → parseEventNote で元のデータに戻る", () => {
		const note: EventNote = {
			title: "正月休み",
			start: "2026-01-01",
			end: "2026-01-03",
			allDay: true,
			tags: ["personal"],
			body: "家族で過ごす",
		};
		const serialized = serializeEventNote(note);
		const parsed = parseEventNote(serialized);
		expect(parsed).toEqual(note);
	});

	it("metadata 付きイベントをシリアライズできる", () => {
		const note: EventNote = {
			title: "初詣",
			start: "2026-01-01",
			end: "2026-01-03",
			allDay: true,
			tags: ["personal"],
			metadata: {
				location: "明治神宮",
				url: "https://example.com",
			},
		};
		const result = serializeEventNote(note);
		expect(result).toBe(`---
start: 2026-01-01
end: 2026-01-03
allDay: true
tags:
  - personal
location: 明治神宮
url: https://example.com
---

# 初詣
`);
	});

	it("metadata ラウンドトリップ: serialize → parse で元のデータに戻る", () => {
		const note: EventNote = {
			title: "打ち合わせ",
			start: "2026-02-10",
			end: "2026-02-10",
			time: { start: "14:00", end: "15:00" },
			tags: ["work"],
			metadata: {
				location: "会議室A",
				memo: "議題は来期計画",
			},
		};
		const serialized = serializeEventNote(note);
		const parsed = parseEventNote(serialized);
		expect(parsed).toEqual(note);
	});
});
