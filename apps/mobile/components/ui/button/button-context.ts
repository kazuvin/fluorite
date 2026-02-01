import { createContext } from "react";

export type ButtonContextValue = {
	variant: "primary" | "secondary" | "outline" | "ghost";
	scheme: "light" | "dark";
};

export const ButtonContext = createContext<ButtonContextValue>({
	variant: "primary",
	scheme: "light",
});
