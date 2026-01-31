# Suspense + Jotai (React Native)

Reference: https://zenn.dev/uhyo/books/learn-react-with-jotai

## コア概念

派生atomでPromise返却→`useAtomValue`がサスペンド。Promiseはatomにキャッシュ。

```tsx
import { Text } from "react-native";

const userAtom = atom(async (): Promise<User> => {
  return await fetchUser();
});

const UserProfile: React.FC = () => {
  const user: User = useAtomValue(userAtom);  // User型（Promise<User>ではない）
  return <Text>{user.name}</Text>;
};

// 必ずSuspenseで囲む
<Suspense fallback={<Text>Loading...</Text>}>
  <UserProfile />
</Suspense>
```

## パターン1: atomでパラメータ管理

1パラメータのみ同時処理。

```tsx
const userIdAtom = atom<string | null>(null);  // private

const userAtom = atom(async (get): Promise<User | null> => {
  const userId = get(userIdAtom);
  if (!userId) return null;
  return await fetchUser(userId);
});

export const setUserIdAtom = atom(null, (get, set, userId: string | null) => set(userIdAtom, userId));
export const userValueAtom = atom((get) => get(userAtom));
```

**ポイント**: パラメータ変更→自動再計算。「実行せよ」でなく「パラメータ変更」の宣言的アプローチ。

## パターン2: atomFamily

複数パラメータ同時処理。パラメータごとキャッシュ分離。

```tsx
import { atomFamily } from "jotai-family";

const userAtomFamily = atomFamily((userId: string) =>
  atom(async () => await fetchUser(userId))
);

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const user = useAtomValue(userAtomFamily(userId));
  return <Text>{user.name}</Text>;
};
```

## 比較

| 観点         | パターン1 (Atom)  | パターン2 (Family)  |
| ------------ | ----------------- | ------------------- |
| キャッシュ   | 1つ               | パラメータごと      |
| user1→2→1    | 再fetch           | キャッシュヒット    |
| メモリ       | 少                | パラメータ数に比例  |

## メモリ管理

atomFamilyは不要なatomがメモリ残留。

```tsx
const userAtomFamily = atomFamily((userId: string) => atom(async () => fetchUser(userId)), {
  gcTime: 5 * 60 * 1000,  // 5分間アクセスなしで削除
});
```

## 検索機能の実装例

```tsx
// Private
const keywordAtom = atom("");
const searchResultsInternalAtom = atom(async (get): Promise<Product[]> => {
  const keyword = get(keywordAtom);
  if (!keyword) return [];
  return await searchProducts(keyword);
});

// Exports
export const keywordValueAtom = atom((get) => get(keywordAtom));
export const searchResultsAtom = atom((get) => get(searchResultsInternalAtom));
export const setKeywordAtom = atom(null, (get, set, keyword: string) => set(keywordAtom, keyword));
```

## 要点

1. UI = f(state): Suspenseで非同期も「f」に組込
2. 宣言的: 「実行せよ」→「パラメータ変更」
3. ステート削減: パラメータのみステート（結果は派生）
