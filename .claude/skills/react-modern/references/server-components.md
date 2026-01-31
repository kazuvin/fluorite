# Server Components / Server Actions

## Server Components (React 19)

### 基本ルール

| 特性                     | Server Component   | Client Component        |
| ------------------------ | ------------------ | ----------------------- |
| ディレクティブ           | なし（デフォルト） | `"use client"`          |
| `useState` / `useEffect` | 使えない          | 使える                  |
| `async` コンポーネント   | 可能               | 不可                    |
| ブラウザ API             | 使えない           | 使える                  |
| DB / ファイルシステム    | 直接アクセス可能   | 不可                    |
| バンドルサイズ           | 含まれない         | 含まれる                |

### Async Server Component

```tsx
// Server Component (デフォルト)
async function UserList() {
  const users = await db.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Client Component との境界

```tsx
// Server Component
import { ClientSearch } from "./client-search";

async function SearchPage() {
  const categories = await db.category.findMany();

  return (
    <div>
      <h1>Search</h1>
      {/* Client Component にシリアライズ可能な値のみ渡す */}
      <ClientSearch categories={categories} />
    </div>
  );
}
```

```tsx
// client-search.tsx
"use client";

import { useState } from "react";

export function ClientSearch({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  // ...
}
```

**渡せる Props**: string, number, boolean, Date, Array, plain Object, JSX (ReactNode)
**渡せない Props**: 関数, クラスインスタンス, Symbol

### Composition パターン（Children で Server Component を渡す）

```tsx
// Server Component
async function Page() {
  const data = await fetchData();

  return (
    <ClientLayout>
      {/* Server Component を children として渡す */}
      <ServerContent data={data} />
    </ClientLayout>
  );
}
```

```tsx
// client-layout.tsx
"use client";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <main>{children}</main>
    </div>
  );
}
```

**Point**: Client Component の `children` に Server Component を渡すことで、Server Component のメリットを維持しつつインタラクティブなレイアウトを実現。

## Server Actions (React 19)

### 基本

```tsx
// actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  await db.post.create({ data: { title, body } });
  revalidatePath("/posts");
}
```

```tsx
// Client Component から使用
"use client";

import { createPost } from "./actions";

export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="body" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Server Action + useActionState

```tsx
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

type State = { error: string | null; success: boolean };

export function PostForm() {
  const [state, action, isPending] = useActionState<State, FormData>(
    async (prevState, formData) => {
      try {
        await createPost(formData);
        return { error: null, success: true };
      } catch (e) {
        return { error: (e as Error).message, success: false };
      }
    },
    { error: null, success: false }
  );

  return (
    <form action={action}>
      <input name="title" />
      <textarea name="body" />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Created!</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Server Action + useOptimistic

```tsx
"use client";

import { useOptimistic, useActionState } from "react";
import { toggleLike } from "./actions";

export function LikeButton({ liked, count }: { liked: boolean; count: number }) {
  const [optimistic, setOptimistic] = useOptimistic(
    { liked, count },
    (current, _action: void) => ({
      liked: !current.liked,
      count: current.liked ? current.count - 1 : current.count + 1,
    })
  );

  const [, action] = useActionState(async () => {
    setOptimistic();
    await toggleLike();
    return null;
  }, null);

  return (
    <form action={action}>
      <button type="submit">
        {optimistic.liked ? "Unlike" : "Like"} ({optimistic.count})
      </button>
    </form>
  );
}
```

## 判断基準

| 状況                                   | 選択              |
| -------------------------------------- | ----------------- |
| データ取得のみ、インタラクションなし   | Server Component  |
| `useState` / イベントハンドラが必要    | Client Component  |
| フォーム送信、データ変更               | Server Action     |
| ブラウザ API (`window`, `localStorage`) | Client Component |
| 重いライブラリの使用                   | Server Component（バンドル削減） |
