# アプリ層の組み込み設計

## 概要

`@fluorite/core` はプラットフォーム非依存の純粋ロジック層であり、ファイル I/O を含まない。
アプリ層（Desktop / Mobile）がファイルシステムへのアクセスを提供し、core の `VaultIndex` に注入する。

本ドキュメントでは、アプリ層が core をどのように組み込むかの設計を定義する。

## アーキテクチャ全体像

```
┌─────────────────────────────────────────────────┐
│  アプリ層 (Desktop: Tauri / Mobile: Expo)       │
│                                                 │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ File I/O   │  │ File Watch │  │ Cache I/O │ │
│  │ readFile() │  │ onChanged()│  │ load/save │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘ │
│        │               │               │       │
└────────┼───────────────┼───────────────┼───────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────┐
│  @fluorite/core                                 │
│                                                 │
│  VaultIndex                                     │
│  ├─ applySync(files, readFile)                  │
│  ├─ serialize() / deserialize()                 │
│  └─ getByDate() / getByDateRange() / ...        │
│                                                 │
│  parseDailyNote() / serializeDailyNote()        │
└─────────────────────────────────────────────────┘
```

## アプリ層が提供するもの

### 1. ファイル一覧の取得

Vault ディレクトリ内の `.md` ファイルをスキャンし、`FileInfo[]` を返す。

```typescript
type FileInfo = {
  path: string; // Vault ルートからの相対パス (例: "2026/01/2026-01-01.md")
  mtime: number; // ファイルの最終更新時刻 (Unix ms)
};
```

| プラットフォーム | API                                                         |
| ---------------- | ----------------------------------------------------------- |
| Desktop (Tauri)  | `@tauri-apps/plugin-fs` の `readDir` + `stat`               |
| Mobile (Expo)    | `expo-file-system` の `readDirectoryAsync` + `getInfoAsync` |

### 2. ファイル読み込み関数

`applySync` に渡すコールバック。パスを受け取り Markdown 文字列を返す。

```typescript
// Desktop
const readFile = (path: string) => tauriFs.readTextFile(`${vaultPath}/${path}`);

// Mobile
const readFile = (path: string) =>
  FileSystem.readAsStringAsync(`${vaultUri}/${path}`);
```

### 3. キャッシュファイルの読み書き

`.fluorite/cache/index.json` への永続化。

```typescript
// 保存
const cache = JSON.stringify(index.serialize());
await fs.writeTextFile(`${vaultPath}/.fluorite/cache/index.json`, cache);

// 読み込み
const json = await fs.readTextFile(`${vaultPath}/.fluorite/cache/index.json`);
const cache = JSON.parse(json) as VaultCache;
const index = VaultIndex.deserialize(cache);
```

### 4. ファイル監視

ファイルの変更を検知し、差分同期をトリガーする。

| プラットフォーム | API                                                   |
| ---------------- | ----------------------------------------------------- |
| Desktop (Tauri)  | `@tauri-apps/plugin-fs` の `watch` / `watchImmediate` |
| Mobile (Expo)    | ポーリングまたはアプリ復帰時に再スキャン              |

## ライフサイクル

### 起動時（コールドスタート）

```
1. .fluorite/cache/index.json が存在するか確認
   ├─ 存在する → VaultIndex.deserialize(cache) でメモリに復元
   └─ 存在しない → new VaultIndex() で空の Index を作成

2. Vault 内の .md ファイルを全スキャン → FileInfo[] を構築

3. index.applySync(files, readFile)
   → mtime 比較で差分のみ再パース
   → 削除されたファイルを Index から除去

4. UI にデータを提供開始
```

キャッシュがある場合、大半のファイルは mtime が一致するためスキップされ、高速に起動できる。

### ファイル変更時（ホットリロード）

```
1. ファイル監視が変更を検知
   → 変更対象の FileInfo[] を構築（単一ファイルまたは複数）

2. index.applySync(changedFiles, readFile)
   → 変更ファイルのみ再パース・更新

3. UI を更新

4. 必要に応じて index.serialize() でキャッシュ永続化
```

単一ファイルの変更なら `applySync` に 1 要素の配列を渡す。
ただし、削除検知のためにはフルスキャン結果を渡す必要がある点に注意。

### ファイル変更の検知パターン

| イベント           | applySync への入力                                           |
| ------------------ | ------------------------------------------------------------ |
| ファイル作成・更新 | 変更ファイルの `FileInfo` + 既存全ファイルの `FileInfo`      |
| ファイル削除       | 全ファイルの再スキャン結果（削除されたファイルが含まれない） |
| アプリ復帰         | 全ファイルの再スキャン結果                                   |

### キャッシュ永続化のタイミング

- `applySync` の結果で `updated.length > 0 || removed.length > 0` の場合に永続化
- デバウンス（例: 最後の変更から 5 秒後）で書き込み頻度を制御
- アプリ終了時にも永続化

## Desktop (Tauri) での実装イメージ

