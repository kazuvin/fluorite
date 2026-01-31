# 関数テストパターン

## 配置

```
src/lib/
├── utils.ts
├── utils.test.ts    ← 仕様書
└── ...
```

## テンプレート

```typescript
import { describe, expect, it } from "vitest";
import { functionName } from "./module";

/**
 * functionName 仕様
 *
 * 目的: [この関数が何をするか]
 * 入力: [受け取るパラメータ]
 * 出力: [返す値]
 */
describe("functionName", () => {
  describe("基本動作", () => {
    it("期待される出力を返すこと", () => {
      expect(functionName("input")).toBe("expected output");
    });

    it("複数引数を処理すること", () => {
      expect(functionName("a", "b", "c")).toBe("abc");
    });
  });

  describe("境界値", () => {
    it("空文字列を処理すること", () => {
      expect(functionName("")).toBe("");
    });

    it("最小値/最大値を処理すること", () => {
      expect(functionName(0)).toBe(0);
      expect(functionName(Number.MAX_SAFE_INTEGER)).toBeDefined();
    });
  });

  describe("エッジケース", () => {
    it("null/undefinedを処理すること", () => {
      expect(functionName(null)).toBe(defaultValue);
      expect(functionName(undefined)).toBe(defaultValue);
    });

    it("特殊文字を処理すること", () => {
      expect(functionName("日本語")).toBe("日本語");
      expect(functionName("émoji 🎉")).toBe("émoji 🎉");
    });
  });

  describe("エラーケース", () => {
    it("無効な入力でエラーをスローすること", () => {
      expect(() => functionName(-1)).toThrow("入力は正の数である必要があります");
    });
  });

  describe("型安全性", () => {
    it("正しい型を返すこと", () => {
      const result = functionName("input");
      expect(typeof result).toBe("string");
    });
  });
});
```

## パターン

### テーブル駆動テスト

```typescript
describe("capitalize", () => {
  it.each([
    ["hello", "Hello"],
    ["world", "World"],
    ["ALREADY", "ALREADY"],
    ["", ""],
  ])("capitalize(%s)は%sを返すこと", (input, expected) => {
    expect(capitalize(input)).toBe(expected);
  });
});
```

### 純粋関数

```typescript
describe("add", () => {
  it("交換法則を満たすこと: a + b = b + a", () => {
    expect(add(2, 3)).toBe(add(3, 2));
  });

  it("結合法則を満たすこと: (a + b) + c = a + (b + c)", () => {
    expect(add(add(1, 2), 3)).toBe(add(1, add(2, 3)));
  });

  it("単位元を持つこと: a + 0 = a", () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

### 変換

```typescript
describe("formatDate", () => {
  describe("入力形式", () => {
    it("Dateオブジェクトを受け入れること", () => {
      const date = new Date("2024-01-15");
      expect(formatDate(date)).toBe("2024-01-15");
    });

    it("ISO文字列を受け入れること", () => {
      expect(formatDate("2024-01-15T00:00:00Z")).toBe("2024-01-15");
    });
  });

  describe("出力形式", () => {
    it("デフォルトでYYYY-MM-DD形式にすること", () => {
      expect(formatDate(new Date("2024-01-15"))).toBe("2024-01-15");
    });

    it("カスタムフォーマットをサポートすること", () => {
      expect(formatDate(new Date("2024-01-15"), "MM/DD/YYYY")).toBe("01/15/2024");
    });
  });
});
```

### 配列/オブジェクト操作

```typescript
describe("groupBy", () => {
  const users = [
    { name: "Alice", role: "admin" },
    { name: "Bob", role: "user" },
    { name: "Carol", role: "admin" },
  ];

  it("キーでグループ化すること", () => {
    const grouped = groupBy(users, "role");
    expect(grouped).toEqual({
      admin: [{ name: "Alice", role: "admin" }, { name: "Carol", role: "admin" }],
      user: [{ name: "Bob", role: "user" }],
    });
  });

  it("空配列に対して空オブジェクトを返すこと", () => {
    expect(groupBy([], "key")).toEqual({});
  });
});
```
