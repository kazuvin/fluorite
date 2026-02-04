import { EventNoteSchema } from "@fluorite/core";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { MOCK_EVENT_NOTES } from "../__fixtures__/event-notes";

describe("MOCK_EVENT_NOTES", () => {
	it("EventNoteSchema で全件バリデーション通過する", () => {
		for (const note of MOCK_EVENT_NOTES) {
			const result = v.safeParse(EventNoteSchema, note);
			expect(result.success).toBe(true);
		}
	});

	it("16 件の EventNote を持つ", () => {
		expect(MOCK_EVENT_NOTES).toHaveLength(16);
	});

	it("2026-01-01 に該当するイベントが含まれる", () => {
		const jan1 = MOCK_EVENT_NOTES.filter((n) => n.start <= "2026-01-01" && n.end >= "2026-01-01");
		expect(jan1.length).toBeGreaterThanOrEqual(5);
	});

	it("metadata 付きイベントが含まれる", () => {
		const withMeta = MOCK_EVENT_NOTES.filter((n) => n.metadata);
		expect(withMeta.length).toBeGreaterThanOrEqual(2);
	});

	it("複数日にまたがるイベントが含まれる", () => {
		const multiDay = MOCK_EVENT_NOTES.filter((n) => n.start !== n.end);
		expect(multiDay.length).toBeGreaterThanOrEqual(2);
	});
});
