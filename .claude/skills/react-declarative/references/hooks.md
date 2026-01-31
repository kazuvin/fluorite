# カスタムフック設計パターン

## フックの分離基準

以下のいずれかに該当する場合、カスタムフックに切り出す:

1. **状態 + 操作のセット** — `useState` と、その状態を操作する関数がセットになっている
2. **副作用を伴うデータ取得** — `useEffect` でデータをフェッチしている
3. **複数の状態が連動する** — ある状態の変更が別の状態にも影響する
4. **コンポーネントが 1 つでも** — 再利用性ではなく可読性のために分離する

## パターン

### 1. 状態 + 操作の封じ込め

```tsx
// hooks/use-edit-mode.ts
export function useEditMode() {
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = useCallback(() => setIsEditing(true), []);
  const cancelEdit = useCallback(() => setIsEditing(false), []);

  return { isEditing, startEdit, cancelEdit } as const;
}
```

**ポイント**: コンポーネントからは `useEditMode()` の一行で済み、`useState` / `useCallback` の実装詳細を意識しない。

### 2. データ取得の抽象化

```tsx
// hooks/use-user.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) throw new Promise(() => {}); // Suspense pattern

  return user;
}
```

**ポイント**: フェッチのタイミング・キャッシュ・エラーハンドリングは全てフック内に閉じる。

### 3. フォーム管理

```tsx
// hooks/use-login-form.ts
export function useLoginForm(onSubmit: (credentials: LoginCredentials) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const validation = validateLoginForm({ email, password });

  const handleSubmit = useCallback(() => {
    if (validation.isValid) {
      onSubmit({ email, password });
    }
  }, [email, password, validation.isValid, onSubmit]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    validation,
    handleSubmit,
  } as const;
}
```

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
| データ取得           | `useUser(id)`         | データそのもの             |
| 状態 + 操作          | `useEditMode()`       | `{ state, actions }`      |
| イベントハンドラ集約 | `useFormHandlers()`   | `{ onSubmit, onChange }`   |
| UI 状態              | `useDisclosure()`     | `{ isOpen, open, close }` |
