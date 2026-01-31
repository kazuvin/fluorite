# Container Components (Features + Jotai)

Atom design: see **jotai-patterns** skill.

## Directory Structure

```
features/{feature}/
├── components/     # Feature UI
├── stores/         # Jotai atoms
├── hooks/          # Custom hooks (optional)
├── types/          # Types
└── index.ts        # Public API
```

## Template

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

## Public API

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { isAuthenticatedAtom, userValueAtom } from "./stores/auth-atoms";
export type { User, LoginCredentials } from "./types";
```

## Key Principles

1. Colocation: components, stores, hooks, types in feature folder
2. Container/Presentation split
3. Export only what others need
4. Container は hooks を使い、Presentation に props で渡す
5. Atom encapsulation: follow **jotai-patterns**
