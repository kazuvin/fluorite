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
3. **すべてのアニメーションで統一された easing を使う**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

## Duration ガイドライン

| 種類 | 推奨値 | 用途 |
|------|--------|------|
| entering (表示) | **200ms** | FadeIn, SlideIn, Keyframe 登場 |
| exiting (非表示) | **150ms** | FadeOut, SlideOut, Keyframe 退場 |
| layout (レイアウト変化) | **200ms** | LinearTransition, 要素の移動・リサイズ |

退場は表示より短くする (体感的に「サッと消える」)。`ANIMATION` 定数 (`constants/animation.ts`) を必ず使い、ハードコードしないこと。

## Easing

すべてのアニメーションで **`Easing.bezier(0.25, 0.46, 0.45, 0.94)`** を使用する。`ANIMATION` 定数 (`constants/animation.ts`) に定義済み。

## リファレンス

- [animations.md](references/animations.md) - アニメーション種別ごとの実装例
- [testing.md](references/testing.md) - テスト用モック設定
