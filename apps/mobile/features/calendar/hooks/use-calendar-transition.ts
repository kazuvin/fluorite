import { useEffect, useRef, useState } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import {
	CELL_HEIGHT,
	MONTH_HEIGHT,
	WEEK_HEIGHT,
} from "../../../components/ui/calendar-grid/constants";
import { ANIMATION } from "../../../constants/animation";

type TransitionMode = "month" | "collapsing" | "week" | "expanding";

type UseCalendarTransitionProps = {
	selectedDateKey: string | null;
	selectedWeekIndex: number;
};

export function useCalendarTransition({
	selectedDateKey,
	selectedWeekIndex,
}: UseCalendarTransitionProps) {
	const isSelected = selectedDateKey != null;

	const [mode, setMode] = useState<TransitionMode>("month");
	const [showWeekCalendar, setShowWeekCalendar] = useState(false);

	const containerHeight = useSharedValue(MONTH_HEIGHT);
	const monthTranslateY = useSharedValue(0);
	const monthOpacity = useSharedValue(1);
	const nonSelectedRowOpacity = useSharedValue(1);
	const weekCalendarOpacity = useSharedValue(0);
	const dayInfoOpacity = useSharedValue(0);

	const isFirstRender = useRef(true);
	const prevIsSelectedRef = useRef(false);
	const selectedWeekIndexRef = useRef(selectedWeekIndex);
	selectedWeekIndexRef.current = selectedWeekIndex;
	const expandTimerRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			prevIsSelectedRef.current = isSelected;
			if (!isSelected) return;
		}

		const wasSelected = prevIsSelectedRef.current;
		prevIsSelectedRef.current = isSelected;

		// isSelected が変化していなければ何もしない（週モード中の日付変更など）
		if (isSelected === wasSelected) return;

		if (isSelected) {
			// Month → Week transition (collapsing)
			// 1. 週カレンダーをプリマウント（opacity=0で不可視だがDOMに存在）
			setShowWeekCalendar(true);
			setMode("collapsing");

			// 2. 月カレンダーの折りたたみアニメーション開始
			containerHeight.value = withTiming(WEEK_HEIGHT, ANIMATION.layout);
			monthTranslateY.value = withTiming(
				-CELL_HEIGHT * selectedWeekIndexRef.current,
				ANIMATION.layout,
			);
			nonSelectedRowOpacity.value = withTiming(0, ANIMATION.exiting);
			dayInfoOpacity.value = withTiming(1, ANIMATION.entering);

			// 3. 折りたたみ完了後、月カレンダーを即時非表示にし週カレンダーを即時表示
			//    折りたたみ完了時点では月カレンダーの選択行と週カレンダーの内容は同一なのでクロスフェード不要
			const timer = setTimeout(() => {
				monthOpacity.value = 0;
				weekCalendarOpacity.value = 1;
				setMode("week");
			}, ANIMATION.layout.duration);

			return () => clearTimeout(timer);
		}

		// Week → Month transition (expanding) — collapsing の逆再生
		// 1. 即時切り替え（フェード不要：折りたたまれた月カレンダーと週カレンダーは同一位置）
		setMode("expanding");
		weekCalendarOpacity.value = 0;
		monthOpacity.value = 1;
		nonSelectedRowOpacity.value = 1;
		dayInfoOpacity.value = 0;

		// 2. 高さと位置のみアニメーション
		containerHeight.value = withTiming(MONTH_HEIGHT, ANIMATION.layout);
		monthTranslateY.value = withTiming(0, ANIMATION.layout);

		// 3. 展開完了後、週カレンダーをアンマウントし month モードに戻る
		expandTimerRef.current = setTimeout(() => {
			setShowWeekCalendar(false);
			setMode("month");
		}, ANIMATION.layout.duration);

		return () => {
			if (expandTimerRef.current) {
				clearTimeout(expandTimerRef.current);
			}
		};
	}, [
		isSelected,
		containerHeight,
		monthTranslateY,
		monthOpacity,
		nonSelectedRowOpacity,
		weekCalendarOpacity,
		dayInfoOpacity,
	]);

	const calendarContainerStyle = useAnimatedStyle(() => ({
		height: containerHeight.value,
	}));

	const monthInnerStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: monthTranslateY.value }],
		opacity: monthOpacity.value,
	}));

	const weekCalendarStyle = useAnimatedStyle(() => ({
		opacity: weekCalendarOpacity.value,
	}));

	// 週モード時は月カレンダーのタッチイベントを無効化して干渉を防ぐ
	const monthPointerEvents = (mode === "week" || mode === "collapsing" ? "none" : "auto") as
		| "none"
		| "auto";

	return {
		mode,
		showWeekCalendar,
		containerHeight,
		monthTranslateY,
		monthOpacity,
		nonSelectedRowOpacity,
		weekCalendarOpacity,
		dayInfoOpacity,
		calendarContainerStyle,
		monthInnerStyle,
		weekCalendarStyle,
		monthScrollEnabled: !isSelected,
		monthPointerEvents,
	};
}
