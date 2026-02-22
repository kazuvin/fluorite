import type { FileInfo, VaultCache } from "@fluorite/core";
import * as FileSystem from "expo-file-system";

const EVENTS_DIR = "events/";
const CACHE_DIR = ".fluorite/cache/";
const CACHE_FILE = `${CACHE_DIR}index.json`;

export function getVaultDir(): string {
	return `${FileSystem.documentDirectory}vault/`;
}

export async function ensureVaultStructure(vaultDir: string): Promise<void> {
	await Promise.all([
		FileSystem.makeDirectoryAsync(`${vaultDir}${EVENTS_DIR}`, {
			intermediates: true,
		}),
		FileSystem.makeDirectoryAsync(`${vaultDir}${CACHE_DIR}`, {
			intermediates: true,
		}),
	]);
}

export async function scanMarkdownFiles(vaultDir: string): Promise<FileInfo[]> {
	const eventsDir = `${vaultDir}${EVENTS_DIR}`;
	const entries = await FileSystem.readDirectoryAsync(eventsDir);
	const mdFiles = entries.filter((name) => name.endsWith(".md"));

	const results: FileInfo[] = [];
	for (const name of mdFiles) {
		const info = await FileSystem.getInfoAsync(`${eventsDir}${name}`);
		if (info.exists && !info.isDirectory) {
			results.push({
				path: `${EVENTS_DIR}${name}`,
				mtime: info.modificationTime ?? 0,
			});
		}
	}
	return results;
}

export async function readVaultFile(vaultDir: string, path: string): Promise<string> {
	return FileSystem.readAsStringAsync(`${vaultDir}${path}`);
}

export async function writeVaultFile(
	vaultDir: string,
	path: string,
	content: string,
): Promise<void> {
	await FileSystem.writeAsStringAsync(`${vaultDir}${path}`, content);
}

export async function loadCache(vaultDir: string): Promise<VaultCache | null> {
	const cachePath = `${vaultDir}${CACHE_FILE}`;
	const info = await FileSystem.getInfoAsync(cachePath);
	if (!info.exists) {
		return null;
	}
	const raw = await FileSystem.readAsStringAsync(cachePath);
	return JSON.parse(raw) as VaultCache;
}

export async function saveCache(vaultDir: string, cache: VaultCache): Promise<void> {
	await FileSystem.writeAsStringAsync(`${vaultDir}${CACHE_FILE}`, JSON.stringify(cache));
}
