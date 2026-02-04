import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { AddEventFormSchema, type AddEventFormData } from "./event-schema";

describe("event-schema", () => {
	describe("AddEventFormSchema", () => {
		it("validates a complete event form", () => {
			const input: AddEventFormData = {
				title: "会議",
				start: "2025-01-15",
				end: "2025-01-15",
				allDay: true,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(true);
		});

		it("validates form with empty end date", () => {
			const input = {
				title: "タスク",
				start: "2025-01-15",
				end: "",
				allDay: true,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(true);
		});

		it("validates form with empty title", () => {
			const input = {
				title: "",
				start: "2025-01-15",
				end: "",
				allDay: false,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(true);
		});

		it("requires start date to be in YYYY-MM-DD format", () => {
			const input = {
				title: "会議",
				start: "2025/01/15",
				end: "",
				allDay: true,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(false);
		});

		it("validates end date format when provided", () => {
			const input = {
				title: "会議",
				start: "2025-01-15",
				end: "2025/01/20",
				allDay: true,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(false);
		});

		it("accepts valid date range", () => {
			const input = {
				title: "休暇",
				start: "2025-01-15",
				end: "2025-01-20",
				allDay: true,
			};
			const result = v.safeParse(AddEventFormSchema, input);
			expect(result.success).toBe(true);
		});
	});
});
