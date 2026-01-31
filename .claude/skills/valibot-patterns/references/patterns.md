# Valibot 実践パターン

## 1. フォームバリデーション

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

### フック内での利用

```ts
// features/auth/hooks/use-login-form.ts
import * as v from "valibot";
import { LoginFormSchema } from "../schemas/login-form-schema";

export function useLoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });

  const validation = v.safeParse(LoginFormSchema, values);
  const errors = validation.success
    ? {}
    : Object.fromEntries(
        validation.issues.map((issue) => [
          issue.path?.[0]?.key,
          issue.message,
        ]),
      );

  return { values, setValues, errors, isValid: validation.success } as const;
}
```

## 2. API レスポンスのパース

```ts
// features/user/schemas/user-schema.ts
import * as v from "valibot";

export const UserSchema = v.object({
  id: v.string(),
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  role: v.union([v.literal("admin"), v.literal("user")]),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

export type User = v.InferOutput<typeof UserSchema>;

const UsersResponseSchema = v.object({
  users: v.array(UserSchema),
  total: v.number(),
});

export type UsersResponse = v.InferOutput<typeof UsersResponseSchema>;

// API fetch で利用
export function parseUsersResponse(data: unknown): UsersResponse {
  return v.parse(UsersResponseSchema, data);
}
```

## 3. 環境変数の検証

```ts
// schemas/env-schema.ts
import * as v from "valibot";

const EnvSchema = v.object({
  API_BASE_URL: v.pipe(v.string(), v.url()),
  NODE_ENV: v.union([
    v.literal("development"),
    v.literal("production"),
    v.literal("test"),
  ]),
  PORT: v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1)),
});

export const env = v.parse(EnvSchema, process.env);
```

## 4. カスタムバリデーション

```ts
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, "8文字以上"),
  v.regex(/[A-Z]/, "大文字を含む"),
  v.regex(/[0-9]/, "数字を含む"),
);

// check でカスタムロジック
const DateRangeSchema = v.pipe(
  v.object({
    start: v.date(),
    end: v.date(),
  }),
  v.check(
    (input) => input.start < input.end,
    "開始日は終了日より前である必要があります",
  ),
);
```

## 5. スキーマの合成

```ts
// 基本スキーマ
const BaseEntitySchema = v.object({
  id: v.string(),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  updatedAt: v.pipe(v.string(), v.isoTimestamp()),
});

// 拡張
const UserSchema = v.object({
  ...BaseEntitySchema.entries,
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
});

// 作成用 (id, timestamps を除外)
const CreateUserSchema = v.omit(UserSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

// 更新用 (部分的)
const UpdateUserSchema = v.partial(
  v.omit(UserSchema, ["id", "createdAt", "updatedAt"]),
);
```

## ファイル配置ルール

| スキーマの種別       | 配置先                              |
| -------------------- | ----------------------------------- |
| Feature 固有         | `features/{feature}/schemas/`       |
| アプリ全体で共有     | `schemas/` (ルートレベル)           |
| 環境変数             | `schemas/env-schema.ts`             |
