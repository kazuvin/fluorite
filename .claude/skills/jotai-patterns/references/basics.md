# Jotai Basics: Encapsulation

Reference: https://zenn.dev/uhyo/books/learn-react-with-jotai

## Why Encapsulation?

派生atomのみを提供することで操作を制御:
1. フォーマット強制（生の値へのアクセス禁止）
2. 操作制限（増やせるが減らせない等）
3. 内部構造変更が外部に影響しない

```tsx
const countAtom = atom(0);  // private
export const countDisplayAtom = atom((get) => get(countAtom).toLocaleString());
export const incrementAtom = atom(null, (get, set, step = 1) => {
  if (step < 0) throw new Error("負の数は不可");
  set(countAtom, get(countAtom) + step);
});
```

## Atom Types

### Private Primitive (Never export)

```tsx
const countAtom = atom(0);
const userAtom = atom<User | null>(null);
```

### Read-Only Derived

```tsx
export const countValueAtom = atom((get) => get(countAtom));
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
```

### Write-Only Action

```tsx
export const incrementAtom = atom(null, (get, set, step = 1) => {
  set(countAtom, get(countAtom) + step);
});
```

### Read-Write (when needed)

```tsx
export const userNameAtom = atom(
  (get) => get(userAtom)?.name ?? "",
  (get, set, name: string) => {
    const user = get(userAtom);
    if (user) set(userAtom, { ...user, name });
  }
);
```

## Auth Module Example

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

## Utility: atomWithReset

```tsx
import { atomWithReset, RESET } from "jotai/utils";
const countAtom = atomWithReset(0);
setCount(RESET);  // resets to 0
```
