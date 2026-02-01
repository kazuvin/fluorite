# @fluorite/core 仕様書

## 概要

Fluorite は Obsidian ライクなローカル Markdown ファイルベースのカレンダーアプリケーション。
`@fluorite/core` はプラットフォーム非依存の純粋ロジック層であり、ファイル I/O を含まない。

## Vault 構成

### ディレクトリ構造

```
my-calendar/
  .fluorite/
    config.json
    cache/
      index.json
  2026/
    01/
      2026-01-01.md
      2026-01-02.md
    02/
      2026-02-01.md
```

- `.fluorite/` ディレクトリの存在が Vault のルートを示す
- Daily Note は `YYYY/MM/YYYY-MM-DD.md` の形式で配置
- 1 ファイル = 1 日

### .fluorite/config.json

```json
{
  "version": 1,
  "timezone": "Asia/Tokyo",
  "locale": "ja"
}
```

## Markdown フォーマット

### Daily Note の構造

```markdown
---
timezone: America/New_York
---

# 2026-01-01

- [all-day] 元日 #holiday
- [10:00] 初詣 #personal
  - location: 明治神宮
- [10:00 - 12:00] 会議A #work
  - memo: 先方との機能要件のすり合わせ
  - location: 会議室B
  - url: https://meet.google.com/xxx
- [ ] お年玉を用意する #personal
- [ ] [14:00 - 15:00] レビュー会 #work
- [x] [09:00] 朝会 #work
- [ ] [all-day] 大掃除 #personal
```

### エントリの記法

すべてのリストアイテムを **Entry** として統一的に扱う。

| パターン      | 記法                                | 例                           |
| ------------- | ----------------------------------- | ---------------------------- |
| メモ          | `- タイトル`                        | `- 買い物メモ`               |
| 終日イベント  | `- [all-day] タイトル`              | `- [all-day] 元日`           |
| 開始時刻のみ  | `- [HH:MM] タイトル`                | `- [10:00] 初詣`             |
| 時間範囲      | `- [HH:MM - HH:MM] タイトル`        | `- [10:00 - 12:00] 会議`     |
| タスク        | `- [ ] タイトル` / `- [x] タイトル` | `- [ ] 買い物`               |
| タスク + 時刻 | `- [ ] [HH:MM - HH:MM] タイトル`    | `- [ ] [10:00 - 12:00] 会議` |
| タスク + 終日 | `- [ ] [all-day] タイトル`          | `- [ ] [all-day] 大掃除`     |

### エントリの分類

ブラケット `[...]` の有無とタスク記法の組み合わせでエントリを分類する:

| ブラケット  | タスク記法  | 分類         |
| ----------- | ----------- | ------------ |
| なし        | なし        | メモ         |
| なし        | `[ ]`/`[x]` | タスク       |
| `[all-day]` | なし        | 終日イベント |
| `[HH:MM]`   | なし        | 時刻イベント |
| `[all-day]` | `[ ]`/`[x]` | 終日タスク   |
| `[HH:MM]`   | `[ ]`/`[x]` | 時刻タスク   |

### タグ

- インラインタグ: タイトル末尾に `#tagname` で記述
- 認識ルール: **スペース + `#` + 英字または日本語で始まる文字列**
- `#123` のように数字始まりはタグとして認識しない（タイトルの一部）
- Obsidian のタグ認識ルールと一致

### メタデータ

- エントリの子リストとして `- key: value` 形式で記述
- `key: value` パターンに一致すればメタデータ、それ以外は自由記述の body として扱う

### Frontmatter

- YAML frontmatter をサポート（`---` で囲まれた領域）
- パーサーは文字列として保持し、解釈は上位層に委ねる
- `timezone` フィールドはファイル単位のタイムゾーンオーバーライドに使用

## タイムゾーン

3 層のオーバーライド構造:

```
.fluorite/config.json の timezone  (プロジェクトデフォルト)
  ↓ 上書き
frontmatter の timezone             (日単位)
  ↓ 上書き
エントリのメタデータ tz             (イベント単位)
```

v1 ではプロジェクトデフォルトのみ実装。オーバーライドの構造は型として用意する。

## 型定義

```typescript
type Entry = {
  title: string;
  allDay?: boolean; // [all-day] 記法
  time?: { start: string; end?: string }; // HH:MM 形式
  isTask?: boolean;
  done?: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
  body?: string[]; // メタデータ以外の子要素
};

type DailyNote = {
  date: string; // YYYY-MM-DD
  frontmatter?: string; // raw YAML 文字列
  entries: Entry[];
};

type VaultConfig = {
  version: number;
  timezone: string;
  locale: string;
};
```

## アーキテクチャ

### core パッケージの責務

| 含める                             | 含めない                 |
| ---------------------------------- | ------------------------ |
| Parser（Markdown → DailyNote）     | ファイル I/O             |
| Serializer（DailyNote → Markdown） | ファイル監視             |
| 型定義                             | プラットフォーム固有処理 |
| Index のインメモリ操作             | UI                       |

### キャッシュ・インデックス設計

```
起動時:
  1. .fluorite/cache/index.json を読み込み
  2. 各ファイルの mtime を比較し、キャッシュより新しいファイルのみ再パース
  3. Index をメモリに保持

ファイル変更時:
  1. 変更された .md のみ再パース
  2. Index を部分更新
  3. 定期的に cache を永続化
```

Index の構築・永続化は core が提供し、ファイル I/O とファイル監視はアプリ層が注入する。

## Obsidian 互換性

- `#tag` → Obsidian タグとしてネイティブ動作
- `- [ ]` / `- [x]` → Obsidian チェックボックスとして動作
- YAML frontmatter → Obsidian Properties として認識
- `[HH:MM - HH:MM]`, `[all-day]` → プレーンテキストとして表示（リンクにならない）
- Daily Notes プラグインのフォーマット設定 `YYYY/MM/YYYY-MM-DD` で一致

## 実装順序

1. 型定義 — Entry, DailyNote, VaultConfig
2. Parser — Markdown → DailyNote（TDD）
3. Serializer — DailyNote → Markdown（ラウンドトリップ保証、TDD）
4. Index — クエリ操作（TDD）
