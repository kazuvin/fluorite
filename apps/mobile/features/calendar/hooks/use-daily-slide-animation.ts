import { useCallback, useRef } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";

export function useDailySlideAnimation(width: number) {
	const dailySlideX = useSharedValue(0);
	const weekSwipeRef = useRef(false);
	const dailySwipeRef = useRef(false);
	const prevDateKeyRef = useRef<string | null>(null);

	const markWeekSwipe = useCallback(() => {
		weekSwipeRef.current = true;
	}, []);

	const markDailySwipe = useCallback(() => {
		dailySwipeRef.current = true;
	}, []);

	const onDateKeyChange = useCallback(
		(dateKey: string | null) => {
			if (dateKey && prevDateKeyRef.current) {
				const prev = prevDateKeyRef.current;

				if (dailySwipeRef.current) {
					// デイリーカレンダースワイプ → アニメーション無し（FlatListが処理）
				} else {
					// 週スワイプまたはタップ → スライドアニメーション
					const direction = dateKey > prev ? 1 : dateKey < prev ? -1 : 0;
					if (direction !== 0) {
						dailySlideX.value = direction * width;
						dailySlideX.value = withTiming(0, ANIMATION.entering);
					}
				}
				weekSwipeRef.current = false;
				dailySwipeRef.current = false;
			}
			prevDateKeyRef.current = dateKey;
		},
		[width, dailySlideX],
	);

	const slideStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: dailySlideX.value }],
	}));

	return { slideStyle, markWeekSwipe, markDailySwipe, onDateKeyChange };
}
