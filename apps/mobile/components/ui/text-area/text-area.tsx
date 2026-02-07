import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { StyleSheet, TextInput, type TextInputProps, useColorScheme } from "react-native";

export type TextAreaProps = Omit<TextInputProps, "style" | "multiline"> & {
	style?: TextInputProps["style"];
	rows?: number;
};

export function TextArea({ editable = true, rows = 3, style, ...props }: TextAreaProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const minHeight = rows * parseNumeric(fontSize.base) * 1.5;

	return (
		<TextInput
			accessibilityRole="none"
			role="textbox"
			multiline
			editable={editable}
			aria-disabled={!editable}
			placeholderTextColor={theme.textMuted}
			textAlignVertical="top"
			style={[
				styles.base,
				{ backgroundColor: theme.surface, color: theme.text, minHeight },
				!editable && styles.disabled,
				style,
			]}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		fontSize: parseNumeric(fontSize.base),
	},
	disabled: {
		opacity: 0.5,
	},
});
