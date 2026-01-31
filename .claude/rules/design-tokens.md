---
paths: packages/design-tokens/**
---

design-tokens 自動ビルド

`packages/design-tokens/src/tokens/` 配下のファイルを編集した場合、すべての編集が完了した後に以下を実行すること:

```bash
pnpm build:tokens && pnpm lint:fix
```

これにより `generated/theme.css` が再生成され、Biome でフォーマットされる。生成された `theme.css` はコミット対象に含める。
