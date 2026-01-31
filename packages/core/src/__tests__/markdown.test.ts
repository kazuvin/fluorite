import { describe, expect, it } from "vitest";
import { parseCalendarMarkdown, serializeCalendarMarkdown } from "../markdown";

describe("parseCalendarMarkdown", () => {
	it("should parse a simple calendar markdown", () => {
		const markdown = `## 2025-01-31

- 09:00-10:00 Meeting with team #work
- 14:00 Dentist appointment #personal
- Buy groceries
`;

		const days = parseCalendarMarkdown(markdown);

		expect(days).toHaveLength(1);
		expect(days[0].date).toBe("2025-01-31");
		expect(days[0].events).toHaveLength(3);

		expect(days[0].events[0].title).toBe("Meeting with team");
		expect(days[0].events[0].startTime).toBe("09:00");
		expect(days[0].events[0].endTime).toBe("10:00");
		expect(days[0].events[0].tags).toEqual(["work"]);

		expect(days[0].events[1].title).toBe("Dentist appointment");
		expect(days[0].events[1].startTime).toBe("14:00");
		expect(days[0].events[1].endTime).toBeUndefined();
		expect(days[0].events[1].tags).toEqual(["personal"]);

		expect(days[0].events[2].title).toBe("Buy groceries");
		expect(days[0].events[2].startTime).toBeUndefined();
		expect(days[0].events[2].tags).toBeUndefined();
	});

	it("should parse multiple days", () => {
		const markdown = `## 2025-01-30

- Task A

## 2025-01-31

- Task B
`;

		const days = parseCalendarMarkdown(markdown);
		expect(days).toHaveLength(2);
		expect(days[0].date).toBe("2025-01-30");
		expect(days[1].date).toBe("2025-01-31");
	});

	it("should return empty array for empty input", () => {
		expect(parseCalendarMarkdown("")).toEqual([]);
	});
});

describe("serializeCalendarMarkdown", () => {
	it("should serialize calendar days to markdown", () => {
		const days = [
			{
				date: "2025-01-31",
				events: [
					{
						id: "1",
						title: "Meeting",
						date: "2025-01-31",
						startTime: "09:00",
						endTime: "10:00",
						tags: ["work"],
					},
					{
						id: "2",
						title: "Buy groceries",
						date: "2025-01-31",
					},
				],
			},
		];

		const markdown = serializeCalendarMarkdown(days);

		expect(markdown).toContain("## 2025-01-31");
		expect(markdown).toContain("- 09:00-10:00 Meeting #work");
		expect(markdown).toContain("- Buy groceries");
	});
});
