import { useEffect, useRef } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";

const INITIAL_SCALE = 0.95;

export function useDateChangeAnimation(dateKey: string | null) {
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);
	const prevDateKey = useRef(dateKey);

	useEffect(() => {
		const prev = prevDateKey.current;
		prevDateKey.current = dateKey;

		if (dateKey && prev && dateKey !== prev) {
			scale.value = INITIAL_SCALE;
			opacity.value = 0;
			scale.value = withTiming(1, ANIMATION.entering);
			opacity.value = withTiming(1, ANIMATION.entering);
		}
	}, [dateKey, scale, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));

	return { animatedStyle };
}
