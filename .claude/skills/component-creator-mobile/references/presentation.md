# Presentation Components (React Native)

共通パターン: see **component-common** skill

## Template

```tsx
import { type ReactNode } from "react";
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ variant = "primary", size = "md", children, style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, textVariantStyles[variant], textSizeStyles[size]]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: "#2563eb" },
  secondary: { backgroundColor: "#e5e7eb" },
  ghost: { backgroundColor: "transparent" },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: "#ffffff" },
  secondary: { color: "#1f2937" },
  ghost: { color: "#1f2937" },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14 },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
});
```

## Key Principles (RN Specific)

1. `StyleSheet.create` for all styles (performance optimization)
2. `Pressable` over `TouchableOpacity` (React Native recommended)
3. Accept `style?: ViewStyle` prop for外部からのスタイル上書き
4. Compose styles with array: `style={[base, variant, custom]}`
5. Use `({ pressed })` callback for press feedback

## Style Composition

```tsx
// 外部からstyleを受け取り、内部スタイルと合成
<View style={[styles.container, style]}>
  {children}
</View>
```

## Compound Components

```tsx
import { createContext, useContext, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";

const CardContext = createContext<{ variant: "default" | "outlined" } | null>(null);

export function Card({ variant = "default", children }: { variant?: "default" | "outlined"; children: ReactNode }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <View style={[styles.card, cardVariantStyles[variant]]}>{children}</View>
    </CardContext.Provider>
  );
}

Card.Header = ({ children }: { children: ReactNode }) => (
  <View style={styles.header}>{children}</View>
);
Card.Body = ({ children }: { children: ReactNode }) => (
  <View style={styles.body}>{children}</View>
);

const styles = StyleSheet.create({
  card: { borderRadius: 12, overflow: "hidden" },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  body: { padding: 16 },
});

const cardVariantStyles = StyleSheet.create({
  default: { backgroundColor: "#ffffff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  outlined: { borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff" },
});
```
