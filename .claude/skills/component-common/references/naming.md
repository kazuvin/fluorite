# 命名とエクスポート規則

## ファイル命名

| カテゴリ    | 規則       | 例                 |
| ---------- | ---------- | ------------------ |
| Directory  | kebab-case | `user-avatar/`     |
| File       | kebab-case | `user-avatar.tsx`  |
| Component  | PascalCase | `UserAvatar`       |
| Props      | PascalCase | `UserAvatarProps`  |
| Hook       | camelCase  | `useUserAvatar`    |
| Store      | kebab-case | `user-atoms.ts`    |
| Type file  | kebab-case | `user-types.ts`    |

## コンポーネント単位のファイル構成

```
components/ui/{name}/
├── {name}.tsx          # コンポーネント実装
├── {name}.test.tsx     # テスト (= 仕様)
└── index.ts            # 公開エクスポート
```

## エクスポートパターン

### 単一コンポーネント

```tsx
// components/ui/button/index.ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
```

### コンポーネントグループ

```tsx
// components/ui/index.ts
export * from "./button";
export * from "./card";
export * from "./input";
```

### 機能モジュール

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { isAuthenticatedAtom, userValueAtom } from "./stores/auth-atoms";
export type { User, LoginCredentials } from "./types";
```

## 原則

1. 型付きバリアント (union types、マジックストリング禁止)
2. オプション props には適切なデフォルト値
3. Presentation コンポーネントにビジネスロジック・API 呼び出し禁止
4. Presentation コンポーネントにグローバル状態 (Jotai, Context) 禁止
