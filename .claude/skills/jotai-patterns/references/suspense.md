# Suspense + Jotai (React Native)

Reference: https://zenn.dev/uhyo/books/learn-react-with-jotai

## Core Concept

派生atomでPromiseを返すと`useAtomValue`がサスペンド。Promiseはatomにキャッシュされる。

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

## Pattern 1: Parameter via Atom

同時に1つのパラメータでのみ非同期処理。

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

**ポイント**: パラメータ変更→自動再計算。「実行せよ」ではなく「パラメータ変更」の宣言的アプローチ。

## Pattern 2: atomFamily

複数パラメータで同時に非同期処理。パラメータごとにキャッシュ分離。

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

## Comparison

| 観点         | Pattern 1 (Atom)  | Pattern 2 (Family)  |
| ------------ | ----------------- | ------------------- |
| キャッシュ   | 1つ               | パラメータごと      |
| user1→2→1    | 再fetch           | キャッシュヒット    |
| メモリ       | 少                | パラメータ数に比例  |

## Memory Management

atomFamilyは不要なatomがメモリに残る。

```tsx
const userAtomFamily = atomFamily((userId: string) => atom(async () => fetchUser(userId)), {
  gcTime: 5 * 60 * 1000,  // 5分間アクセスなしで削除
});
```

## Complete Example: Search

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

## Key Insights

1. UI = f(state): Suspenseで非同期も「f」に組み込み
2. 宣言的: 「実行せよ」→「パラメータ変更」
3. ステート数削減: パラメータのみがステート（結果は派生）
