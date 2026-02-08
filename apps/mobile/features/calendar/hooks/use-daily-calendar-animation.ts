import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";

const DAILY_SLIDE_OFFSET = 20;

export function useDailyCalendarAnimation(isSelected: boolean) {
	const dailyCalendarOpacity = useSharedValue(isSelected ? 1 : 0);
	const dailyCalendarTranslateY = useSharedValue(isSelected ? 0 : DAILY_SLIDE_OFFSET);

	useEffect(() => {
		if (isSelected) {
			dailyCalendarOpacity.value = withTiming(1, ANIMATION.entering);
			dailyCalendarTranslateY.value = withTiming(0, ANIMATION.entering);
		} else {
			dailyCalendarOpacity.value = withTiming(0, ANIMATION.exiting);
			dailyCalendarTranslateY.value = withTiming(DAILY_SLIDE_OFFSET, ANIMATION.exiting);
		}
	}, [isSelected, dailyCalendarOpacity, dailyCalendarTranslateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: dailyCalendarOpacity.value,
		transform: [{ translateY: dailyCalendarTranslateY.value }],
	}));

	return {
		animatedStyle,
	};
}
