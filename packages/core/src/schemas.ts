import * as v from "valibot";

export const VaultConfigSchema = v.object({
	version: v.pipe(v.number(), v.integer(), v.minValue(1)),
	timezone: v.string(),
	locale: v.string(),
});

export type VaultConfig = v.InferOutput<typeof VaultConfigSchema>;
