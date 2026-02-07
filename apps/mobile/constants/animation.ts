import { Easing } from "react-native-reanimated";

/**
 * アニメーション定数
 *
 * reanimated-patterns スキルに準拠:
 * - entering: 200ms, Easing.ease
 * - exiting: 150ms, Easing.ease
 * - layout: 200ms, Easing.ease
 */
export const ANIMATION = {
	get entering() {
		return { duration: 200, easing: Easing.out(Easing.ease) };
	},
	get exiting() {
		return { duration: 150, easing: Easing.out(Easing.ease) };
	},
	get layout() {
		return { duration: 200, easing: Easing.out(Easing.ease) };
	},
} as const;
