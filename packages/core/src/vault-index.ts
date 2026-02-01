import * as v from "valibot";
import { parseDailyNote } from "./parser";
import { DailyNoteSchema } from "./schemas";
import type { DailyNote } from "./schemas";

// --- 型定義・スキーマ ---

export const CacheEntrySchema = v.object({
	path: v.string(),
	mtime: v.number(),
	note: DailyNoteSchema,
});

export type CacheEntry = v.InferOutput<typeof CacheEntrySchema>;

export const VaultCacheSchema = v.object({
	version: v.pipe(v.number(), v.integer(), v.minValue(1)),
	entries: v.array(CacheEntrySchema),
});

export type VaultCache = v.InferOutput<typeof VaultCacheSchema>;

// --- ファイルシステム情報（アプリ層から注入） ---

export type FileInfo = {
	path: string;
	mtime: number;
};

// --- VaultIndex クラス ---

export class VaultIndex {
	private entries: Map<string, CacheEntry> = new Map();

	get size(): number {
		return this.entries.size;
	}

	set(path: string, mtime: number, note: DailyNote): void {
		this.entries.set(path, { path, mtime, note });
	}

	get(path: string): CacheEntry | undefined {
		return this.entries.get(path);
	}

	delete(path: string): boolean {
		return this.entries.delete(path);
	}

	has(path: string): boolean {
		return this.entries.has(path);
	}

	allEntries(): CacheEntry[] {
		return [...this.entries.values()];
	}

	// --- クエリ API ---

	getByDate(date: string): DailyNote | undefined {
		for (const entry of this.entries.values()) {
			if (entry.note.date === date) return entry.note;
		}
		return undefined;
	}

	getByDateRange(start: string, end: string): DailyNote[] {
		const results: DailyNote[] = [];
		for (const entry of this.entries.values()) {
			if (entry.note.date >= start && entry.note.date <= end) {
				results.push(entry.note);
			}
		}
		return results.sort((a, b) => a.date.localeCompare(b.date));
	}

	getByTag(tag: string): DailyNote[] {
		const results: DailyNote[] = [];
		for (const entry of this.entries.values()) {
			const hasTag = entry.note.entries.some((e) => e.tags?.includes(tag));
			if (hasTag) results.push(entry.note);
		}
		return results.sort((a, b) => a.date.localeCompare(b.date));
	}

	getIncompleteTasks(): Array<{
		date: string;
		entry: DailyNote["entries"][number];
	}> {
		const results: Array<{
			date: string;
			entry: DailyNote["entries"][number];
		}> = [];
		for (const cacheEntry of this.entries.values()) {
			for (const entry of cacheEntry.note.entries) {
				if (entry.isTask && !entry.done) {
					results.push({ date: cacheEntry.note.date, entry });
				}
			}
		}
		return results.sort((a, b) => a.date.localeCompare(b.date));
	}

	// --- キャッシュ差分判定 ---

	computeStalePaths(files: FileInfo[]): {
		toUpdate: FileInfo[];
		toRemove: string[];
	} {
		const currentPaths = new Set(files.map((f) => f.path));
		const toUpdate: FileInfo[] = [];
		const toRemove: string[] = [];

		for (const file of files) {
			const cached = this.entries.get(file.path);
			if (!cached || cached.mtime < file.mtime) {
				toUpdate.push(file);
			}
		}

		for (const path of this.entries.keys()) {
			if (!currentPaths.has(path)) {
				toRemove.push(path);
			}
		}

		return { toUpdate, toRemove };
	}

	// --- 同期 API ---

	async applySync(
		files: FileInfo[],
		readFile: (path: string) => Promise<string>,
	): Promise<{ updated: string[]; removed: string[] }> {
		const { toUpdate, toRemove } = this.computeStalePaths(files);

		const updated: string[] = [];
		for (const file of toUpdate) {
			const markdown = await readFile(file.path);
			const note = parseDailyNote(markdown);
			if (note) {
				this.set(file.path, file.mtime, note);
				updated.push(file.path);
			}
		}

		for (const path of toRemove) {
			this.delete(path);
		}

		return { updated, removed: toRemove };
	}

	// --- キャッシュ シリアライズ/デシリアライズ ---

	serialize(): VaultCache {
		return {
			version: 1,
			entries: this.allEntries(),
		};
	}

	static deserialize(cache: VaultCache): VaultIndex {
		const index = new VaultIndex();
		for (const entry of cache.entries) {
			index.set(entry.path, entry.mtime, entry.note);
		}
		return index;
	}
}
