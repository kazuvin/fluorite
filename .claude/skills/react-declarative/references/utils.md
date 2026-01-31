# Utils 分離パターン

## Utils に切り出す基準

**React に依存しないロジック** は全て utils に切り出す:

1. **バリデーション** — Valibot スキーマで定義する（**valibot-patterns** 参照）
2. **フォーマット** — `formatDate(date)`, `formatCurrency(amount)`
3. **変換・計算** — `calculateTotal(items)`, `groupBy(items, key)`
4. **型ガード** — `isUser(value)`, `isError(value)`

## フックとの棲み分け

| 分類         | 置き場所    | 理由                                         |
| ------------ | ----------- | -------------------------------------------- |
| 純粋な計算   | `utils/`    | React に依存しない。テストが容易              |
| バリデーション | `schemas/` | Valibot スキーマで定義（valibot-patterns 参照） |
| 状態を持つ   | `hooks/`    | `useState` / `useEffect` が必要              |
| Atom 操作    | `stores/`   | Jotai の atom として定義（jotai-patterns 参照） |

## パターン

### 1. バリデーション (Valibot スキーマ)

```ts
// features/auth/schemas/login-form-schema.ts
import * as v from "valibot";

export const LoginFormSchema = v.object({
  email: v.pipe(v.string(), v.email("メールアドレスの形式が正しくありません")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "パスワードは8文字以上で入力してください"),
  ),
});

export type LoginForm = v.InferOutput<typeof LoginFormSchema>;
```

詳細は **valibot-patterns** スキルを参照。

### 2. フォーマット

```ts
// utils/format.ts
export function formatDate(date: Date, locale = "ja-JP"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

### 3. フック内でのスキーマ利用

```tsx
// hooks/use-login-form.ts
import * as v from "valibot";
import { LoginFormSchema } from "../schemas/login-form-schema";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Valibot スキーマでバリデーション
  const result = v.safeParse(LoginFormSchema, { email, password });

  return { email, setEmail, password, setPassword, isValid: result.success } as const;
}
```

**ポイント**: フック内でもバリデーションロジックは Valibot スキーマに委譲し、フックは状態管理とスキーマの接続に専念する。

## テスト容易性

スキーマ・utils は純粋関数なので、React のテスト環境なしでテストできる:

```ts
import * as v from "valibot";
import { LoginFormSchema } from "../schemas/login-form-schema";

describe("LoginFormSchema", () => {
  it("有効なフォーム値を受け入れる", () => {
    const result = v.safeParse(LoginFormSchema, {
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("不正なメールアドレスを拒否する", () => {
    const result = v.safeParse(LoginFormSchema, {
      email: "invalid",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});
```
