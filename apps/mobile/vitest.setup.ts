import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
});

vi.mock("react-native-reanimated", () => {
	const { View } = require("react-native-web");
	const Animated = {
		View,
		Text: View,
		createAnimatedComponent: (c: unknown) => c,
	};
	const chainable = () => {
		const obj: Record<string, unknown> = {};
		obj.duration = () => obj;
		obj.easing = () => obj;
		return obj;
	};
	const easingFn = () => 0;
	easingFn.out = () => easingFn;
	easingFn.in = () => easingFn;
	easingFn.inOut = () => easingFn;
	easingFn.ease = easingFn;
	return {
		default: Animated,
		Easing: { out: () => easingFn, in: () => easingFn, inOut: () => easingFn, ease: easingFn },
		FadeIn: chainable(),
		FadeOut: chainable(),
		SlideInDown: chainable(),
		SlideOutDown: chainable(),
		LinearTransition: chainable(),
		Keyframe: class {
			duration() {
				return this;
			}
		},
		useAnimatedStyle: (fn: () => unknown) => fn(),
	};
});

vi.mock("react-native-keyboard-controller", () => ({
	useReanimatedKeyboardAnimation: () => ({
		height: { value: 0 },
		progress: { value: 0 },
	}),
}));
