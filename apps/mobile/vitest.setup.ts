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
	return {
		default: Animated,
		FadeIn: { duration: () => ({ duration: () => ({}) }) },
		FadeOut: { duration: () => ({ duration: () => ({}) }) },
		SlideInDown: { duration: () => ({ duration: () => ({}) }) },
		SlideOutDown: { duration: () => ({ duration: () => ({}) }) },
	};
});
