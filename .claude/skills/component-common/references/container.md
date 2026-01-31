# Container コンポーネント (Features + Jotai)

Atom 設計: **jotai-patterns** スキルを参照。

## ディレクトリ構成

```
features/{feature}/
├── components/     # 機能 UI
├── stores/         # Jotai atoms
├── hooks/          # カスタムフック (オプション)
├── types/          # 型定義
└── index.ts        # 公開 API
```

## テンプレート

```tsx
import { useAtomValue, useSetAtom } from "jotai";
import { LoginFormPresentation } from "@/components/auth/login-form";
import { isLoadingAtom, errorValueAtom, loginAtom } from "../stores/auth-atoms";

export function LoginFormContainer() {
  const isLoading = useAtomValue(isLoadingAtom);
  const error = useAtomValue(errorValueAtom);
  const login = useSetAtom(loginAtom);

  return (
    <LoginFormPresentation
      isLoading={isLoading}
      error={error}
      onSubmit={(email, password) => login({ email, password })}
    />
  );
}
```

## 公開 API

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { isAuthenticatedAtom, userValueAtom } from "./stores/auth-atoms";
export type { User, LoginCredentials } from "./types";
```

## 原則

1. コロケーション: components, stores, hooks, types を feature フォルダ内に配置
2. Container/Presentation 分離
3. 必要なものだけをエクスポート
4. Container は hooks を使い、Presentation に props で渡す
5. Atom のカプセル化: **jotai-patterns** に従う
