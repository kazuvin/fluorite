/**
 * TS トークンオブジェクトを CSS カスタムプロパティに変換する。
 */
export function tokensToCSSProperties(tokens: Record<string, string>, prefix: string): string {
	return Object.entries(tokens)
		.map(([key, value]) => `\t--${prefix}-${key}: ${value};`)
		.join("\n");
}

/**
 * ネストされたトークンオブジェクトをフラットな CSS カスタムプロパティに変換する。
 */
export function nestedTokensToCSSProperties(
	tokens: Record<string, Record<string, string>>,
	prefix: string,
): string {
	return Object.entries(tokens)
		.flatMap(([group, values]) =>
			Object.entries(values).map(([key, value]) => `\t--${prefix}-${group}-${key}: ${value};`),
		)
		.join("\n");
}
