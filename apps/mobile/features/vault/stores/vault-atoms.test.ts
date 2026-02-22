import type { EventNote, FileInfo, VaultCache } from "@fluorite/core";
import { CategoryRegistry, serializeEventNote } from "@fluorite/core";
import { categoryPalette } from "@fluorite/design-tokens";
import { createStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vault-io をモック
vi.mock("../vault-io", () => ({
	getVaultDir: vi.fn(),
	ensureVaultStructure: vi.fn(),
	scanMarkdownFiles: vi.fn(),
	readVaultFile: vi.fn(),
	writeVaultFile: vi.fn(),
	loadCache: vi.fn(),
	saveCache: vi.fn(),
}));

// category-io をモック
vi.mock("../category-io", () => ({
	loadCategories: vi.fn(),
	saveCategories: vi.fn(),
}));

import { loadCategories, saveCategories } from "../category-io";
import {
	ensureVaultStructure,
	getVaultDir,
	loadCache,
	readVaultFile,
	saveCache,
	scanMarkdownFiles,
	writeVaultFile,
} from "../vault-io";

import {
	addNoteToVaultAtom,
	initializeVaultAtom,
	slugify,
	syncVaultAtom,
	vaultCategoryRegistryValueAtom,
	vaultNotesValueAtom,
	vaultReadyValueAtom,
} from "./vault-atoms";

const mockedGetVaultDir = vi.mocked(getVaultDir);
const mockedEnsureVaultStructure = vi.mocked(ensureVaultStructure);
const mockedScanMarkdownFiles = vi.mocked(scanMarkdownFiles);
const mockedReadVaultFile = vi.mocked(readVaultFile);
const mockedWriteVaultFile = vi.mocked(writeVaultFile);
const mockedLoadCache = vi.mocked(loadCache);
const mockedSaveCache = vi.mocked(saveCache);
const mockedLoadCategories = vi.mocked(loadCategories);
const mockedSaveCategories = vi.mocked(saveCategories);

// --- ヘルパー ---

const VAULT_DIR = "file:///data/documents/vault/";

function makeNote(overrides: Partial<EventNote> = {}): EventNote {
	return {
		title: "Test Event",
		start: "2026-01-15",
		end: "2026-01-15",
		body: "Test body",
		...overrides,
	};
}

function makeMarkdown(note: EventNote): string {
	return serializeEventNote(note);
}

function setupDefaultMocks(): void {
	mockedGetVaultDir.mockReturnValue(VAULT_DIR);
	mockedEnsureVaultStructure.mockResolvedValue(undefined);
	mockedScanMarkdownFiles.mockResolvedValue([]);
	mockedLoadCache.mockResolvedValue(null);
	mockedSaveCache.mockResolvedValue(undefined);
	mockedWriteVaultFile.mockResolvedValue(undefined);
	mockedLoadCategories.mockResolvedValue(null);
	mockedSaveCategories.mockResolvedValue(undefined);
}

beforeEach(() => {
	vi.clearAllMocks();
	setupDefaultMocks();
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe("slugify", () => {
	it("スペースをハイフンに変換する", () => {
		expect(slugify("hello world")).toBe("hello-world");
	});

	it("日本語はそのまま保持する", () => {
		expect(slugify("東京旅行")).toBe("東京旅行");
	});

	it("ファイルシステムで使えない文字を除去する", () => {
		expect(slugify('a/b\\c:d*e?f"g<h>i|j')).toBe("abcdefghij");
	});

	it("連続スペースをひとつのハイフンにする", () => {
		expect(slugify("foo   bar")).toBe("foo-bar");
	});
});

// ---------------------------------------------------------------------------
// 初期状態
// ---------------------------------------------------------------------------
describe("初期状態", () => {
	it("vaultReadyValueAtom が false を返す", () => {
		const store = createStore();
		expect(store.get(vaultReadyValueAtom)).toBe(false);
	});

	it("vaultNotesValueAtom が空配列を返す", () => {
		const store = createStore();
		expect(store.get(vaultNotesValueAtom)).toEqual([]);
	});

	it("vaultCategoryRegistryValueAtom が空の CategoryRegistry を返す", () => {
		const store = createStore();
		const registry = store.get(vaultCategoryRegistryValueAtom);
		expect(registry).toBeInstanceOf(CategoryRegistry);
		expect(registry.all()).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// initializeVaultAtom
// ---------------------------------------------------------------------------
describe("initializeVaultAtom", () => {
	it("キャッシュなし・ファイルなし: ensureVaultStructure が呼ばれ、vaultReady が true になる", async () => {
		const store = createStore();

		await store.set(initializeVaultAtom);

		expect(mockedEnsureVaultStructure).toHaveBeenCalledWith(VAULT_DIR);
		expect(store.get(vaultReadyValueAtom)).toBe(true);
	});

	it("キャッシュあり: VaultIndex.deserialize でキャッシュが復元される", async () => {
		const note = makeNote({ title: "Cached Event" });
		const cache: VaultCache = {
			version: 1,
			entries: [
				{
					path: "events/2026-01-15-cached-event.md",
					mtime: 1000,
					note,
				},
			],
		};
		mockedLoadCache.mockResolvedValue(cache);
		mockedScanMarkdownFiles.mockResolvedValue([
			{ path: "events/2026-01-15-cached-event.md", mtime: 1000 },
		]);

		const store = createStore();
		await store.set(initializeVaultAtom);

		const notes = store.get(vaultNotesValueAtom);
		expect(notes).toHaveLength(1);
		expect(notes[0].title).toBe("Cached Event");
	});

	it("ファイルあり: applySync で EventNote が読み込まれ、vaultNotesValueAtom から取得できる", async () => {
		const note = makeNote({ title: "File Event" });
		const files: FileInfo[] = [{ path: "events/2026-01-15-file-event.md", mtime: 1000 }];
		mockedScanMarkdownFiles.mockResolvedValue(files);
		mockedReadVaultFile.mockResolvedValue(makeMarkdown(note));

		const store = createStore();
		await store.set(initializeVaultAtom);

		const notes = store.get(vaultNotesValueAtom);
		expect(notes).toHaveLength(1);
		expect(notes[0].title).toBe("File Event");
	});

	it("変更あり時にキャッシュ保存: saveCache が呼ばれる", async () => {
		const note = makeNote({ title: "New File" });
		const files: FileInfo[] = [{ path: "events/2026-01-15-new-file.md", mtime: 1000 }];
		mockedScanMarkdownFiles.mockResolvedValue(files);
		mockedReadVaultFile.mockResolvedValue(makeMarkdown(note));

		const store = createStore();
		await store.set(initializeVaultAtom);

		expect(mockedSaveCache).toHaveBeenCalledWith(
			VAULT_DIR,
			expect.objectContaining({ version: 1 }),
		);
	});

	it("変更なし時にキャッシュ保存しない: saveCache が呼ばれない", async () => {
		// キャッシュなし・ファイルなし → 変更なし
		const store = createStore();
		await store.set(initializeVaultAtom);

		expect(mockedSaveCache).not.toHaveBeenCalled();
	});

	it("カテゴリファイルあり: レジストリが読み込まれる", async () => {
		const registry = new CategoryRegistry();
		registry.set("work", "#AABBCC");
		registry.set("personal", "#112233");
		mockedLoadCategories.mockResolvedValue(registry);

		const store = createStore();
		await store.set(initializeVaultAtom);

		const result = store.get(vaultCategoryRegistryValueAtom);
		expect(result.all()).toEqual([
			{ name: "work", color: "#AABBCC" },
			{ name: "personal", color: "#112233" },
		]);
		expect(mockedSaveCategories).not.toHaveBeenCalled();
	});

	it("カテゴリファイルなし: デフォルトカテゴリが作成・保存される", async () => {
		mockedLoadCategories.mockResolvedValue(null);

		const store = createStore();
		await store.set(initializeVaultAtom);

		const result = store.get(vaultCategoryRegistryValueAtom);
		const categories = result.all();
		expect(categories).toHaveLength(3);
		expect(categories).toEqual([
			{ name: "work", color: categoryPalette.slate },
			{ name: "personal", color: categoryPalette.sage },
			{ name: "holiday", color: categoryPalette.rose },
		]);

		expect(mockedSaveCategories).toHaveBeenCalledWith(VAULT_DIR, expect.any(CategoryRegistry));
	});
});

// ---------------------------------------------------------------------------
// syncVaultAtom
// ---------------------------------------------------------------------------
describe("syncVaultAtom", () => {
	it("再スキャン→更新→vaultNotesValueAtom が更新される", async () => {
		const store = createStore();

		// まず初期化
		await store.set(initializeVaultAtom);
		expect(store.get(vaultNotesValueAtom)).toEqual([]);

		// sync 時に新しいファイルが見つかる
		const note = makeNote({ title: "Synced Event" });
		const files: FileInfo[] = [{ path: "events/2026-01-15-synced-event.md", mtime: 2000 }];
		mockedScanMarkdownFiles.mockResolvedValue(files);
		mockedReadVaultFile.mockResolvedValue(makeMarkdown(note));

		await store.set(syncVaultAtom);

		const notes = store.get(vaultNotesValueAtom);
		expect(notes).toHaveLength(1);
		expect(notes[0].title).toBe("Synced Event");
	});
});

// ---------------------------------------------------------------------------
// addNoteToVaultAtom
// ---------------------------------------------------------------------------
describe("addNoteToVaultAtom", () => {
	it("EventNote を渡すとファイルが書き込まれ、VaultIndex に反映される", async () => {
		const store = createStore();

		// まず初期化
		await store.set(initializeVaultAtom);

		// addNote 時に sync でファイルが見つかるようモック設定
		const note = makeNote({ title: "Added Event", start: "2026-03-01", end: "2026-03-01" });
		const expectedContent = makeMarkdown(note);

		// writeVaultFile 後の sync で scanMarkdownFiles がファイルを返す
		mockedScanMarkdownFiles.mockResolvedValue([
			{ path: "events/2026-03-01-Added-Event.md", mtime: 3000 },
		]);
		mockedReadVaultFile.mockResolvedValue(expectedContent);

		await store.set(addNoteToVaultAtom, note);

		// writeVaultFile が呼ばれたことを確認
		expect(mockedWriteVaultFile).toHaveBeenCalledWith(
			VAULT_DIR,
			expect.stringContaining("events/2026-03-01-Added-Event.md"),
			expectedContent,
		);

		// VaultIndex に反映されたことを確認
		const notes = store.get(vaultNotesValueAtom);
		expect(notes).toHaveLength(1);
		expect(notes[0].title).toBe("Added Event");
	});
});
