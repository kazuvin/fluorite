import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { ANIMATION } from "../../../../constants/animation";
import { clearSelectedDateAtom, selectedDateValueAtom } from "../../stores/selected-date-atoms";
import { DeselectDateFabButton } from "./deselect-date-fab-button";

export function DeselectDateFab() {
	const selectedDate = useAtomValue(selectedDateValueAtom);
	const clearSelectedDate = useSetAtom(clearSelectedDateAtom);
	const isSelected = selectedDate !== null;

	const opacity = useSharedValue(isSelected ? 1 : 0);
	const [visible, setVisible] = useState(isSelected);

	useEffect(() => {
		if (isSelected) {
			setVisible(true);
			const timerId = setTimeout(() => {
				opacity.value = withTiming(1, ANIMATION.entering);
			}, 0);
			return () => clearTimeout(timerId);
		}
		opacity.value = withTiming(0, ANIMATION.exiting, (finished) => {
			"worklet";
			if (finished) {
				runOnJS(setVisible)(false);
			}
		});
	}, [isSelected, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	if (!visible) return null;

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<DeselectDateFabButton onPress={clearSelectedDate} />
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: "center",
		pointerEvents: "box-none",
	},
});
