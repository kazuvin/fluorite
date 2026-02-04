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
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
	SlideInDown,
	SlideOutDown,
	useAnimatedStyle,
} from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import { IconSymbol } from "../icon-symbol";

type DialogProps = {
	visible: boolean;
	onClose: () => void;
	closeOnOverlayPress?: boolean;
	children: ReactNode;
};

const DialogContext = createContext<{ onClose: () => void }>({ onClose: () => {} });

const KEYBOARD_OFFSET = parseNumeric(spacing[4]);

function DialogRoot({ visible, onClose, closeOnOverlayPress = true, children }: DialogProps) {
	const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

	const keyboardAvoidingStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: keyboardHeight.value - (keyboardHeight.value !== 0 ? KEYBOARD_OFFSET : 0) },
		],
	}));

	if (!visible) return null;

	return (
		<DialogContext.Provider value={{ onClose }}>
			<View style={styles.wrapper}>
				<Animated.View
					entering={FadeIn.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
					exiting={FadeOut.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)}
					style={styles.overlayBackground}
				>
					<Pressable
						testID="dialog-overlay"
						style={StyleSheet.absoluteFill}
						onPress={closeOnOverlayPress ? onClose : undefined}
					/>
				</Animated.View>
				<Animated.View
					testID="dialog-keyboard-avoiding"
					layout={LinearTransition.duration(ANIMATION.layout.duration).easing(
						ANIMATION.layout.easing,
					)}
					style={[styles.keyboardAvoiding, keyboardAvoidingStyle]}
				>
					<Animated.View
						entering={SlideInDown.duration(ANIMATION.entering.duration).easing(
							ANIMATION.entering.easing,
						)}
						exiting={SlideOutDown.duration(ANIMATION.exiting.duration).easing(
							ANIMATION.exiting.easing,
						)}
						layout={LinearTransition.duration(ANIMATION.layout.duration).easing(
							ANIMATION.layout.easing,
						)}
						testID="dialog-card"
						accessibilityRole="alert"
						style={styles.card}
					>
						{children}
					</Animated.View>
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

function DialogHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return (
		<View testID="dialog-header" style={[styles.header, style]}>
			{children}
		</View>
	);
}

function DialogContent({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return (
		<View testID="dialog-content" style={[styles.content, style]}>
			{children}
		</View>
	);
}

function DialogActions({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return <View style={[styles.actions, style]}>{children}</View>;
}

export {
	DialogRoot as Dialog,
	DialogTitle,
	DialogDescription,
	DialogClose,
	DialogHeader,
	DialogContent,
	DialogActions,
};

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
		paddingVertical: parseNumeric(spacing[8]),
		paddingHorizontal: parseNumeric(spacing[4]),
		zIndex: 1000,
	},
	overlayBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	keyboardAvoiding: {
		width: "100%",
	},
	card: {
		width: "100%",
		backgroundColor: colors.light.background,
		borderCurve: "continuous",
		borderRadius: parseNumeric(radius["2xl"]),
		padding: parseNumeric(spacing[8]),
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: colors.light.muted,
		paddingBottom: parseNumeric(spacing[4]),
		marginBottom: parseNumeric(spacing[4]),
	},
	content: {
		marginTop: parseNumeric(spacing[2]),
		gap: parseNumeric(spacing[6]),
	},
	title: {
		fontSize: parseNumeric(fontSize.lg),
		fontWeight: fontWeight.semibold,
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
