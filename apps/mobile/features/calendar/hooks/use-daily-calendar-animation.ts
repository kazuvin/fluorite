import { useEffect } from "react";
import {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const DAILY_SLIDE_OFFSET = 20;
const TIMING_CONFIG = { duration: 300, easing: Easing.out(Easing.cubic) };

export const DAILY_CALENDAR_HEIGHT = 400;

export function useDailyCalendarAnimation(isSelected: boolean) {
	const dailyCalendarOpacity = useSharedValue(isSelected ? 1 : 0);
	const dailyCalendarTranslateY = useSharedValue(isSelected ? 0 : DAILY_SLIDE_OFFSET);

	useEffect(() => {
		if (isSelected) {
			dailyCalendarOpacity.value = withTiming(1, TIMING_CONFIG);
			dailyCalendarTranslateY.value = withTiming(0, TIMING_CONFIG);
		} else {
			dailyCalendarOpacity.value = withTiming(0, TIMING_CONFIG);
			dailyCalendarTranslateY.value = withTiming(DAILY_SLIDE_OFFSET, TIMING_CONFIG);
		}
	}, [isSelected, dailyCalendarOpacity, dailyCalendarTranslateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: dailyCalendarOpacity.value,
		transform: [{ translateY: dailyCalendarTranslateY.value }],
	}));

	return {
		animatedStyle,
		DAILY_CALENDAR_HEIGHT,
	};
}
