import { useEffect, useState } from "react";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../../constants/animation";

const DAILY_SLIDE_OFFSET = 20;

export function useDailyCalendarAnimation(isSelected: boolean) {
	const dailyCalendarOpacity = useSharedValue(isSelected ? 1 : 0);
	const dailyCalendarTranslateY = useSharedValue(isSelected ? 0 : DAILY_SLIDE_OFFSET);

	const [showDailyCalendar, setShowDailyCalendar] = useState(isSelected);
	useEffect(() => {
		if (isSelected) {
			setShowDailyCalendar(true);
			// FlatListDailyCalendar のマウント・初回レイアウト完了を待ってからフェードインを開始する。
			// useEffect 実行時点では FlatList の子要素がネイティブ側にコミットされていない可能性があり、
			// 即座に withTiming を発火するとコンテンツ未描画の状態で透明度が上がってカクつく。
			const timerId = setTimeout(() => {
				dailyCalendarOpacity.value = withTiming(1, ANIMATION.entering);
				dailyCalendarTranslateY.value = withTiming(0, ANIMATION.entering);
			}, 0);
			return () => clearTimeout(timerId);
		}
		dailyCalendarTranslateY.value = withTiming(DAILY_SLIDE_OFFSET, ANIMATION.exiting);
		// setTimeout ではなく withTiming の完了コールバックで unmount する。
		// useCalendarTransition の setTimeout(200ms) と同一マイクロタスクで発火して
		// React バッチ処理されるタイマー競合を回避する。
		dailyCalendarOpacity.value = withTiming(0, ANIMATION.layout, (finished) => {
			"worklet";
			if (finished) {
				runOnJS(setShowDailyCalendar)(false);
			}
		});
	}, [isSelected, dailyCalendarOpacity, dailyCalendarTranslateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: dailyCalendarOpacity.value,
		transform: [{ translateY: dailyCalendarTranslateY.value }],
	}));

	return {
		animatedStyle,
		showDailyCalendar,
	};
}
