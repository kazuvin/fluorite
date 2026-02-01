import type { EventNote } from "./event-note-schemas";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseEventNote(markdown: string): EventNote | null {
	const trimmed = markdown.trim();
	if (trimmed === "") return null;

	const { frontmatter, body } = extractFrontmatter(trimmed);
	if (frontmatter === undefined) return null;

	const fields = parseFrontmatterFields(frontmatter);

	const { start, end } = fields;
	if (!start || !end) return null;
	if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) return null;

	const title = extractTitle(body);
	if (title === null) return null;

	const bodyText = extractBody(body);

	const result: EventNote = { title, start, end };

	if (fields.allDay === "true") {
		result.allDay = true;
	}

	if (fields.category) {
		result.category = fields.category;
	}

	const time = parseTimeField(fields.time);
	if (time) {
		result.time = time;
	}

	if (fields.tags && fields.tags.length > 0) {
		result.tags = fields.tags;
	}

	if (bodyText) {
		result.body = bodyText;
	}

	if (fields.metadata && Object.keys(fields.metadata).length > 0) {
		result.metadata = fields.metadata;
	}

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

function extractTitle(body: string): string | null {
	for (const line of body.split("\n")) {
		const match = line.match(/^#\s+(.+)$/);
		if (match) return match[1].trim();
	}
	return null;
}

function extractBody(body: string): string | undefined {
	const lines = body.split("\n");
	let pastTitle = false;
	const bodyLines: string[] = [];

	for (const line of lines) {
		if (!pastTitle && line.match(/^#\s+/)) {
			pastTitle = true;
			continue;
		}
		if (pastTitle) {
			bodyLines.push(line);
		}
	}

	const text = bodyLines.join("\n").trim();
	return text.length > 0 ? text : undefined;
}

function parseTimeField(raw: string | undefined): EventNote["time"] | undefined {
	if (!raw) return undefined;

	const rangeMatch = raw.match(/^"?(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})"?$/);
	if (rangeMatch) {
		return { start: rangeMatch[1], end: rangeMatch[2] };
	}

	const singleMatch = raw.match(/^"?(\d{2}:\d{2})"?$/);
	if (singleMatch) {
		return { start: singleMatch[1] };
	}

	return undefined;
}

type FrontmatterFields = {
	start?: string;
	end?: string;
	allDay?: string;
	category?: string;
	time?: string;
	tags?: string[];
	metadata?: Record<string, string>;
};

function parseFrontmatterFields(frontmatter: string): FrontmatterFields {
	const result: FrontmatterFields = {};
	const lines = frontmatter.split("\n");
	let currentKey: string | null = null;

	for (const line of lines) {
		// YAML 配列アイテム
		const arrayItemMatch = line.match(/^\s+-\s+(.+)$/);
		if (arrayItemMatch && currentKey === "tags") {
			if (!result.tags) result.tags = [];
			result.tags.push(arrayItemMatch[1].trim());
			continue;
		}

		// キー: 値
		const kvMatch = line.match(/^(\w+):\s*(.*)$/);
		if (kvMatch) {
			const key = kvMatch[1];
			const value = kvMatch[2].trim();
			currentKey = key;

			if (key === "start") result.start = value;
			else if (key === "end") result.end = value;
			else if (key === "allDay") result.allDay = value;
			else if (key === "category") result.category = value;
			else if (key === "time") result.time = value;
			else if (key === "tags" && value) {
				result.tags = [value];
			} else if (key !== "tags" && value) {
				if (!result.metadata) result.metadata = {};
				result.metadata[key] = value;
			}
		}
	}

	return result;
}
