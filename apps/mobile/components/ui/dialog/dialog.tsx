import {
	colors,
	fontSize,
	fontWeight,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { type ReactNode, createContext, useContext } from "react";
import { Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { IconSymbol } from "../icon-symbol";

type DialogProps = {
	visible: boolean;
	onClose: () => void;
	closeOnOverlayPress?: boolean;
	children: ReactNode;
};

const DialogContext = createContext<{ onClose: () => void }>({ onClose: () => {} });

function DialogRoot({ visible, onClose, closeOnOverlayPress = true, children }: DialogProps) {
	if (!visible) return null;

	return (
		<DialogContext.Provider value={{ onClose }}>
			<View style={styles.wrapper}>
				<Animated.View
					entering={FadeIn.duration(200)}
					exiting={FadeOut.duration(150)}
					style={styles.overlayBackground}
				>
					<Pressable
						testID="dialog-overlay"
						style={StyleSheet.absoluteFill}
						onPress={closeOnOverlayPress ? onClose : undefined}
					/>
				</Animated.View>
				<Animated.View
					entering={SlideInDown.duration(250)}
					exiting={SlideOutDown.duration(200)}
					testID="dialog-card"
					accessibilityRole="alert"
					style={styles.card}
				>
					{children}
				</Animated.View>
			</View>
		</DialogContext.Provider>
	);
}

function DialogTitle({ children, style }: { children: ReactNode; style?: TextStyle }) {
	return <Text style={[styles.title, style]}>{children}</Text>;
}

function DialogDescription({ children, style }: { children: ReactNode; style?: TextStyle }) {
	return <Text style={[styles.description, style]}>{children}</Text>;
}

function DialogClose({ style }: { style?: ViewStyle } = {}) {
	const { onClose } = useContext(DialogContext);
	return (
		<Pressable
			testID="dialog-close"
			accessibilityRole="button"
			onPress={onClose}
			style={[styles.closeButton, style]}
		>
			<IconSymbol name="xmark" size={16} color={colors.light.icon} />
		</Pressable>
	);
}

function DialogActions({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return <View style={[styles.actions, style]}>{children}</View>;
}

export { DialogRoot as Dialog, DialogTitle, DialogDescription, DialogClose, DialogActions };

export type { DialogProps };

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "flex-end",
		alignItems: "center",
		padding: parseNumeric(spacing[4]),
		zIndex: 1000,
	},
	overlayBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
	},
	closeButton: {
		position: "absolute",
		top: parseNumeric(spacing[6]),
		right: parseNumeric(spacing[6]),
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1,
	},
	card: {
		width: "100%",
		backgroundColor: colors.light.background,
		borderRadius: parseNumeric(radius.xl),
		paddingVertical: parseNumeric(spacing[8]),
		paddingHorizontal: parseNumeric(spacing[8]),
	},
	title: {
		fontSize: parseNumeric(fontSize.lg),
		fontWeight: fontWeight.semibold,
		marginBottom: parseNumeric(spacing[2]),
	},
	description: {
		fontSize: parseNumeric(fontSize.base),
		fontWeight: fontWeight.normal,
		lineHeight: parseNumeric(fontSize.base) * 1.5,
		color: colors.light.icon,
		marginBottom: parseNumeric(spacing[4]),
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: parseNumeric(spacing[2]),
		marginTop: parseNumeric(spacing[2]),
	},
});
