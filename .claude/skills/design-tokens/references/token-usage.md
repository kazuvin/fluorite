# トークンの使い方

## Desktop (Tailwind v4)

`generated/theme.css` が `@theme` ブロックとして Tailwind v4 に統合されている。CSS カスタムプロパティ名がそのまま Tailwind クラスになる。

```tsx
// Tailwind クラスとして利用
<div className="p-4 rounded-md bg-background text-text">
  <h1 className="text-2xl font-bold">タイトル</h1>
</div>
```

```css
/* CSS カスタムプロパティとしても利用可能 */
.custom {
  color: var(--color-tint);
  padding: var(--spacing-4);
}
```

## Mobile (React Native)

TS トークンを直接 import して `StyleSheet` で利用する。

```tsx
import { colors, spacing, fontSize, parseNumeric } from "@fluorite/design-tokens";

const styles = StyleSheet.create({
  container: {
    padding: parseNumeric(spacing["4"]),       // 16
    backgroundColor: colors.light.background,  // "#fff"
  },
  title: {
    fontSize: parseNumeric(fontSize["2xl"]),   // 24
    color: colors.light.text,                  // "#11181c"
  },
});
```

## parseNumeric ヘルパー

CSS 値文字列から数値を抽出する。React Native の StyleSheet は数値を要求するため必要。

```ts
import { parseNumeric } from "@fluorite/design-tokens";

parseNumeric("16px")  // 16
parseNumeric("1.5")   // 1.5
parseNumeric("0px")   // 0
```

## テーマ切り替え (Mobile)

Mobile 側では既存の `useThemeColor` フックがそのまま機能する。`Colors` は `@fluorite/design-tokens` の `colors` を re-export している。

```tsx
import { useThemeColor } from "@/hooks/use-theme-color";

const color = useThemeColor({}, "text");  // light/dark に応じた色を返す
```
