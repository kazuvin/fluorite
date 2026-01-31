---
name: jotai-patterns
description: カプセル化とSuspense統合を重視したJotai状態管理パターン。atom設計、コードレビュー、非同期データ取得、状態管理アーキテクチャ時に使用。プリミティブatomは非公開、派生atomのみ公開。React Native / Expo対応。
---

# Jotai パターン

**コアルール**: プリミティブatomは非公開。派生atomのみ公開。

```tsx
// ❌ BAD
export const userAtom = atom<User | null>(null);

// ✅ GOOD
const userAtom = atom<User | null>(null);  // private
export const userValueAtom = atom((get) => get(userAtom));  // read-only
export const loginAtom = atom(null, async (get, set, creds) => { ... });  // action
```

## パターンガイド

| 用途                   | パターン               | 参照                     |
| ---------------------- | ---------------------- | ------------------------ |
| 状態を読み取りたい     | Read-only derived atom | [basics](references/basics.md) |
| 状態を更新したい       | Write-only action atom | [basics](references/basics.md) |
| 非同期データ取得       | Async + Suspense       | [suspense](references/suspense.md) |
| パラメータ付きfetch    | Parameter via atom     | [suspense](references/suspense.md) |
| 複数キャッシュ         | atomFamily             | [suspense](references/suspense.md) |

## 命名規則

| タイプ            | パターン              | 例                       |
| ----------------- | --------------------- | ------------------------ |
| プライベート      | `xxxAtom` (private)   | `userAtom`               |
| 読み取り専用      | `xxxValueAtom`        | `userValueAtom`          |
| アクション        | verb + `Atom`         | `loginAtom`              |

## ファイル構造

```tsx
// features/xxx/stores/xxx-atoms.ts

// Private (NEVER export)
const userAtom = atom<User | null>(null);

// Read-Only Exports
export const userValueAtom = atom((get) => get(userAtom));

// Action Exports
export const loginAtom = atom(null, async (get, set, creds) => { ... });
```

## Expo プロバイダー設定

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

Reference: https://zenn.dev/uhyo/books/learn-react-with-jotai
