---
name: component-creator-desktop
description: Tauri デスクトップアプリ (React + Vite) のコンポーネント作成。apps/desktop 配下の作業時に使用。Tailwind CSS, Radix UI, @testing-library/react を使用。デザイントークンは @fluorite/design-tokens から Tailwind v4 @theme 経由で利用。共通パターンは component-common スキルを参照。
---

# Component Creator - Desktop (Tauri / React + Vite)

関連スキル:
- **component-common**: 共通パターン (Decision Guide, 命名規則, Container パターン)
- **design-tokens**: デザイントークン (色・スペーシング等の SSoT)
- **jotai-patterns**: Container 向け Atom 設計

## クイックスタート

### Presentation

```tsx
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
```

### Container

```tsx
import { useAtomValue, useSetAtom } from "jotai";
import { isLoadingAtom, loginAtom } from "../stores/auth-atoms";

export function LoginForm() {
  const isLoading = useAtomValue(isLoadingAtom);
  const login = useSetAtom(loginAtom);
  // Container/Presentation 分離 → component-common 参照
}
```

### Provider セットアップ (Tauri)

```tsx
// src/main.tsx
import { Provider } from "jotai";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>
);
```

## リファレンス

- [presentation.md](references/presentation.md) - Web Presentation パターン (Tailwind)
- [ui-components.md](references/ui-components.md) - Radix UI / shadcn パターン
