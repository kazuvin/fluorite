---
name: component-common
description: コンポーネント設計の共通パターン。Presentation/Container の判断基準、命名規則、ディレクトリ構成、Jotai Container パターンを定義。プラットフォーム固有の実装は component-creator-mobile または component-creator-desktop スキルを参照。
---

# Component Common Patterns

プラットフォーム共通のコンポーネント設計パターン。

Related skills:
- **component-creator-mobile**: React Native / Expo 固有の実装パターン
- **component-creator-desktop**: Tauri (React + Vite) 固有の実装パターン
- **jotai-patterns**: Atom design for containers

## Decision Guide

| Request Type               | Type         | Location               |
| -------------------------- | ------------ | ---------------------- |
| Button, Input, Card, Modal | Presentation | `components/ui/`       |
| Header, Footer, TabBar     | Presentation | `components/layout/`   |
| Login form with auth logic | Container    | `features/auth/`       |
| Dashboard with data fetch  | Container    | `features/dashboard/`  |

**Rule**: Jotai atoms or API calls → Container. Pure UI → Presentation.

## Naming Conventions

- Directory: kebab-case (`user-avatar/`)
- File: kebab-case (`user-avatar.tsx`)
- Component: PascalCase (`UserAvatar`)
- Props: `{Name}Props` (`UserAvatarProps`)

## Directory Structure

### Presentation

```
components/
├── ui/        # Primitives (Button, Input, Card)
├── layout/    # Layout (Header, Footer)
└── shared/    # Shared composites
```

### Container (Feature)

```
features/{feature}/
├── components/     # Feature UI
├── stores/         # Jotai atoms
├── hooks/          # Custom hooks (optional)
├── types/          # Types
└── index.ts        # Public API
```

## References

- [container.md](references/container.md) - Container/Feature パターン共通
- [naming.md](references/naming.md) - 命名規則とエクスポート

## Checklist

- [ ] Presentation or Container?
- [ ] Correct directory
- [ ] kebab-case files, PascalCase components
- [ ] `index.ts` exports
- [ ] Props typed (no `any`)
- [ ] Platform-specific skill も参照したか？
