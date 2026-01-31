# Presentation Components (Web / Tailwind CSS)

共通パターン: see **component-common** skill

## Template

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

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;
```

## Key Principles (Web Specific)

1. Extend native HTML: `ComponentProps<"element">`
2. Composable styling: accept `className`, merge with `cn()`
3. No forwardRef (React 19: ref in ComponentProps)
4. Tailwind for utility-first styling
5. `as const` for variant/size style objects

## cn() Utility

```tsx
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Compound Components

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
