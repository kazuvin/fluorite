# カスタムフック設計パターン

## フックの分離基準

以下のいずれかに該当する場合、カスタムフックに切り出す:

1. **状態 + 操作のセット** — `useState` と、その状態を操作する関数がセットになっている
2. **データ取得** — `use()` + Suspense でデータをフェッチしている
3. **複数の状態が連動する** — ある状態の変更が別の状態にも影響する
4. **コンポーネントが 1 つでも** — 再利用性ではなく可読性のために分離する

## パターン

### 1. 状態 + 操作の封じ込め

```tsx
// hooks/use-edit-mode.ts
export function useEditMode() {
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => setIsEditing(false);

  return { isEditing, startEdit, cancelEdit } as const;
}
```

**ポイント**: コンポーネントからは `useEditMode()` の一行で済み、`useState` の実装詳細を意識しない。

### 2. データ取得の抽象化

```tsx
// hooks/use-user.ts
export function useUser(userPromise: Promise<User>) {
  const user = use(userPromise);
  return user;
}

// 親コンポーネントで Suspense を設定
function UserPage({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId);
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

**ポイント**: `useEffect` + `useState` での fetch ではなく `use()` + `<Suspense>` を使う。Promise はレンダー毎に新規生成せず、キャッシュか props 経由で渡す。

### 3. フォーム管理

```tsx
// hooks/use-login-form.ts
import { useActionState } from "react";

export function useLoginForm() {
  const [state, submitAction, isPending] = useActionState(
    async (prevState: LoginState, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const validation = validateLoginForm({ email, password });
      if (!validation.isValid) {
        return { error: validation.message };
      }
      const result = await login(email, password);
      if (!result.ok) {
        return { error: result.message };
      }
      redirect("/dashboard");
      return { error: null };
    },
    { error: null }
  );

  return { state, submitAction, isPending } as const;
}

// 使用側
function LoginForm() {
  const { state, submitAction, isPending } = useLoginForm();

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

**ポイント**: `useState` + `onSubmit` の手動管理ではなく `useActionState` + `<form action={...}>` を使う。

### 4. 複数フックの組み合わせ

コンポーネントがフックを 4 つ以上呼ぶ場合でも、各フックの責務が明確であれば問題ない。
フックをさらにまとめるのは、それ自体が意味のある単位になる場合のみ行う。

```tsx
// Good: 各フックが独立した責務を持つ
export function Dashboard() {
  const metrics = useMetrics();
  const notifications = useNotifications();
  const { filter, setFilter } = useFilter();
  const charts = useCharts(filter);

  return <DashboardView /* ... */ />;
}
```

## フックの命名規則

| パターン             | 命名例                | 返り値                     |
| -------------------- | --------------------- | -------------------------- |
| データ取得           | `useUser(promise)`    | データそのもの             |
| 状態 + 操作          | `useEditMode()`       | `{ state, actions }`      |
| フォームアクション   | `useLoginForm()`      | `{ state, submitAction, isPending }` |
| UI 状態              | `useDisclosure()`     | `{ isOpen, open, close }` |
