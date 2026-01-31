---
name: react-declarative
description: React の宣言的設計パターン。コンポーネントは「何をするか」を宣言し、「どうやるか」はカスタムフック・utils に委譲する。コンポーネント実装時やコードレビュー時に使用。component-common（構成・命名）や jotai-patterns（状態管理）と組み合わせて使う。
---

# React Declarative Patterns

コンポーネントの内部実装を宣言的に保つためのパターン。

Related skills:
- **component-common**: ディレクトリ構成、命名、Presentation/Container 判断
- **jotai-patterns**: Atom 設計、状態管理
- **tdd-patterns**: テスト駆動開発

## Core Principle

**コンポーネントは「何をするか」を宣言する場所であり、「どうやるか」を記述する場所ではない。**

ロジックはカスタムフック・utils に分離し、コンポーネントのトップレベルを見るだけで振る舞いが把握できる状態を目指す。

## Good / Bad Examples

### Good: フックの呼び出しだけで意図が明確

```tsx
export function UserProfile({ userId }: UserProfileProps) {
  const user = useUser(userId);
  const avatar = useAvatar(user.avatarId);
  const { isEditing, startEdit, cancelEdit } = useEditMode();

  return (
    <ProfileCard
      user={user}
      avatar={avatar}
      isEditing={isEditing}
      onEdit={startEdit}
      onCancel={cancelEdit}
    />
  );
}
```

### Bad: コンポーネント内にロジックが散在

```tsx
// NG: ロジックがコンポーネントに直接書かれている
export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      if (data.avatarId) {
        fetchAvatar(data.avatarId).then(setAvatar);
      }
    });
  }, [userId]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  // ...
}
```

## Rules

1. **コンポーネントにロジックを直接書かない** — `useState`, `useEffect`, `useCallback`, `useMemo` などを直接並べず、カスタムフックに包む
2. **カスタムフックは意図を名前で表現する** — `useUser`, `useEditMode`, `useFormValidation` のように「何を提供するか」が名前から読み取れる
3. **純粋な計算は utils に分離する** — React に依存しないロジック（バリデーション、フォーマット、変換など）は utils 関数として切り出す
4. **コンポーネントのトップレベルはフック呼び出しと JSX のみ** — 条件分岐やループはフックの内部か JSX 内に閉じる

## References

- [hooks.md](references/hooks.md) - カスタムフックの設計パターン
- [utils.md](references/utils.md) - Utils 分離の基準とパターン

## Checklist

- [ ] コンポーネントのトップレベルがフック呼び出し + JSX のみになっているか？
- [ ] 各フック呼び出しの名前だけで、そのコンポーネントの振る舞いが把握できるか？
- [ ] `useState` / `useEffect` / `useCallback` / `useMemo` がコンポーネントに直接書かれていないか？
- [ ] React に依存しない計算ロジックは utils に切り出されているか？
- [ ] カスタムフック名が「何を提供するか」を表現しているか？
