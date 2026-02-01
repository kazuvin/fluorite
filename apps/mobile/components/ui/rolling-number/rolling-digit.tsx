import { memo, useEffect, useRef } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

type RollingDigitProps = {
	char: string;
	direction: 1 | -1;
	style?: TextStyle;
	duration: number;
	charHeight: number;
};

export const RollingDigit = memo(function RollingDigit({
	char,
	direction,
	style,
	duration,
	charHeight,
}: RollingDigitProps) {
	const translateY = useSharedValue(0);
	const prevChar = useRef(char);
	const prevCharValue = useRef(char);

	const isAnimating = useSharedValue(false);

	useEffect(() => {
		if (prevChar.current !== char) {
			prevCharValue.current = prevChar.current;
			prevChar.current = char;

			isAnimating.value = true;
			translateY.value = direction === 1 ? charHeight : -charHeight;
			translateY.value = withTiming(
				0,
				{ duration, easing: Easing.out(Easing.cubic) },
				(finished) => {
					if (finished) {
						isAnimating.value = false;
					}
				},
			);
		}
	}, [char, direction, duration, charHeight, translateY, isAnimating]);

	const exitStyle = useAnimatedStyle(() => ({
		opacity: isAnimating.value ? 1 : 0,
		transform: [
			{
				translateY: isAnimating.value
					? translateY.value + (translateY.value > 0 ? -charHeight : charHeight)
					: 0,
			},
		],
	}));

	const enterStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<Animated.View style={[styles.container, { height: charHeight }]}>
			{/* 幅確保用の不可視テキスト */}
			<Text style={[style, styles.sizer]}>{char}</Text>
			<Animated.Text style={[style, styles.text, exitStyle]}>{prevCharValue.current}</Animated.Text>
			<Animated.Text style={[style, styles.text, enterStyle]}>{char}</Animated.Text>
		</Animated.View>
	);
});

const styles = StyleSheet.create({
	container: {
		overflow: "hidden",
		justifyContent: "center",
	},
	sizer: {
		opacity: 0,
	},
	text: {
		position: "absolute",
		width: "100%",
		textAlign: "center",
	},
});
