# Jotai 基礎: カプセル化

Reference: https://zenn.dev/uhyo/books/learn-react-with-jotai

## カプセル化の理由

派生atomのみ提供し操作を制御:
1. フォーマット強制（生値アクセス禁止）
2. 操作制限（増加のみ、減少不可等）
3. 内部構造変更の影響遮断

```tsx
const countAtom = atom(0);  // private
export const countDisplayAtom = atom((get) => get(countAtom).toLocaleString());
export const incrementAtom = atom(null, (get, set, step = 1) => {
  if (step < 0) throw new Error("負の数は不可");
  set(countAtom, get(countAtom) + step);
});
```

## Atom タイプ

### プライベートプリミティブ（非公開）

```tsx
const countAtom = atom(0);
const userAtom = atom<User | null>(null);
```

### 読み取り専用派生

```tsx
export const countValueAtom = atom((get) => get(countAtom));
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
```

### 書き込み専用アクション

```tsx
export const incrementAtom = atom(null, (get, set, step = 1) => {
  set(countAtom, get(countAtom) + step);
});
```

### 読み書き可能（必要時のみ）

```tsx
export const userNameAtom = atom(
  (get) => get(userAtom)?.name ?? "",
  (get, set, name: string) => {
    const user = get(userAtom);
    if (user) set(userAtom, { ...user, name });
  }
);
```

## 認証モジュール例

```tsx
// Private
const userAtom = atom<User | null>(null);
const tokenAtom = atomWithStorage<string | null>("auth-token", null);
const loadingAtom = atom(false);

// Read-Only
export const userValueAtom = atom((get) => get(userAtom));
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const isLoadingAtom = atom((get) => get(loadingAtom));

// Actions
export const loginAtom = atom(null, async (get, set, creds) => {
  set(loadingAtom, true);
  try {
    const { user, token } = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(creds) }).then(r => r.json());
    set(userAtom, user);
    set(tokenAtom, token);
  } finally {
    set(loadingAtom, false);
  }
});

export const logoutAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(tokenAtom, null);
});
```

## ユーティリティ: atomWithReset

```tsx
import { atomWithReset, RESET } from "jotai/utils";
const countAtom = atomWithReset(0);
setCount(RESET);  // 0にリセット
```