```typescript
import {
  readDir,
  readTextFile,
  stat,
  watch,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { VaultIndex, type FileInfo, type VaultCache } from "@fluorite/core";

const CACHE_PATH = ".fluorite/cache/index.json";

// --- 起動時 ---

async function initializeIndex(vaultPath: string): Promise<VaultIndex> {
  // 1. キャッシュ復元
  let index: VaultIndex;
  try {
    const json = await readTextFile(`${vaultPath}/${CACHE_PATH}`);
    index = VaultIndex.deserialize(JSON.parse(json) as VaultCache);
  } catch {
    index = new VaultIndex();
  }

  // 2. ファイルスキャン
  const files = await scanMarkdownFiles(vaultPath);

  // 3. 差分同期
  const { updated, removed } = await index.applySync(files, (path) =>
    readTextFile(`${vaultPath}/${path}`),
  );

  // 4. 変更があればキャッシュ永続化
  if (updated.length > 0 || removed.length > 0) {
    await persistCache(vaultPath, index);
  }

  return index;
}

// --- ファイルスキャン ---

async function scanMarkdownFiles(vaultPath: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  async function walk(dir: string, relative: string) {
    const entries = await readDir(`${vaultPath}/${dir}`);
    for (const entry of entries) {
      const fullRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory) {
        if (entry.name.startsWith(".")) continue; // .fluorite/ をスキップ
        await walk(`${dir}/${entry.name}`, fullRelative);
      } else if (entry.name.endsWith(".md")) {
        const info = await stat(`${vaultPath}/${fullRelative}`);
        files.push({ path: fullRelative, mtime: info.mtime ?? 0 });
      }
    }
  }

  await walk("", "");
  return files;
}

// --- ファイル監視 ---

async function watchVault(vaultPath: string, index: VaultIndex) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  await watch(
    vaultPath,
    async () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const files = await scanMarkdownFiles(vaultPath);
        const { updated, removed } = await index.applySync(files, (path) =>
          readTextFile(`${vaultPath}/${path}`),
        );
        if (updated.length > 0 || removed.length > 0) {
          await persistCache(vaultPath, index);
          // UI 更新をトリガー（Jotai atom の更新など）
        }
      }, 300);
    },
    { recursive: true },
  );
}

// --- キャッシュ永続化 ---

async function persistCache(vaultPath: string, index: VaultIndex) {
  const json = JSON.stringify(index.serialize());
  await writeTextFile(`${vaultPath}/${CACHE_PATH}`, json);
}
```

## Mobile (Expo) での実装イメージ

```typescript
import * as FileSystem from "expo-file-system";
import { VaultIndex, type FileInfo, type VaultCache } from "@fluorite/core";
import { AppState } from "react-native";

const CACHE_PATH = ".fluorite/cache/index.json";

// --- 起動時 ---

async function initializeIndex(vaultUri: string): Promise<VaultIndex> {
  let index: VaultIndex;
  try {
    const json = await FileSystem.readAsStringAsync(
      `${vaultUri}/${CACHE_PATH}`,
    );
    index = VaultIndex.deserialize(JSON.parse(json) as VaultCache);
  } catch {
    index = new VaultIndex();
  }

  const files = await scanMarkdownFiles(vaultUri);
  const { updated, removed } = await index.applySync(files, (path) =>
    FileSystem.readAsStringAsync(`${vaultUri}/${path}`),
  );

  if (updated.length > 0 || removed.length > 0) {
    await persistCache(vaultUri, index);
  }

  return index;
}

// --- アプリ復帰時に再同期 ---

function setupAppStateSync(vaultUri: string, index: VaultIndex) {
  AppState.addEventListener("change", async (state) => {
    if (state === "active") {
      const files = await scanMarkdownFiles(vaultUri);
      const { updated, removed } = await index.applySync(files, (path) =>
        FileSystem.readAsStringAsync(`${vaultUri}/${path}`),
      );
      if (updated.length > 0 || removed.length > 0) {
        await persistCache(vaultUri, index);
      }
    }
  });
}
```

## Jotai との統合

VaultIndex を Jotai atom で管理し、UI からリアクティブに参照する。

```typescript
import { atom } from "jotai";
import type { VaultIndex } from "@fluorite/core";

// VaultIndex を保持する atom（初期化は非同期）
const vaultIndexAtom = atom<VaultIndex | null>(null);

// 日付範囲のノートを取得する派生 atom
const weekNotesAtom = atom((get) => {
  const index = get(vaultIndexAtom);
  if (!index) return [];
  return index.getByDateRange(startOfWeek, endOfWeek);
});

// 未完了タスクを取得する派生 atom
const incompleteTasksAtom = atom((get) => {
  const index = get(vaultIndexAtom);
  if (!index) return [];
  return index.getIncompleteTasks();
});
```

## 今後の拡張ポイント

| テーマ        | 内容                                                                |
| ------------- | ------------------------------------------------------------------- |
| 書き込み      | `serializeDailyNote` → ファイル書き込み → `applySync` で Index 反映 |
| Conflict 検知 | 外部編集と同時書き込みの mtime 競合を検知する仕組み                 |
| 部分監視      | 変更イベントに含まれるパスのみ `applySync` に渡す最適化             |
| 全文検索      | Index にタイトル・body のテキストインデックスを追加                 |
| Migration     | `VaultCache.version` によるキャッシュフォーマットのマイグレーション |
