import { colors, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import type { ReactNode } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	View,
	type ViewStyle,
	useColorScheme,
} from "react-native";

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
	const textColor = getTextColor(variant, theme);

	return (
		<Pressable
			accessibilityRole="button"
			disabled={isDisabled}
			aria-disabled={isDisabled}
			onPress={isDisabled ? undefined : onPress}
			style={({ pressed }) => [
				styles.base,
				sizeStyle,
				variantStyle,
				pressed && styles.pressed,
				isDisabled && styles.disabled,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator testID="button-loading" size="small" color={textColor} />
			) : (
				<View style={styles.content}>{children}</View>
			)}
		</Pressable>
	);
}

function getVariantStyle(variant: Variant, theme: (typeof colors)["light"]): ViewStyle {
	switch (variant) {
		case "primary":
			return { backgroundColor: theme.tint };
		case "secondary":
			return { backgroundColor: theme.icon };
		case "outline":
			return {
				backgroundColor: "transparent",
				borderWidth: 1,
				borderColor: theme.tint,
			};
		case "ghost":
			return { backgroundColor: "transparent" };
	}
}

function getTextColor(variant: Variant, theme: (typeof colors)["light"]): string {
	switch (variant) {
		case "primary":
			return "#fff";
		case "secondary":
			return "#fff";
		case "outline":
			return theme.tint;
		case "ghost":
			return theme.tint;
	}
}

const styles = StyleSheet.create({
	base: {
		alignItems: "center",
		justifyContent: "center",
		borderRadius: parseNumeric(radius.md),
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[2]),
	},
	pressed: {
		opacity: 0.8,
	},
	disabled: {
		opacity: 0.5,
	},
});

const sizeStyles = StyleSheet.create({
	sm: {
		paddingVertical: parseNumeric(spacing[1]),
		paddingHorizontal: parseNumeric(spacing[3]),
		minHeight: 32,
	},
	md: {
		paddingVertical: parseNumeric(spacing[2]),
		paddingHorizontal: parseNumeric(spacing[4]),
		minHeight: 40,
	},
	lg: {
		paddingVertical: parseNumeric(spacing[3]),
		paddingHorizontal: parseNumeric(spacing[5]),
		minHeight: 48,
	},
});
