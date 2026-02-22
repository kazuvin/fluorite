import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../constants/animation";

const PRESSED_SCALE = 0.96;
const REST_SCALE = 1;

export function usePressAnimation() {
	const scale = useSharedValue(REST_SCALE);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const onPressIn = () => {
		scale.value = withTiming(PRESSED_SCALE, {
			duration: ANIMATION.exiting.duration,
			easing: ANIMATION.exiting.easing,
		});
	};

	const onPressOut = () => {
		scale.value = withTiming(REST_SCALE, {
			duration: ANIMATION.entering.duration,
			easing: ANIMATION.entering.easing,
		});
	};

	return { animatedStyle, onPressIn, onPressOut };
}
