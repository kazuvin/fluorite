# Valibot 基礎: スキーマ定義と型導出

## インポート

```ts
import * as v from "valibot";
```

**ルール**: 名前空間インポート (`* as v`) を使う。個別インポートしない。

## 基本スキーマ

```ts
const UserSchema = v.object({
  id: v.string(),
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(0)),
});

// スキーマから型を導出
type User = v.InferOutput<typeof UserSchema>;
```

## パース

### `v.parse` — 信頼できないデータの厳密なパース

```ts
// 失敗時は ValiError をスロー
const user = v.parse(UserSchema, data);
```

### `v.safeParse` — エラーハンドリングが必要な場合

```ts
const result = v.safeParse(UserSchema, data);
if (result.success) {
  console.log(result.output);
} else {
  console.log(result.issues);
}
```

## よく使うスキーマ

### プリミティブ

```ts
v.string();
v.number();
v.boolean();
v.null_();
v.undefined_();
v.literal("admin");
```

### バリデーション付き (v.pipe)

```ts
v.pipe(v.string(), v.minLength(1)); // 空文字禁止
v.pipe(v.string(), v.email()); // メール形式
v.pipe(v.string(), v.url()); // URL 形式
v.pipe(v.string(), v.regex(/^[a-z]+$/)); // 正規表現
v.pipe(v.number(), v.minValue(0)); // 0 以上
v.pipe(v.number(), v.integer()); // 整数
```

### 複合型

```ts
v.array(v.string()); // string[]
v.optional(v.string()); // string | undefined
v.nullable(v.string()); // string | null
v.union([v.string(), v.number()]); // string | number
v.record(v.string(), v.number()); // Record<string, number>
```

### オブジェクト

```ts
// 部分的 (Partial)
v.partial(UserSchema);

// 必須フィールドのみ取得 (Pick)
v.pick(UserSchema, ["id", "name"]);

// フィールドを除外 (Omit)
v.omit(UserSchema, ["age"]);

// マージ
v.object({ ...UserSchema.entries, role: v.literal("admin") });
```

## 型導出

```ts
const LoginFormSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

// 入力型 (変換前)
type LoginFormInput = v.InferInput<typeof LoginFormSchema>;

// 出力型 (変換後)
type LoginFormOutput = v.InferOutput<typeof LoginFormSchema>;
```

**ルール**: `interface` や `type` を手書きせず、スキーマから導出する。
