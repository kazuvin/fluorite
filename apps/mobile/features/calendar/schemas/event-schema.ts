import * as v from "valibot";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DateStringSchema = v.pipe(
	v.string(),
	v.regex(DATE_PATTERN, "日付は YYYY-MM-DD 形式で入力してください"),
);

const OptionalDateStringSchema = v.union([v.literal(""), DateStringSchema]);

export const AddEventFormSchema = v.object({
	title: v.string(),
	start: DateStringSchema,
	end: OptionalDateStringSchema,
	allDay: v.boolean(),
});

export type AddEventFormData = v.InferOutput<typeof AddEventFormSchema>;
