import type { EventNote } from "./event-note-schemas";

export function serializeEventNote(note: EventNote): string {
	const lines: string[] = [];

	// frontmatter
	lines.push("---");
	lines.push(`start: ${note.start}`);
	lines.push(`end: ${note.end}`);

	if (note.allDay) {
		lines.push("allDay: true");
	}

	if (note.category) {
		lines.push(`category: ${note.category}`);
	}

	if (note.time) {
		if (note.time.end) {
			lines.push(`time: "${note.time.start} - ${note.time.end}"`);
		} else {
			lines.push(`time: "${note.time.start}"`);
		}
	}

	if (note.tags && note.tags.length > 0) {
		lines.push("tags:");
		for (const tag of note.tags) {
			lines.push(`  - ${tag}`);
		}
	}

	if (note.metadata) {
		for (const [key, value] of Object.entries(note.metadata)) {
			lines.push(`${key}: ${value}`);
		}
	}

	lines.push("---");
	lines.push("");

	// タイトル
	lines.push(`# ${note.title}`);

	// ボディ
	if (note.body) {
		lines.push("");
		lines.push(note.body);
	}

	lines.push("");
	return lines.join("\n");
}
