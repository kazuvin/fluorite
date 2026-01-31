---
description: Run all CI checks (lint, typecheck, test, build)
---

# CI Check

Run all CI checks for the fluorite monorepo. Execute each step sequentially and report results.

## Steps

Run the following checks in order. Stop and report on the first failure.

### 1. Lint (Biome)

```bash
pnpm lint
```

Verify that all files pass Biome linting rules (formatting, import organization, lint rules).

### 2. Type Check

```bash
pnpm typecheck
```

Verify that all packages and apps pass TypeScript type checking without errors.

### 3. Test

```bash
pnpm test
```

Run the test suite (currently `@fluorite/core` via Vitest).

### 4. Build

```bash
pnpm build:core
```

Verify that the core package builds successfully.

## Reporting

After all steps complete (or on failure), provide a summary:

- For each step: PASS or FAIL with details
- If any step fails, suggest fixes
- If all steps pass, confirm the codebase is CI-ready
