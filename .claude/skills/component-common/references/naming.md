# Naming & Export Conventions

## File Naming

| Category  | Convention | Example            |
| --------- | ---------- | ------------------ |
| Directory | kebab-case | `user-avatar/`     |
| File      | kebab-case | `user-avatar.tsx`  |
| Component | PascalCase | `UserAvatar`       |
| Props     | PascalCase | `UserAvatarProps`  |
| Hook      | camelCase  | `useUserAvatar`    |
| Store     | kebab-case | `user-atoms.ts`    |
| Type file | kebab-case | `user-types.ts`    |

## File Structure per Component

```
components/ui/{name}/
├── {name}.tsx          # Component implementation
├── {name}.test.tsx     # Tests (= spec)
└── index.ts            # Public exports
```

## Export Patterns

### Single Component

```tsx
// components/ui/button/index.ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
```

### Component Group

```tsx
// components/ui/index.ts
export * from "./button";
export * from "./card";
export * from "./input";
```

### Feature Module

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { isAuthenticatedAtom, userValueAtom } from "./stores/auth-atoms";
export type { User, LoginCredentials } from "./types";
```

## Key Principles

1. Typed variants (union types, not magic strings)
2. Sensible defaults for optional props
3. No business logic / API calls in Presentation components
4. No global state (no Jotai, no Context) in Presentation components
