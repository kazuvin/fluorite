---
name: valibot-patterns
description: Valibot を使った汎用スキーマ定義パターン。フォームバリデーション、API レスポンスのパース、環境変数の検証など、システム境界でのデータ検証に使用。react-declarative(utils 分離)や component-common(ディレクトリ構成)と組み合わせて使う。
---

# Valibot パターン

**コアルール**: システム境界のデータ検証には Valibot スキーマを使う。手書きバリデーション関数を書かない。

```ts
// NG: 手書きバリデーション
function validateEmail(email: string): boolean {
  return email.includes("@");
}

// OK: Valibot スキーマ
import * as v from "valibot";
const EmailSchema = v.pipe(v.string(), v.email());
```

## パターンガイド

| 用途                   | パターン                 | 参照                           |
| ---------------------- | ------------------------ | ------------------------------ |
| 基本的なスキーマ定義   | Schema + `v.parse`       | [basics](references/basics.md) |
| フォームバリデーション | Schema + `v.safeParse`   | [basics](references/basics.md) |
| API レスポンスのパース | Schema + `v.parse`       | [patterns](references/patterns.md) |
| 型の導出               | `v.InferOutput`          | [basics](references/basics.md) |
| カスタムバリデーション | `v.pipe` + `v.check`     | [patterns](references/patterns.md) |

## 命名規則

| タイプ           | パターン             | 例                        |
| ---------------- | -------------------- | ------------------------- |
| スキーマ         | `XxxSchema`          | `UserSchema`              |
| 導出型           | `Xxx`                | `User`                    |
| バリデーション   | `parseXxx` / `validateXxx` | `parseUser` / `validateLoginForm` |

## ファイル構造

```
features/{feature}/
├── schemas/        # Valibot スキーマ定義
├── components/
├── stores/
├── hooks/
├── types/          # スキーマから導出できない型のみ
└── index.ts
```

**ポイント**: スキーマから `v.InferOutput` で型を導出できる場合、`types/` に手書きの型定義を置かない。

## リファレンス

- [basics.md](references/basics.md) - スキーマ定義の基礎と型導出
- [patterns.md](references/patterns.md) - 実践的な利用パターン
