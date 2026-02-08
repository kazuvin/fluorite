import { useCallback, useRef } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { isSameWeek } from "../../../components/ui/calendar-grid/utils";
import { ANIMATION } from "../../../constants/animation";

export function useDailySlideAnimation(width: number) {
	const dailySlideX = useSharedValue(0);
	const dailyOpacity = useSharedValue(1);
	const weekSwipeRef = useRef(false);
	const prevDateKeyRef = useRef<string | null>(null);

	const markWeekSwipe = useCallback(() => {
		weekSwipeRef.current = true;
	}, []);

	const onDateKeyChange = useCallback(
		(dateKey: string | null) => {
			if (dateKey && prevDateKeyRef.current) {
				const prev = prevDateKeyRef.current;
				const weekChanged = !isSameWeek(prev, dateKey);

				if (weekSwipeRef.current && weekChanged) {
					// 週カレンダースワイプ → スライドアニメーション
					const direction = dateKey > prev ? 1 : dateKey < prev ? -1 : 0;
					if (direction !== 0) {
						dailySlideX.value = direction * width;
						dailySlideX.value = withTiming(0, ANIMATION.entering);
					}
				} else if (weekChanged) {
					// デイリーカレンダーで週境界越え → フェードアニメーション
					dailyOpacity.value = 0;
					dailyOpacity.value = withTiming(1, ANIMATION.entering);
				}
				weekSwipeRef.current = false;
			}
			prevDateKeyRef.current = dateKey;
		},
		[width, dailySlideX, dailyOpacity],
	);

	const slideStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: dailySlideX.value }],
		opacity: dailyOpacity.value,
	}));

	return { slideStyle, markWeekSwipe, onDateKeyChange };
}
