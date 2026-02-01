import type { EventNote } from "@fluorite/core";

export const MOCK_EVENT_NOTES: EventNote[] = [
	// 2026-01-01
	{
		title: "元日",
		start: "2026-01-01",
		end: "2026-01-01",
		allDay: true,
		tags: ["holiday"],
	},
	{
		title: "初詣",
		start: "2026-01-01",
		end: "2026-01-01",
		time: { start: "10:00" },
		tags: ["personal"],
		metadata: { location: "明治神宮" },
	},
	{
		title: "会議A",
		start: "2026-01-01",
		end: "2026-01-01",
		time: { start: "10:00", end: "12:00" },
		tags: ["work"],
		metadata: {
			memo: "先方との機能要件のすり合わせ",
			location: "会議室B",
			url: "https://meet.google.com/xxx",
		},
	},
	{
		title: "レビュー会",
		start: "2026-01-01",
		end: "2026-01-01",
		time: { start: "14:00", end: "15:00" },
		tags: ["work"],
	},
	{
		title: "朝会",
		start: "2026-01-01",
		end: "2026-01-01",
		time: { start: "09:00" },
		tags: ["work"],
	},
	// 2026-01-01〜01-03 (複数日)
	{
		title: "正月休み",
		start: "2026-01-01",
		end: "2026-01-03",
		allDay: true,
		tags: ["personal"],
	},
	// 2026-01-02
	{
		title: "定例MTG",
		start: "2026-01-02",
		end: "2026-01-02",
		time: { start: "09:00", end: "10:00" },
		tags: ["work"],
	},
	{
		title: "1on1",
		start: "2026-01-02",
		end: "2026-01-02",
		time: { start: "13:00", end: "14:00" },
		tags: ["work"],
	},
	// 2026-01-05
	{
		title: "仕事始め",
		start: "2026-01-05",
		end: "2026-01-05",
		allDay: true,
		tags: ["work"],
	},
	{
		title: "キックオフ",
		start: "2026-01-05",
		end: "2026-01-05",
		time: { start: "10:00", end: "11:00" },
		tags: ["work"],
	},
	{
		title: "企画会議",
		start: "2026-01-05",
		end: "2026-01-05",
		time: { start: "14:00", end: "15:00" },
		tags: ["work"],
	},
	{
		title: "買い出し",
		start: "2026-01-05",
		end: "2026-01-05",
		time: { start: "16:00" },
		tags: ["personal"],
	},
	// 2026-01-05〜01-07 (複数日)
	{
		title: "プロジェクト合宿",
		start: "2026-01-05",
		end: "2026-01-07",
		allDay: true,
		tags: ["work"],
	},
	// 追加イベント
	{
		title: "歯医者",
		start: "2026-01-10",
		end: "2026-01-10",
		time: { start: "10:00" },
		tags: ["personal"],
	},
	{
		title: "チームランチ",
		start: "2026-01-10",
		end: "2026-01-10",
		time: { start: "12:00", end: "13:00" },
		tags: ["work"],
		metadata: { location: "近くのイタリアン" },
	},
	{
		title: "新年会",
		start: "2026-01-10",
		end: "2026-01-10",
		time: { start: "18:00", end: "20:00" },
		tags: ["personal"],
	},
];
