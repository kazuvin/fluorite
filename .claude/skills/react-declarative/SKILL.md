---
name: react-declarative
description: React の宣言的設計パターン。コンポーネントは「何をするか」を宣言し、「どうやるか」はカスタムフック・utils に委譲する。コンポーネント実装時やコードレビュー時に使用。component-common(構成・命名)や jotai-patterns(状態管理)と組み合わせて使う。
---

# React 宣言的パターン

コンポーネントを宣言的に保つための設計パターン。

関連スキル:
- **component-common**: ディレクトリ構成、命名、Presentation/Container 判断
- **jotai-patterns**: Atom 設計、状態管理
- **valibot-patterns**: スキーマ定義、バリデーション
- **tdd-patterns**: テスト駆動開発

## 基本原則

**コンポーネントは「何をするか」を宣言する場所であり、「どうやるか」を記述する場所ではない。**

ロジックはカスタムフック・utils に分離し、コンポーネントのトップレベルを見るだけで振る舞いが把握できる状態を目指す。

## 良い例 / 悪い例

### 良い例: フックの呼び出しだけで意図が明確

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

### 悪い例: コンポーネント内にロジックが散在

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

## ルール

1. **コンポーネントにロジックを直接書かない** — `useState`, `useEffect`, `useCallback`, `useMemo` を直接並べず、カスタムフックに包む
2. **カスタムフックは意図を名前で表現する** — `useUser`, `useEditMode`, `useFormValidation` のように「何を提供するか」が名前から読み取れる
3. **純粋な計算は utils に分離する** — React に依存しないロジック(フォーマット、変換など)は utils 関数として切り出す。バリデーションは Valibot スキーマで定義する(**valibot-patterns** 参照)
4. **コンポーネントのトップレベルはフック呼び出しと JSX のみ** — 条件分岐やループはフックの内部か JSX 内に閉じる

## 参考資料

- [hooks.md](references/hooks.md) - カスタムフックの設計パターン
- [utils.md](references/utils.md) - Utils 分離の基準とパターン
