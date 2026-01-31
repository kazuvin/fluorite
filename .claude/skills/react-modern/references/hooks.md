# React 18/19 Hooks

## `use()` (React 19)

Promise または Context を読み取る。コンポーネント内の条件分岐・ループ内でも使用可能（通常の Hooks ルールの例外）。

### Promise の読み取り

```tsx
import { use, Suspense } from "react";

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <p>{user.name}</p>;
}

// 親コンポーネントで Suspense を設定
function Page({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId); // render 中に呼ぶ
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

**注意**: `use()` に渡す Promise はレンダー中に毎回新しく生成しない。キャッシュされた Promise か、親から props で渡す。

### Context の読み取り

```tsx
import { use } from "react";

function ThemeButton() {
  // 条件分岐内でも使える
  if (someCondition) {
    const theme = use(ThemeContext);
    return <button className={theme.primary}>Click</button>;
  }
  return <button>Default</button>;
}
```

## `useActionState` (React 19)

フォームアクションと状態を統合管理する。

```tsx
import { useActionState } from "react";

function LoginForm() {
  const [state, submitAction, isPending] = useActionState(
    async (prevState: LoginState, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const result = await login(email, password);
      if (!result.ok) {
        return { error: result.message };
      }
      redirect("/dashboard");
      return { error: null };
    },
    { error: null } // initial state
  );

  return (
    <form action={submitAction}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
```

**Point**: `<form action={...}>` と組み合わせる。`onSubmit` + `preventDefault` は不要。

## `useOptimistic` (React 19)

サーバー応答を待たずに UI を即時更新する。

```tsx
import { useOptimistic, useActionState } from "react";

function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (current, newTodo: Todo) => [...current, newTodo]
  );

  const [, submitAction] = useActionState(
    async (_prev: null, formData: FormData) => {
      const title = formData.get("title") as string;
      const tempTodo = { id: crypto.randomUUID(), title, pending: true };
      addOptimistic(tempTodo);
      await createTodo(title);
      return null;
    },
    null
  );

  return (
    <>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
      <form action={submitAction}>
        <input name="title" />
        <button type="submit">Add</button>
      </form>
    </>
  );
}
```

## `useTransition` (React 18)

重い状態更新を低優先度にし、UI の応答性を維持する。

```tsx
import { useState, useTransition } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value); // 高優先度: 入力欄を即時更新

    startTransition(async () => {
      const data = await search(value); // 低優先度: 結果の更新
      setResults(data);
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList items={results} />
    </>
  );
}
```

**React 19**: `startTransition` に async 関数を渡せるようになった。

## `useDeferredValue` (React 18)

値の更新を遅延させ、UI の応答性を維持する。`useTransition` の値バージョン。

```tsx
import { useDeferredValue, useMemo } from "react";

function FilteredList({ query, items }: { query: string; items: Item[] }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const filtered = useMemo(
    () => items.filter((item) => item.name.includes(deferredQuery)),
    [deferredQuery, items]
  );

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {filtered.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**React 19**: `useDeferredValue` に初期値を指定可能 → `useDeferredValue(query, "")`

## `useId` (React 18)

SSR/CSR 間で一貫した一意 ID を生成する。

```tsx
import { useId } from "react";

function FormField({ label }: { label: string }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

**注意**: リストの `key` には使わない。あくまで DOM 属性用。

## `useSyncExternalStore` (React 18)

外部ストア（ブラウザ API、サードパーティライブラリなど）を React と安全に同期する。

```tsx
import { useSyncExternalStore } from "react";

function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    () => navigator.onLine,       // client
    () => true                    // server (SSR)
  );
}
```

## ref の新しいパターン (React 19)

### forwardRef 不要

```tsx
// React 19: ref は通常の props
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

### ref callback の cleanup

```tsx
function MeasuredDiv() {
  return (
    <div
      ref={(node) => {
        if (node) {
          const observer = new ResizeObserver(() => { /* ... */ });
          observer.observe(node);
          // cleanup 関数を return
          return () => observer.disconnect();
        }
      }}
    />
  );
}
```
