import * as v from "valibot";

const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

export const CategorySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	color: v.pipe(v.string(), v.regex(hexColorPattern)),
});

export type Category = v.InferOutput<typeof CategorySchema>;

export const CategoryDefinitionSchema = v.object({
	version: v.pipe(v.number(), v.integer(), v.minValue(1)),
	categories: v.array(CategorySchema),
});

export type CategoryDefinition = v.InferOutput<typeof CategoryDefinitionSchema>;
