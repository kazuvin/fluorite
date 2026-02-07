---
name: reanimated-patterns
description: react-native-reanimated のアニメーションパターン。Mobile コンポーネントにアニメーションを追加・調整する際に使用。Easing 選択、duration ガイドライン、Keyframe、Layout Transition、テストモック設定を定義。
---

# Reanimated アニメーションパターン

関連スキル:
- **component-creator-mobile**: RN コンポーネント作成
- **tdd-patterns**: テスト駆動開発

## 原則

1. **速く、邪魔にならない**: アニメーションは UI の応答性を高めるためのもの。遅いと逆効果
2. **Easing は必ず指定**: `linear` (デフォルト) は機械的。`ease` 系を使って自然な動きに
3. **すべてのアニメーションで `Easing.ease` を使う**: 統一された自然な動き

## Duration ガイドライン

| 種類 | 推奨値 | 用途 |
|------|--------|------|
| entering (表示) | **200ms** | FadeIn, SlideIn, Keyframe 登場 |
| exiting (非表示) | **150ms** | FadeOut, SlideOut, Keyframe 退場 |
| layout (レイアウト変化) | **200ms** | LinearTransition, 要素の移動・リサイズ |

退場は表示より短くする (体感的に「サッと消える」)。`ANIMATION` 定数 (`constants/animation.ts`) を必ず使い、ハードコードしないこと。

## Easing 選択ルール

```tsx
import { Easing } from "react-native-reanimated";
```

すべてのアニメーションで **`Easing.ease`** を使用する。

| 用途 | Easing |
|------|--------|
| **entering** (登場) | `Easing.ease` |
| **exiting** (退場) | `Easing.ease` |
| **layout** (移動) | `Easing.ease` |

## リファレンス

- [animations.md](references/animations.md) - アニメーション種別ごとの実装例
- [testing.md](references/testing.md) - テスト用モック設定
