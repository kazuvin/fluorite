import type { DailyNote, Entry } from "./types";

export function parseDailyNote(markdown: string): DailyNote | null {
	const trimmed = markdown.trim();
	if (trimmed === "") return null;

	const { frontmatter, body } = extractFrontmatter(trimmed);
	const lines = body.split("\n");

	let date: string | null = null;
	const entries: Entry[] = [];
	let currentEntry: Entry | null = null;

	for (const line of lines) {
		const stripped = line.trimEnd();

		const dateMatch = stripped.match(/^#\s+(\d{4}-\d{2}-\d{2})\s*$/);
		if (dateMatch) {
			date = dateMatch[1];
			continue;
		}

		if (stripped.match(/^- /)) {
			if (currentEntry) entries.push(currentEntry);
			currentEntry = parseEntryLine(stripped.slice(2));
			continue;
		}

		if (currentEntry && stripped.match(/^\s+- /)) {
			const childContent = stripped.replace(/^\s+- /, "");
			parseChildLine(currentEntry, childContent);
		}
	}

	if (currentEntry) entries.push(currentEntry);
	if (date === null) return null;

	const result: DailyNote = { date, entries };
	if (frontmatter !== undefined) result.frontmatter = frontmatter;

	return result;
}

function extractFrontmatter(markdown: string): {
	frontmatter?: string;
	body: string;
} {
	if (!markdown.startsWith("---")) return { body: markdown };

	const endIndex = markdown.indexOf("---", 3);
	if (endIndex === -1) return { body: markdown };

	const frontmatter = markdown.slice(3, endIndex).trim();
	const body = markdown.slice(endIndex + 3).trim();

	return { frontmatter, body };
}

function parseEntryLine(content: string): Entry {
	let remaining = content;
	let isTask: boolean | undefined;
	let done: boolean | undefined;

	const taskMatch = remaining.match(/^\[([ x])\]\s+/);
	if (taskMatch) {
		isTask = true;
		done = taskMatch[1] === "x";
		remaining = remaining.slice(taskMatch[0].length);
	}

	let allDay: boolean | undefined;
	let time: Entry["time"];

	const allDayMatch = remaining.match(/^\[all-day\]\s+/);
	if (allDayMatch) {
		allDay = true;
		remaining = remaining.slice(allDayMatch[0].length);
	} else {
		const timeRangeMatch = remaining.match(/^\[(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\]\s+/);
		if (timeRangeMatch) {
			time = { start: timeRangeMatch[1], end: timeRangeMatch[2] };
			remaining = remaining.slice(timeRangeMatch[0].length);
		} else {
			const timeMatch = remaining.match(/^\[(\d{2}:\d{2})\]\s+/);
			if (timeMatch) {
				time = { start: timeMatch[1] };
				remaining = remaining.slice(timeMatch[0].length);
			}
		}
	}

	const { title, tags } = extractTags(remaining);

	const entry: Entry = { title };
	if (allDay) entry.allDay = true;
	if (time) entry.time = time;
	if (isTask !== undefined) {
		entry.isTask = isTask;
		entry.done = done;
	}
	if (tags && tags.length > 0) entry.tags = tags;

	return entry;
}

function extractTags(text: string): { title: string; tags?: string[] } {
	const tags: string[] = [];
	const tagRegex = /(?:^|\s)#([^\s\d#][^\s#]*)/g;

	let match: RegExpExecArray | null = null;
	while (true) {
		match = tagRegex.exec(text);
		if (match === null) break;
		tags.push(match[1]);
	}

	let title = text;
	for (const tag of tags) {
		title = title.replace(new RegExp(`\\s+#${escapeRegExp(tag)}`), "");
	}
	title = title.trim();

	return { title, tags: tags.length > 0 ? tags : undefined };
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseChildLine(entry: Entry, content: string): void {
	const metadataMatch = content.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
	if (metadataMatch) {
		if (!entry.metadata) entry.metadata = {};
		entry.metadata[metadataMatch[1]] = metadataMatch[2].trim();
	} else {
		if (!entry.body) entry.body = [];
		entry.body.push(content);
	}
}
