---
description: すべての CI チェック（lint、typecheck、test、build）を実行する
---

# CI チェック

fluorite モノレポのすべての CI チェックを順序通り実行し、結果をレポートします。

## 実行手順

以下のチェックを順に実行します。最初の失敗で停止してレポートします。

### 1. Lint (Biome)

```bash
pnpm lint
```

### 2. 型チェック

```bash
pnpm typecheck
```

### 3. テスト

```bash
pnpm test
```

### 4. ビルド

```bash
pnpm build:core
```

## レポート

各ステップについて PASS または FAIL を表示します。失敗時は修正方法を提案します。
