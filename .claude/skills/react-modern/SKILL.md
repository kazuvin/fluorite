---
name: react-modern
description: React 18/19 のモダン記法パターン。use() / useActionState / useOptimistic / Suspense / Transition / Server Components など新しい API の使い方を定義。コンポーネント実装時やコードレビュー時に使用。react-declarative（宣言的設計）や component-common（構成・命名）と組み合わせて使う。
---

# React Modern Patterns (18/19)

React 18/19 で導入された新しい API・パターンのガイド。

関連スキル:
- **react-declarative**: 宣言的設計の原則
- **component-common**: ディレクトリ構成、命名
- **jotai-patterns**: 状態管理

## API クイックリファレンス

| API                  | Version | 用途                           | 参照                                     |
| -------------------- | ------- | ------------------------------ | ---------------------------------------- |
| `use()`              | 19      | Promise / Context の読み取り   | [hooks](references/hooks.md)             |
| `useActionState`     | 19      | フォームアクションの状態管理   | [hooks](references/hooks.md)             |
| `useOptimistic`      | 19      | 楽観的 UI 更新                 | [hooks](references/hooks.md)             |
| `useTransition`      | 18      | 非同期遷移（低優先度更新）     | [hooks](references/hooks.md)             |
| `useDeferredValue`   | 18      | 値の遅延評価                   | [hooks](references/hooks.md)             |
| `useId`              | 18      | SSR 安全な一意 ID 生成         | [hooks](references/hooks.md)             |
| `useSyncExternalStore` | 18   | 外部ストアとの同期             | [hooks](references/hooks.md)             |
| `<Suspense>`         | 18      | 非同期境界                     | [patterns](references/patterns.md)       |
| Server Components    | 19      | サーバー側レンダリング         | [server-components](references/server-components.md) |
| Server Actions       | 19      | サーバー側ミューテーション     | [server-components](references/server-components.md) |

## コアルール

1. **`use()` は Promise と Context の読み取りに使う** — `useEffect` + `useState` での fetch パターンを置き換える
2. **`useActionState` でフォーム状態を管理する** — `useState` + `onSubmit` の手動管理を置き換える
3. **`useOptimistic` で即座にUIを更新する** — サーバー応答を待たず楽観的に表示を更新
4. **`useTransition` で重い更新を低優先度にする** — ユーザー入力のブロッキングを防ぐ
5. **`ref` は props として直接渡す** — React 19 では `forwardRef` は不要

## 移行ガイド

| 非推奨                                    | モダン                          |
| ----------------------------------------- | ------------------------------- |
| `forwardRef((props, ref) => ...)`         | `function Comp({ ref, ...props })` |
| `useEffect` + `useState` で fetch         | `use(promise)` + `<Suspense>`   |
| `useContext(Ctx)`                          | `use(Ctx)` (条件分岐内で使用可) |
| `useState` + `onSubmit` のフォーム管理    | `useActionState`                |
| `<Context.Provider value={...}>`          | `<Context value={...}>`         |
| `ref` の cleanup を `useEffect` で行う    | ref callback から cleanup 関数を return |

## 参照

- [hooks.md](references/hooks.md) — React 18/19 の新しい Hooks 詳細
- [patterns.md](references/patterns.md) — Suspense / Transition / Streaming パターン
- [server-components.md](references/server-components.md) — Server Components / Server Actions
