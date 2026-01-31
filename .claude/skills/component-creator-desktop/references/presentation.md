# Presentation コンポーネント (Web / Tailwind CSS)

共通パターン: **component-common** スキル参照

## テンプレート

```tsx
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md font-medium transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// デザイントークンを @theme 経由で利用 (bg-tint, text-background など)
const variantStyles = {
  primary: "bg-tint text-background hover:opacity-90",
  secondary: "bg-icon/10 text-text hover:bg-icon/20",
  ghost: "bg-transparent text-text hover:bg-icon/10",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;
```

## 基本原則 (Web 固有)

1. ネイティブ HTML を拡張: `ComponentProps<"element">`
2. 合成可能なスタイル: `className` を受け取り `cn()` でマージ
3. forwardRef 不要 (React 19: ref は ComponentProps に含まれる)
4. Tailwind でユーティリティファースト (`@theme` トークン経由)
5. variant/size スタイルは `as const`
6. ハードコードされた色値の代わりに `@theme` のトークンを使う (`bg-background`, `text-text`, `text-tint` など)

## cn() ユーティリティ

```tsx
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 複合コンポーネント

```tsx
import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CardContext = createContext<{ variant: "default" | "outlined" } | null>(null);

export function Card({ variant = "default", className, children }: {
  variant?: "default" | "outlined";
  className?: string;
  children: ReactNode;
}) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn("rounded-lg", variantStyles[variant], className)}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-b p-4", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

const variantStyles = {
  default: "bg-white shadow-sm",
  outlined: "border border-gray-200 bg-white",
} as const;
```
