import { Easing } from "react-native-reanimated";

const EASING = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/**
 * アニメーション定数
 *
 * reanimated-patterns スキルに準拠:
 * - entering: 200ms
 * - exiting: 150ms
 * - layout: 200ms
 * - easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
 */
export const ANIMATION = {
	get entering() {
		return { duration: 200, easing: EASING };
	},
	get exiting() {
		return { duration: 150, easing: EASING };
	},
	get layout() {
		return { duration: 200, easing: EASING };
	},
} as const;
