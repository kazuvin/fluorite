import * as v from "valibot";

export const EntrySchema = v.object({
	title: v.pipe(v.string(), v.minLength(1)),
	allDay: v.optional(v.boolean()),
	time: v.optional(
		v.object({
			start: v.pipe(v.string(), v.regex(/^\d{2}:\d{2}$/)),
			end: v.optional(v.pipe(v.string(), v.regex(/^\d{2}:\d{2}$/))),
		}),
	),
	isTask: v.optional(v.boolean()),
	done: v.optional(v.boolean()),
	tags: v.optional(v.pipe(v.array(v.string()), v.minLength(1))),
	metadata: v.optional(v.record(v.string(), v.string())),
	body: v.optional(v.pipe(v.array(v.string()), v.minLength(1))),
});

export type Entry = v.InferOutput<typeof EntrySchema>;

export const DailyNoteSchema = v.object({
	date: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/)),
	frontmatter: v.optional(v.string()),
	entries: v.array(EntrySchema),
});

export type DailyNote = v.InferOutput<typeof DailyNoteSchema>;

export const VaultConfigSchema = v.object({
	version: v.pipe(v.number(), v.integer(), v.minValue(1)),
	timezone: v.string(),
	locale: v.string(),
});

export type VaultConfig = v.InferOutput<typeof VaultConfigSchema>;
