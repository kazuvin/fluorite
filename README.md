# fluorite

Markdown ベースのカレンダーアプリケーション。イベントを Markdown 形式で管理できます。

## 技術スタック

- **モノレポ:** pnpm workspaces
- **コアライブラリ:** TypeScript (Vitest でテスト)
- **デスクトップ:** React + Vite + Tauri 2
- **モバイル:** React Native + Expo 54

## セットアップ

```bash
pnpm install
```

## 開発

```bash
# デスクトップアプリ
pnpm dev:desktop

# モバイルアプリ
pnpm dev:mobile

# コアライブラリ (watch モード)
pnpm dev:core
```

## テスト・品質チェック

```bash
pnpm test        # テスト実行
pnpm typecheck   # 型チェック
pnpm lint        # リント
pnpm format      # フォーマット
```

## ビルド

```bash
pnpm build:desktop
pnpm build:core
```
