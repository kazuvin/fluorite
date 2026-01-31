# 非同期テストパターン

## 非同期関数

```typescript
import { describe, expect, it, vi } from "vitest";

describe("fetchUser", () => {
  describe("正常系", () => {
    it("ユーザーデータを返すこと", async () => {
      const user = await fetchUser("123");
      expect(user).toEqual({
        id: "123",
        name: "Test User",
        email: "test@example.com",
      });
    });

    it("正しい構造でresolveすること", async () => {
      const user = await fetchUser("123");
      expect(user).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("異常系", () => {
    it("存在しないユーザーでエラーをスローすること", async () => {
      await expect(fetchUser("non-existent")).rejects.toThrow("ユーザーが見つかりません");
    });
  });
});
```

## API呼び出しモック

### vi.mock使用

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getUsers } from "./api";
import * as httpClient from "./http-client";

vi.mock("./http-client");

describe("getUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("APIからユーザーを取得すること", async () => {
    const mockUsers = [{ id: "1", name: "User 1" }];
    vi.mocked(httpClient.get).mockResolvedValue({ data: mockUsers });

    const users = await getUsers();

    expect(httpClient.get).toHaveBeenCalledWith("/users");
    expect(users).toEqual(mockUsers);
  });
});
```

### MSW使用

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) => {
    if (params.id === "not-found") {
      return HttpResponse.json({ error: "見つかりません" }, { status: 404 });
    }
    return HttpResponse.json({ id: params.id, name: "Test User" });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API統合テスト", () => {
  it("ユーザーを取得すること", async () => {
    const response = await fetch("/api/users/123");
    const data = await response.json();
    expect(data).toEqual({ id: "123", name: "Test User" });
  });

  it("404エラーを処理すること", async () => {
    const response = await fetch("/api/users/not-found");
    expect(response.status).toBe(404);
  });
});
```

## ローディング状態

```typescript
import { render, screen, waitFor } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";

describe("UserProfile", () => {
  it("取得中にローディングインジケーターを表示すること", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(fetchUser).mockReturnValue(promise);

    render(<UserProfile userId="123" />);

    // ローディング中
    expect(screen.getByTestId("loading-indicator")).toBeOnTheScreen();

    // 完了
    resolvePromise!({ id: "123", name: "Test User" });

    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).not.toBeOnTheScreen();
    });

    expect(screen.getByText("Test User")).toBeOnTheScreen();
  });

  it("エラー時にメッセージを表示すること", async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error("取得に失敗しました"));

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText("取得に失敗しました")).toBeOnTheScreen();
    });
  });
});
```

## デバウンス/スロットル

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./utils";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("実行を遅延させること", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("連続呼び出し時に前の呼び出しをキャンセルすること", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn("first");
    vi.advanceTimersByTime(100);

    debouncedFn("second");
    vi.advanceTimersByTime(100);

    debouncedFn("third");
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });
});
```

## Suspense

```typescript
import { render, screen } from "@testing-library/react-native";
import { Suspense } from "react";
import { Text } from "react-native";
import { describe, expect, it } from "vitest";

describe("Suspenseコンポーネント", () => {
  it("ローディング中にフォールバックを表示すること", async () => {
    render(
      <Suspense fallback={<Text>読み込み中...</Text>}>
        <AsyncComponent />
      </Suspense>
    );

    // フォールバック表示
    expect(screen.getByText("読み込み中...")).toBeOnTheScreen();

    // コンテンツ表示
    expect(await screen.findByText("読み込み完了")).toBeOnTheScreen();

    // フォールバック削除
    expect(screen.queryByText("読み込み中...")).not.toBeOnTheScreen();
  });
});
```
