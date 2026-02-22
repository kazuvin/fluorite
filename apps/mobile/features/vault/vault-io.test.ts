import type { FileInfo, VaultCache } from "@fluorite/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-file-system", () => ({
	documentDirectory: "file:///data/documents/",
	makeDirectoryAsync: vi.fn(),
	readDirectoryAsync: vi.fn(),
	getInfoAsync: vi.fn(),
	readAsStringAsync: vi.fn(),
	writeAsStringAsync: vi.fn(),
}));

import * as FileSystem from "expo-file-system";
import {
	ensureVaultStructure,
	getVaultDir,
	loadCache,
	readVaultFile,
	saveCache,
	scanMarkdownFiles,
	writeVaultFile,
} from "./vault-io";

const mocked = vi.mocked(FileSystem);

beforeEach(() => {
	vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getVaultDir
// ---------------------------------------------------------------------------
describe("getVaultDir", () => {
	it("documentDirectory + vault/ を返す", () => {
		const result = getVaultDir();
		expect(result).toBe("file:///data/documents/vault/");
	});
});

// ---------------------------------------------------------------------------
// ensureVaultStructure
// ---------------------------------------------------------------------------
describe("ensureVaultStructure", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("events/ と .fluorite/cache/ ディレクトリを作成する", async () => {
		await ensureVaultStructure(vaultDir);

		expect(mocked.makeDirectoryAsync).toHaveBeenCalledWith("file:///data/documents/vault/events/", {
			intermediates: true,
		});
		expect(mocked.makeDirectoryAsync).toHaveBeenCalledWith(
			"file:///data/documents/vault/.fluorite/cache/",
			{ intermediates: true },
		);
		expect(mocked.makeDirectoryAsync).toHaveBeenCalledTimes(2);
	});
});

// ---------------------------------------------------------------------------
// scanMarkdownFiles
// ---------------------------------------------------------------------------
describe("scanMarkdownFiles", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("events/ 内の .md ファイルを FileInfo[] として返す", async () => {
		mocked.readDirectoryAsync.mockResolvedValue([
			"2026-01-01-new-year.md",
			"2026-02-14-valentine.md",
			"notes.txt",
		]);
		mocked.getInfoAsync
			.mockResolvedValueOnce({
				exists: true,
				isDirectory: false,
				modificationTime: 1000,
				size: 100,
				uri: "file:///data/documents/vault/events/2026-01-01-new-year.md",
			})
			.mockResolvedValueOnce({
				exists: true,
				isDirectory: false,
				modificationTime: 2000,
				size: 200,
				uri: "file:///data/documents/vault/events/2026-02-14-valentine.md",
			});

		const result = await scanMarkdownFiles(vaultDir);

		expect(result).toEqual<FileInfo[]>([
			{ path: "events/2026-01-01-new-year.md", mtime: 1000 },
			{ path: "events/2026-02-14-valentine.md", mtime: 2000 },
		]);
		expect(mocked.readDirectoryAsync).toHaveBeenCalledWith("file:///data/documents/vault/events/");
	});

	it("events/ にファイルがない場合は空配列を返す", async () => {
		mocked.readDirectoryAsync.mockResolvedValue([]);

		const result = await scanMarkdownFiles(vaultDir);

		expect(result).toEqual([]);
	});

	it(".md 以外のファイルはスキップする", async () => {
		mocked.readDirectoryAsync.mockResolvedValue(["readme.txt", "image.png"]);

		const result = await scanMarkdownFiles(vaultDir);

		expect(result).toEqual([]);
		expect(mocked.getInfoAsync).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
// readVaultFile
// ---------------------------------------------------------------------------
describe("readVaultFile", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("指定パスのファイル内容を返す", async () => {
		mocked.readAsStringAsync.mockResolvedValue("# Hello");

		const result = await readVaultFile(vaultDir, "events/test.md");

		expect(result).toBe("# Hello");
		expect(mocked.readAsStringAsync).toHaveBeenCalledWith(
			"file:///data/documents/vault/events/test.md",
		);
	});
});

// ---------------------------------------------------------------------------
// writeVaultFile
// ---------------------------------------------------------------------------
describe("writeVaultFile", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("指定パスにテキストを書き込む", async () => {
		await writeVaultFile(vaultDir, "events/test.md", "# Hello");

		expect(mocked.writeAsStringAsync).toHaveBeenCalledWith(
			"file:///data/documents/vault/events/test.md",
			"# Hello",
		);
	});
});

// ---------------------------------------------------------------------------
// loadCache
// ---------------------------------------------------------------------------
describe("loadCache", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("キャッシュファイルが存在する場合は VaultCache を返す", async () => {
		const cache: VaultCache = {
			version: 1,
			entries: [
				{
					path: "events/test.md",
					mtime: 1000,
					note: {
						title: "Test",
						start: "2026-01-01",
						end: "2026-01-01",
						body: "body",
					},
				},
			],
		};
		mocked.getInfoAsync.mockResolvedValue({
			exists: true,
			isDirectory: false,
			modificationTime: 1000,
			size: 100,
			uri: "file:///data/documents/vault/.fluorite/cache/index.json",
		});
		mocked.readAsStringAsync.mockResolvedValue(JSON.stringify(cache));

		const result = await loadCache(vaultDir);

		expect(result).toEqual(cache);
		expect(mocked.readAsStringAsync).toHaveBeenCalledWith(
			"file:///data/documents/vault/.fluorite/cache/index.json",
		);
	});

	it("キャッシュファイルが存在しない場合は null を返す", async () => {
		mocked.getInfoAsync.mockResolvedValue({
			exists: false,
			isDirectory: false,
			uri: "file:///data/documents/vault/.fluorite/cache/index.json",
		});

		const result = await loadCache(vaultDir);

		expect(result).toBeNull();
		expect(mocked.readAsStringAsync).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
// saveCache
// ---------------------------------------------------------------------------
describe("saveCache", () => {
	const vaultDir = "file:///data/documents/vault/";

	it("VaultCache を JSON として書き込む", async () => {
		const cache: VaultCache = {
			version: 1,
			entries: [],
		};

		await saveCache(vaultDir, cache);

		expect(mocked.writeAsStringAsync).toHaveBeenCalledWith(
			"file:///data/documents/vault/.fluorite/cache/index.json",
			JSON.stringify(cache),
		);
	});
});
