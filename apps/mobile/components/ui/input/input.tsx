import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { StyleSheet, TextInput, type TextInputProps, useColorScheme } from "react-native";

export type InputProps = Omit<TextInputProps, "style"> & {
	style?: TextInputProps["style"];
};

export function Input({ editable = true, style, ...props }: InputProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<TextInput
			accessibilityRole="none"
			role="textbox"
			editable={editable}
			aria-disabled={!editable}
			placeholderTextColor={theme.textMuted}
			style={[
				styles.base,
				{ backgroundColor: theme.surface, color: theme.text },
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
