import type { CalendarDay, CalendarEvent } from "./types";

/**
 * Parse a Markdown string into calendar days with events.
 *
 * Expected format:
 * ```
 * ## 2025-01-31
 *
 * - 09:00-10:00 Meeting with team #work
 * - 14:00 Dentist appointment #personal
 * - Buy groceries
 * ```
 */
export function parseCalendarMarkdown(markdown: string): CalendarDay[] {
	const days: CalendarDay[] = [];
	const lines = markdown.split("\n");

	let currentDay: CalendarDay | null = null;

	for (const line of lines) {
		const trimmed = line.trim();

		// Match date heading: ## YYYY-MM-DD
		const dateMatch = trimmed.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
		if (dateMatch) {
			if (currentDay) {
				days.push(currentDay);
			}
			currentDay = { date: dateMatch[1], events: [] };
			continue;
		}

		// Match event line: - [time[-time]] title [#tag1 #tag2]
		if (currentDay && trimmed.startsWith("- ")) {
			const event = parseEventLine(trimmed.slice(2), currentDay.date);
			if (event) {
				currentDay.events.push(event);
			}
		}
	}

	if (currentDay) {
		days.push(currentDay);
	}

	return days;
}

function parseEventLine(line: string, date: string): CalendarEvent | null {
	const timeMatch = line.match(/^(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?\s+(.*)/);

	let title: string;
	let startTime: string | undefined;
	let endTime: string | undefined;

	if (timeMatch) {
		startTime = timeMatch[1];
		endTime = timeMatch[2] || undefined;
		title = timeMatch[3];
	} else {
		title = line;
	}

	// Extract tags
	const tags: string[] = [];
	const tagRegex = /#(\w+)/g;
	for (const tagMatch of title.matchAll(tagRegex)) {
		tags.push(tagMatch[1]);
	}

	// Remove tags from title
	const cleanTitle = title.replace(/#\w+/g, "").trim();

	return {
		id: `${date}-${crypto.randomUUID().slice(0, 8)}`,
		title: cleanTitle,
		date,
		startTime,
		endTime,
		tags: tags.length > 0 ? tags : undefined,
	};
}

/**
 * Serialize calendar days back into Markdown format.
 */
export function serializeCalendarMarkdown(days: CalendarDay[]): string {
	const lines: string[] = [];

	for (const day of days) {
		lines.push(`## ${day.date}`);
		lines.push("");

		for (const event of day.events) {
			let line = "- ";

			if (event.startTime) {
				line += event.startTime;
				if (event.endTime) {
					line += `-${event.endTime}`;
				}
				line += " ";
			}

			line += event.title;

			if (event.tags && event.tags.length > 0) {
				line += ` ${event.tags.map((t) => `#${t}`).join(" ")}`;
			}

			lines.push(line);
		}

		lines.push("");
	}

	return lines.join("\n");
}
