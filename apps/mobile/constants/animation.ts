import { Easing } from "react-native-reanimated";

/**
 * アニメーション定数
 *
 * reanimated-patterns スキルに準拠:
 * - entering: 80–120ms, Easing.out(Easing.ease) - 速く始まり減速
 * - exiting: 60–100ms, Easing.in(Easing.ease) - ゆっくり始まり加速
 * - layout: 80–120ms, Easing.inOut(Easing.ease) - 緩急のある自然な移動
 */
export const ANIMATION = {
	get entering() {
		return { duration: 100, easing: Easing.out(Easing.ease) };
	},
	get exiting() {
		return { duration: 80, easing: Easing.in(Easing.ease) };
	},
	get layout() {
		return { duration: 100, easing: Easing.inOut(Easing.ease) };
	},
} as const;
