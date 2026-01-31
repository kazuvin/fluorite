---
name: component-creator-mobile
description: React Native / Expo コンポーネント作成。apps/mobile 配下の作業時に使用。StyleSheet, View/Text/Pressable, @testing-library/react-native を使用。共通パターンは component-common スキルを参照。
---

# Component Creator - Mobile (React Native / Expo)

Related skills:
- **component-common**: 共通パターン (Decision Guide, 命名規則, Container パターン)
- **jotai-patterns**: Atom design for containers

## Quick Start

### Presentation

```tsx
import { Pressable, Text, StyleSheet, type ViewStyle } from "react-native";

type ButtonProps = {
  variant?: "primary" | "secondary";
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ variant = "primary", title, style, ...props }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        props.disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, textVariantStyles[variant]]}>{title}</Text>
    </Pressable>
  );
}
```

### Container

```tsx
import { useAtomValue, useSetAtom } from "jotai";
import { isLoadingAtom, loginAtom } from "../stores/auth-atoms";

export function LoginForm() {
  const isLoading = useAtomValue(isLoadingAtom);
  const login = useSetAtom(loginAtom);
  // Container/Presentation split → see component-common
}
```

### Provider Setup (Expo Router)

```tsx
// app/_layout.tsx
import { Provider } from "jotai";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Provider>
      <Stack />
    </Provider>
  );
}
```

## References

- [presentation.md](references/presentation.md) - RN Presentation パターン
- [ui-components.md](references/ui-components.md) - RN UI カタログ

## Mobile Checklist

- [ ] `StyleSheet.create` for styles
- [ ] `Pressable` over `TouchableOpacity`
- [ ] `style` prop (ViewStyle) for外部カスタマイズ
- [ ] Style composition with array: `[base, variant, custom]`
- [ ] `accessibilityLabel` / `accessibilityRole` 設定
- [ ] Tests with `@testing-library/react-native`
