import type { GestureResponderEvent } from "react-native";
import { Pressable, type PressableProps } from "react-native";
import Animated from "react-native-reanimated";
import { usePressAnimation } from "../../../hooks/use-press-animation";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

export type AnimatedPressableProps = PressableProps;

export function AnimatedPressable({
	style,
	disabled,
	onPressIn,
	onPressOut,
	...rest
}: AnimatedPressableProps) {
	const { animatedStyle, onPressIn: pressIn, onPressOut: pressOut } = usePressAnimation();

	const handlePressIn = (e: GestureResponderEvent) => {
		pressIn();
		onPressIn?.(e);
	};

	const handlePressOut = (e: GestureResponderEvent) => {
		pressOut();
		onPressOut?.(e);
	};

	return (
		<ReanimatedPressable
			style={[style as PressableProps["style"] & object, animatedStyle]}
			disabled={disabled}
			onPressIn={disabled ? onPressIn : handlePressIn}
			onPressOut={disabled ? onPressOut : handlePressOut}
			{...rest}
		/>
	);
}
