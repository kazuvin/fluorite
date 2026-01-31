# トークンの追加・変更手順

## 1. トークンを定義

`packages/design-tokens/src/tokens/` の対応ファイルにトークンを追加する。

```ts
// 例: spacing.ts に新しいトークンを追加
export const spacing = {
  // ... 既存
  "20": "80px",  // 追加
} as const;
```

カラーの場合は `light` と `dark` の両方に追加すること。

```ts
// 例: colors.ts に新しいカラーを追加
export const colors = {
  light: {
    // ... 既存
    success: "#16a34a",  // 追加
  },
  dark: {
    // ... 既存
    success: "#4ade80",  // 追加
  },
} as const;
```

## 2. 型をエクスポート

新しいトークンカテゴリを追加した場合は `tokens/index.ts` と `src/index.ts` からエクスポートする。

## 3. CSS を再生成

```bash
pnpm build:tokens
```

`generated/theme.css` が更新される。このファイルは git 管理されているのでコミットに含める。

## 4. テストを追加

新しいトークンカテゴリを追加した場合は `__tests__/tokens.test.ts` にテストを追加する。

```ts
it("新しいトークンの値はすべて期待する形式", () => {
  for (const value of Object.values(newTokens)) {
    expect(value).toMatch(/^\d+px$/);
  }
});
```

## 5. 検証

```bash
pnpm test:tokens    # テスト実行
pnpm typecheck      # 型チェック
```
