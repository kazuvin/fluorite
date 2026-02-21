import {
	colors,
	fontSize,
	fontWeight,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { type ReactNode, createContext, useCallback, useContext, useEffect } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
	useColorScheme,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
	SlideInDown,
	SlideOutDown,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";
import { IconSymbol } from "../icon-symbol";

type DialogProps = {
	visible: boolean;
	onClose: () => void;
	closeOnOverlayPress?: boolean;
	swipeToDismiss?: boolean;
	children: ReactNode;
};

const DialogContext = createContext<{ onClose: () => void }>({ onClose: () => {} });

const KEYBOARD_OFFSET = parseNumeric(spacing[4]);
const SWIPE_THRESHOLD = 100;
const SWIPE_DISMISS_DISTANCE = 800;

function DialogRoot({
	visible,
	onClose,
	closeOnOverlayPress = true,
	swipeToDismiss = false,
	children,
}: DialogProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
	const translateY = useSharedValue(0);

	useEffect(() => {
		if (visible) {
			translateY.value = 0;
		}
	}, [visible, translateY]);

	const keyboardAvoidingStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: keyboardHeight.value - (keyboardHeight.value !== 0 ? KEYBOARD_OFFSET : 0) },
		],
	}));

	const dismissWithAnimation = useCallback(() => {
		translateY.value = withTiming(
			SWIPE_DISMISS_DISTANCE,
			{ duration: ANIMATION.exiting.duration, easing: ANIMATION.exiting.easing },
			(finished) => {
				if (finished) {
					runOnJS(onClose)();
				}
			},
		);
	}, [onClose, translateY]);

	const handleClose = useCallback(() => {
		if (swipeToDismiss) {
			dismissWithAnimation();
		} else {
			onClose();
		}
	}, [swipeToDismiss, dismissWithAnimation, onClose]);

	const panGesture = Gesture.Pan()
		.onUpdate((e) => {
			translateY.value = Math.max(0, e.translationY);
		})
		.onEnd(() => {
			if (translateY.value > SWIPE_THRESHOLD) {
				translateY.value = withTiming(
					SWIPE_DISMISS_DISTANCE,
					{ duration: ANIMATION.exiting.duration, easing: ANIMATION.exiting.easing },
					(finished) => {
						if (finished) {
							runOnJS(onClose)();
						}
					},
				);
			} else {
				translateY.value = withTiming(0, {
					duration: ANIMATION.entering.duration,
					easing: ANIMATION.entering.easing,
				});
			}
		});

	const swipeAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	if (!visible) return null;

	const cardContent = (
		<>
			{swipeToDismiss && <DragHandle />}
			{children}
		</>
	);

	const cardView = (
		<Animated.View
			entering={SlideInDown.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
			exiting={
				swipeToDismiss
					? undefined
					: SlideOutDown.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)
			}
			layout={LinearTransition.duration(ANIMATION.layout.duration).easing(ANIMATION.layout.easing)}
			testID="dialog-card"
			accessibilityRole="alert"
			style={[styles.card, { backgroundColor: theme.background }, swipeAnimatedStyle]}
		>
			{cardContent}
		</Animated.View>
	);

	return (
		<DialogContext.Provider value={{ onClose: handleClose }}>
			<View style={styles.wrapper}>
				<Animated.View
					entering={FadeIn.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
					exiting={FadeOut.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)}
					style={[styles.overlayBackground, { backgroundColor: theme.overlay }]}
				>
					<Pressable
						testID="dialog-overlay"
						style={StyleSheet.absoluteFill}
						onPress={closeOnOverlayPress ? handleClose : undefined}
					/>
				</Animated.View>
				<Animated.View
					testID="dialog-keyboard-avoiding"
					layout={LinearTransition.duration(ANIMATION.layout.duration).easing(
						ANIMATION.layout.easing,
					)}
					style={[styles.keyboardAvoiding, keyboardAvoidingStyle]}
				>
					{swipeToDismiss ? (
						<GestureDetector gesture={panGesture}>{cardView}</GestureDetector>
					) : (
						cardView
					)}
				</Animated.View>
			</View>
		</DialogContext.Provider>
	);
}

function DragHandle() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	return (
		<View testID="dialog-drag-handle" style={styles.dragHandleContainer}>
			<View style={[styles.dragHandle, { backgroundColor: theme.borderMuted }]} />
		</View>
	);
}

function DialogTitle({ children, style }: { children: ReactNode; style?: TextStyle }) {
	return <Text style={[styles.title, style]}>{children}</Text>;
}

function DialogDescription({ children, style }: { children: ReactNode; style?: TextStyle }) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	return <Text style={[styles.description, { color: theme.textMuted }, style]}>{children}</Text>;
}

function DialogClose({ style }: { style?: ViewStyle } = {}) {
	const { onClose } = useContext(DialogContext);
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	return (
		<Pressable
			testID="dialog-close"
			accessibilityRole="button"
			onPress={onClose}
			style={[styles.closeButton, { backgroundColor: `${theme.icon}1F` }, style]}
		>
			<IconSymbol name="xmark" size={16} color={theme.icon} />
		</Pressable>
	);
}

function DialogHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	return (
		<View
			testID="dialog-header"
			style={[styles.header, { borderBottomColor: theme.borderMuted }, style]}
		>
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
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	keyboardAvoiding: {
		width: "100%",
	},
	card: {
		width: "100%",
		borderCurve: "continuous",
		borderRadius: parseNumeric(radius["3xl"]),
		padding: parseNumeric(spacing[8]),
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		paddingBottom: parseNumeric(spacing[4]),
		marginBottom: parseNumeric(spacing[4]),
	},
	content: {
		marginTop: parseNumeric(spacing[2]),
		gap: parseNumeric(spacing[6]),
	},
	title: {
		fontSize: parseNumeric(fontSize.base),
		fontWeight: fontWeight.semibold,
	},
	description: {
		fontSize: parseNumeric(fontSize.base),
		fontWeight: fontWeight.normal,
		lineHeight: parseNumeric(fontSize.base) * 1.5,
		marginBottom: parseNumeric(spacing[4]),
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: parseNumeric(spacing[2]),
		marginTop: parseNumeric(spacing[2]),
	},
	dragHandleContainer: {
		alignItems: "center",
		paddingBottom: parseNumeric(spacing[2]),
	},
	dragHandle: {
		width: 36,
		height: 4,
		borderRadius: 2,
	},
});
