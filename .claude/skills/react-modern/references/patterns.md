# Suspense / Transition / Streaming Patterns

## Suspense パターン

### 基本構成

```tsx
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
```

### ネストした Suspense（段階的ローディング）

```tsx
function Dashboard() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
      <main>
        <Suspense fallback={<ChartSkeleton />}>
          <Chart />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <DataTable />
        </Suspense>
      </main>
    </Suspense>
  );
}
```

**Point**: 外側の Suspense が先に解決 → 内側の各セクションが独立してロード。ユーザーは段階的にコンテンツを見られる。

### Suspense + use() のデータフェッチ

```tsx
// データフェッチ関数（キャッシュ付き）
const cache = new Map<string, Promise<User>>();

function fetchUserCached(id: string): Promise<User> {
  if (!cache.has(id)) {
    cache.set(id, fetchUser(id));
  }
  return cache.get(id)!;
}

// 親コンポーネント
function UserPage({ userId }: { userId: string }) {
  const userPromise = fetchUserCached(userId);
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserDetail userPromise={userPromise} />
    </Suspense>
  );
}

// 子コンポーネント
function UserDetail({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

## Transition パターン

### ナビゲーション Transition

```tsx
import { useTransition } from "react";

function TabContainer() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <TabBar selected={tab} onSelect={selectTab} />
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {tab === "home" && <Home />}
        {tab === "posts" && <Posts />}
        {tab === "settings" && <Settings />}
      </div>
    </>
  );
}
```

**Point**: タブ切り替え時に前のタブが表示されたまま新しいタブのコンテンツを準備。

### Transition + Suspense の連携

```tsx
function SearchResults() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    startTransition(() => {
      setQuery(value);
    });
  }

  return (
    <>
      <SearchInput onChange={handleSearch} />
      {isPending && <Spinner />}
      <Suspense fallback={<ResultsSkeleton />}>
        <Results query={query} />
      </Suspense>
    </>
  );
}
```

**Point**: `startTransition` 内で状態更新 → Suspense の fallback への切り替えを抑制し、前の結果を表示したまま新しい結果を準備する。

## ErrorBoundary パターン

Suspense と組み合わせてエラーハンドリングを行う。

```tsx
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorPage />}
      onReset={() => {
        // リセット時の処理
      }}
    >
      <Suspense fallback={<Loading />}>
        <MainContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**構成順序**: `ErrorBoundary` > `Suspense` > データを使うコンポーネント

## Activity API (React 19, experimental)

画面外のコンポーネントの優先度を下げる。

```tsx
import { unstable_Activity as Activity } from "react";

function TabContent({ activeTab }: { activeTab: string }) {
  return (
    <>
      <Activity mode={activeTab === "home" ? "visible" : "hidden"}>
        <Home />
      </Activity>
      <Activity mode={activeTab === "posts" ? "visible" : "hidden"}>
        <Posts />
      </Activity>
    </>
  );
}
```

**Point**: `hidden` のコンポーネントは低優先度でレンダーされるが、状態は保持される。タブ切り替え時の再マウントを防ぐ。experimental API のため注意。
