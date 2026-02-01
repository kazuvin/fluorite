import type { DailyNote, Entry } from "./types";

export function serializeDailyNote(note: DailyNote): string {
	const lines: string[] = [];

	if (note.frontmatter !== undefined) {
		lines.push("---");
		lines.push(note.frontmatter);
		lines.push("---");
		lines.push("");
	}

	lines.push(`# ${note.date}`);

	for (let i = 0; i < note.entries.length; i++) {
		const entry = note.entries[i];
		if (i === 0) {
			lines.push("");
		}
		lines.push(serializeEntry(entry));

		if (entry.metadata) {
			for (const [key, value] of Object.entries(entry.metadata)) {
				lines.push(`  - ${key}: ${value}`);
			}
		}

		if (entry.body) {
			for (const line of entry.body) {
				lines.push(`  - ${line}`);
			}
		}
	}

	lines.push("");
	return lines.join("\n");
}

function serializeEntry(entry: Entry): string {
	let line = "- ";

	if (entry.isTask) {
		line += entry.done ? "[x] " : "[ ] ";
	}

	if (entry.allDay) {
		line += "[all-day] ";
	} else if (entry.time) {
		if (entry.time.end) {
			line += `[${entry.time.start} - ${entry.time.end}] `;
		} else {
			line += `[${entry.time.start}] `;
		}
	}

	line += entry.title;

	if (entry.tags && entry.tags.length > 0) {
		line += ` ${entry.tags.map((t) => `#${t}`).join(" ")}`;
	}

	return line;
}
