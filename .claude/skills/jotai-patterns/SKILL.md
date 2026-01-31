---
name: jotai-patterns
description: Jotai state management patterns with encapsulation and Suspense integration. Use when designing atoms, reviewing Jotai code, implementing async data fetching, or asked about state management architecture. Enforces opaque atom pattern where primitive atoms are private and only derived atoms are exported. Works with React Native / Expo.
---

# Jotai Patterns

**Core Rule**: プリミティブatomはexportしない。派生atomのみをexport。

```tsx
// ❌ BAD
export const userAtom = atom<User | null>(null);

// ✅ GOOD
const userAtom = atom<User | null>(null);  // private
export const userValueAtom = atom((get) => get(userAtom));  // read-only
export const loginAtom = atom(null, async (get, set, creds) => { ... });  // action
```

## Pattern Guide

| やりたいこと           | パターン               | 参照                     |
| ---------------------- | ---------------------- | ------------------------ |
| 状態を読み取りたい     | Read-only derived atom | [basics](references/basics.md) |
| 状態を更新したい       | Write-only action atom | [basics](references/basics.md) |
| 非同期データ取得       | Async + Suspense       | [suspense](references/suspense.md) |
| パラメータ付きfetch    | Parameter via atom     | [suspense](references/suspense.md) |
| 複数キャッシュ         | atomFamily             | [suspense](references/suspense.md) |

## Naming

| Type              | Pattern               | Example                  |
| ----------------- | --------------------- | ------------------------ |
| Private primitive | `xxxAtom` (private)   | `userAtom`               |
| Read-only         | `xxxValueAtom`        | `userValueAtom`          |
| Action            | verb + `Atom`         | `loginAtom`              |

## File Structure

```tsx
// features/xxx/stores/xxx-atoms.ts

// Private (NEVER export)
const userAtom = atom<User | null>(null);

// Read-Only Exports
export const userValueAtom = atom((get) => get(userAtom));

// Action Exports
export const loginAtom = atom(null, async (get, set, creds) => { ... });
```

## Expo Provider Setup

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
