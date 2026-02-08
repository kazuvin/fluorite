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
	const createEasingFn = () => {
		const fn = () => 0;
		fn.out = createEasingFn;
		fn.in = createEasingFn;
		fn.inOut = createEasingFn;
		fn.bezier = () => fn;
		fn.ease = fn;
		return fn;
	};
	const Easing = createEasingFn();
	return {
		default: Animated,
		Easing,
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
		useSharedValue: (initial: unknown) => {
			const { useRef } = require("react");
			const ref = useRef({ value: initial });
			return ref.current;
		},
		withTiming: (toValue: unknown) => toValue,
		runOnJS: (fn: unknown) => fn,
	};
});

vi.mock("react-native-keyboard-controller", () => ({
	useReanimatedKeyboardAnimation: () => ({
		height: { value: 0 },
		progress: { value: 0 },
	}),
}));
