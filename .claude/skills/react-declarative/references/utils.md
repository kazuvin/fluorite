# Utils 分離パターン

## Utils に切り出す基準

**React に依存しないロジック** は全て utils に切り出す:

1. **バリデーション** — `validateEmail(email)`, `validatePassword(password)`
2. **フォーマット** — `formatDate(date)`, `formatCurrency(amount)`
3. **変換・計算** — `calculateTotal(items)`, `groupBy(items, key)`
4. **型ガード** — `isUser(value)`, `isError(value)`

## フックとの棲み分け

| 分類         | 置き場所   | 理由                                         |
| ------------ | ---------- | -------------------------------------------- |
| 純粋な計算   | `utils/`   | React に依存しない。テストが容易              |
| 状態を持つ   | `hooks/`   | `useState` / `useEffect` が必要              |
| Atom 操作    | `stores/`  | Jotai の atom として定義（jotai-patterns 参照） |

## パターン

### 1. バリデーション

```ts
// utils/validation.ts
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateLoginForm(values: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!values.email.includes("@")) {
    errors.email = "メールアドレスの形式が正しくありません";
  }
  if (values.password.length < 8) {
    errors.password = "パスワードは8文字以上で入力してください";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
```

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

### 3. フック内での utils 利用

```tsx
// hooks/use-login-form.ts
import { validateLoginForm } from "../utils/validation";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // utils の純粋関数を呼ぶだけ
  const validation = validateLoginForm({ email, password });

  return { email, setEmail, password, setPassword, validation } as const;
}
```

**ポイント**: フック内でもロジックは utils に委譲し、フックは状態管理と utils の接続に専念する。

## テスト容易性

utils は純粋関数なので、React のテスト環境なしでテストできる:

```ts
describe("validateLoginForm", () => {
  it("有効なフォーム値を受け入れる", () => {
    const result = validateLoginForm({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.isValid).toBe(true);
  });

  it("不正なメールアドレスを拒否する", () => {
    const result = validateLoginForm({
      email: "invalid",
      password: "password123",
    });
    expect(result.errors.email).toBeDefined();
  });
});
```
