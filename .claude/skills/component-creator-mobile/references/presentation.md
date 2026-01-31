# Presentation Components (React Native)

共通パターン: **component-common** スキル参照

## テンプレート

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

// デザイントークンを @fluorite/design-tokens から import して利用
// import { colors } from "@fluorite/design-tokens";
const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.light.tint },
  secondary: { backgroundColor: colors.light.icon + "1a" },
  ghost: { backgroundColor: "transparent" },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.light.background },
  secondary: { color: colors.light.text },
  ghost: { color: colors.light.text },
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

## 基本原則 (RN 固有)

1. `StyleSheet.create` で全スタイルを定義（パフォーマンス最適化）
2. `Pressable` を使用（`TouchableOpacity` より推奨）
3. `style?: ViewStyle` prop で外部カスタマイズ可能に
4. 配列でスタイル合成: `style={[base, variant, custom]}`
5. `({ pressed })` callback でプレスフィードバック
6. ハードコードされた色値の代わりに `@fluorite/design-tokens` からトークンを import して使う

## スタイル合成

```tsx
// 外部 style を受け取り内部スタイルと合成
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

export function CardHeader({ children }: { children: ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <View style={styles.body}>{children}</View>;
}

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
