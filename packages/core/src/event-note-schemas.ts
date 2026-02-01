import * as v from "valibot";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const EventNoteSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1)),
	start: v.pipe(v.string(), v.regex(datePattern)),
	end: v.pipe(v.string(), v.regex(datePattern)),
	allDay: v.optional(v.boolean()),
	category: v.optional(v.string()),
	time: v.optional(
		v.object({
			start: v.pipe(v.string(), v.regex(timePattern)),
			end: v.optional(v.pipe(v.string(), v.regex(timePattern))),
		}),
	),
	tags: v.optional(v.pipe(v.array(v.string()), v.minLength(1))),
	body: v.optional(v.string()),
	metadata: v.optional(v.record(v.string(), v.string())),
});

export type EventNote = v.InferOutput<typeof EventNoteSchema>;
