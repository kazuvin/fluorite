import { describe, expect, it } from "vitest";
import { formatDateLabel, parseDateString, toDateString } from "./utils";

describe("formatDateLabel", () => {
	it("日付文字列を日本語フォーマットに変換する", () => {
		expect(formatDateLabel("2026-02-01")).toBe("2026年2月1日");
	});

	it("12月25日を正しくフォーマットする", () => {
		expect(formatDateLabel("2026-12-25")).toBe("2026年12月25日");
	});
});

describe("parseDateString", () => {
	it("日付文字列を年月日オブジェクトに変換する（month は 0-indexed）", () => {
		expect(parseDateString("2026-02-01")).toEqual({
			year: 2026,
			month: 1,
			day: 1,
		});
	});
});

describe("toDateString", () => {
	it("年月日から YYYY-MM-DD 文字列を生成する（month は 0-indexed）", () => {
		expect(toDateString(2026, 1, 1)).toBe("2026-02-01");
	});
});
