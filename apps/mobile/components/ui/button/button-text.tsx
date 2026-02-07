import { colors, fontSize, parseNumeric } from "@fluorite/design-tokens";
import { useContext } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";

import { ButtonContext } from "./button-context";

export type ButtonTextProps = {
	children: string;
	style?: TextStyle;
};

export function ButtonText({ children, style }: ButtonTextProps) {
	const { variant, scheme } = useContext(ButtonContext);
	const theme = colors[scheme];
	const color = getTextColor(variant, theme);

	return <Text style={[styles.text, { color }, style]}>{children}</Text>;
}

function getTextColor(
	variant: "primary" | "secondary" | "outline" | "ghost",
	theme: (typeof colors)["light"],
): string {
	switch (variant) {
		case "primary":
			return theme.textOnPrimary;
		case "secondary":
			return theme.textOnPrimary;
		case "outline":
			return theme.primary;
		case "ghost":
			return theme.primary;
	}
}

const styles = StyleSheet.create({
	text: {
		fontSize: parseNumeric(fontSize.lg),
		fontWeight: "600",
	},
});
