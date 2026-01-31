# UI Component Catalog (React Native)

## Style Patterns

```tsx
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: "#1f2937" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(31, 41, 55, 0.2)",
  },
  ghost: { backgroundColor: "transparent" },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14 },
});
```

## Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { describe, it, expect, vi } from "vitest";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText("Test")).toBeOnTheScreen();
  });

  it("handles press events", () => {
    const onPress = vi.fn();
    render(<ComponentName onPress={onPress}>Test</ComponentName>);
    fireEvent.press(screen.getByText("Test"));
    expect(onPress).toHaveBeenCalled();
  });

  it("applies custom style", () => {
    render(<ComponentName style={{ marginTop: 10 }} testID="comp" />);
    expect(screen.getByTestId("comp")).toHaveStyle({ marginTop: 10 });
  });
});
```

## RN Testing Library API

| Action            | API                                     |
| ----------------- | --------------------------------------- |
| Render            | `render(<Component />)`                |
| Find by text      | `screen.getByText("text")`             |
| Find by testID    | `screen.getByTestId("id")`             |
| Find by role      | `screen.getByRole("button")`           |
| Find by label     | `screen.getByLabelText("label")`       |
| Assert exists     | `toBeOnTheScreen()`                     |
| Assert not exists | `not.toBeOnTheScreen()`                |
| Press             | `fireEvent.press(element)`             |
| Text input        | `fireEvent.changeText(element, "text")`|
| Scroll            | `fireEvent.scroll(element, { nativeEvent: ... })` |
| Assert style      | `toHaveStyle({ color: "red" })`        |
| Assert disabled   | `toBeDisabled()`                        |
