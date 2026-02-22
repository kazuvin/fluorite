import { colors, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View, type ViewStyle, useColorScheme } from "react-native";
import { AnimatedPressable } from "../animated-pressable";

import { ButtonContext, type ButtonContextValue } from "./button-context";

const variants = ["primary", "secondary", "outline", "ghost"] as const;
type Variant = (typeof variants)[number];

const sizes = ["sm", "md", "lg"] as const;
type Size = (typeof sizes)[number];

export type ButtonProps = {
	children: ReactNode;
	onPress?: () => void;
	variant?: Variant;
	size?: Size;
	disabled?: boolean;
	loading?: boolean;
	style?: ViewStyle;
};

export function Button({
	children,
	onPress,
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	style,
}: ButtonProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const isDisabled = disabled || loading;

	const variantStyle = getVariantStyle(variant, theme);
	const sizeStyle = sizeStyles[size];
	const spinnerColor = getSpinnerColor(variant, theme);

	const ctx = useMemo<ButtonContextValue>(() => ({ variant, scheme }), [variant, scheme]);

	return (
		<ButtonContext.Provider value={ctx}>
			<AnimatedPressable
				accessibilityRole="button"
				disabled={isDisabled}
				aria-disabled={isDisabled}
				onPress={isDisabled ? undefined : onPress}
				style={[styles.base, sizeStyle, variantStyle, isDisabled && styles.disabled, style]}
			>
				{loading ? (
					<ActivityIndicator testID="button-loading" size="small" color={spinnerColor} />
				) : (
					<View style={styles.content}>{children}</View>
				)}
			</AnimatedPressable>
		</ButtonContext.Provider>
	);
}

function getVariantStyle(variant: Variant, theme: (typeof colors)["light"]): ViewStyle {
	switch (variant) {
		case "primary":
			return { backgroundColor: theme.primary };
		case "secondary":
			return { backgroundColor: theme.surfaceRaised };
		case "outline":
			return {
				backgroundColor: "transparent",
				borderWidth: 1,
				borderColor: theme.primary,
				borderCurve: "continuous",
			};
		case "ghost":
			return { backgroundColor: "transparent" };
	}
}

function getSpinnerColor(variant: Variant, theme: (typeof colors)["light"]): string {
	switch (variant) {
		case "primary":
			return theme.textOnPrimary;
		case "secondary":
			return theme.text;
		case "outline":
		case "ghost":
			return theme.primary;
	}
}

const styles = StyleSheet.create({
	base: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: parseNumeric(radius.full),
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[2]),
	},
	disabled: {
		opacity: 0.5,
	},
});

const sizeStyles = StyleSheet.create({
	sm: {
		padding: parseNumeric(spacing[4]),
		minHeight: 32,
	},
	md: {
		padding: parseNumeric(spacing[4]),
		minHeight: 40,
	},
	lg: {
		padding: parseNumeric(spacing[4]),
		minHeight: 48,
	},
});
