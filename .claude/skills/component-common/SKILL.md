---
name: component-common
description: コンポーネント設計の共通パターン。Presentation/Container の判断基準、命名規則、ディレクトリ構成、Jotai Container パターンを定義。プラットフォーム固有の実装は component-creator-mobile または component-creator-desktop スキルを参照。
---

# コンポーネント共通パターン

プラットフォーム共通のコンポーネント設計パターン。

関連スキル:
- **component-creator-mobile**: React Native / Expo 固有の実装パターン
- **component-creator-desktop**: Tauri (React + Vite) 固有の実装パターン
- **jotai-patterns**: Container 用の Atom 設計

## 判断ガイド

| リクエスト内容                  | タイプ        | 配置先                 |
| ----------------------------- | ------------ | ---------------------- |
| Button, Input, Card, Modal    | Presentation | `components/ui/`       |
| Header, Footer, TabBar        | Presentation | `components/layout/`   |
| Login form with auth logic    | Container    | `features/auth/`       |
| Dashboard with data fetch     | Container    | `features/dashboard/`  |

**ルール**: Jotai atoms または API 呼び出し → Container。純粋な UI → Presentation。

## 命名規則

- Directory: kebab-case (`user-avatar/`)
- File: kebab-case (`user-avatar.tsx`)
- Component: PascalCase (`UserAvatar`)
- Props: `{Name}Props` (`UserAvatarProps`)

## ディレクトリ構成

### Presentation

```
components/
├── ui/        # プリミティブ (Button, Input, Card)
├── layout/    # レイアウト (Header, Footer)
└── shared/    # 共有コンポーネント
```

### Container (Feature)

```
features/{feature}/
├── components/     # 機能 UI
├── stores/         # Jotai atoms
├── hooks/          # カスタムフック (オプション)
├── types/          # 型定義
└── index.ts        # 公開 API
```

## リファレンス

- [container.md](references/container.md) - Container/Feature パターン共通
- [naming.md](references/naming.md) - 命名規則とエクスポート
