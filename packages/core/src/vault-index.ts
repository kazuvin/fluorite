import * as v from "valibot";
import { parseEventNote } from "./event-note-parser";
import { EventNoteSchema } from "./event-note-schemas";
import type { EventNote } from "./event-note-schemas";

// --- 型定義・スキーマ ---

export const CacheEntrySchema = v.object({
	path: v.string(),
	mtime: v.number(),
	note: EventNoteSchema,
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

	set(path: string, mtime: number, note: EventNote): void {
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

	getByDate(date: string): EventNote[] {
		const results: EventNote[] = [];
		for (const entry of this.entries.values()) {
			if (entry.note.start <= date && entry.note.end >= date) {
				results.push(entry.note);
			}
		}
		return results.sort((a, b) => a.start.localeCompare(b.start));
	}

	getByDateRange(start: string, end: string): EventNote[] {
		const results: EventNote[] = [];
		for (const entry of this.entries.values()) {
			if (entry.note.start <= end && entry.note.end >= start) {
				results.push(entry.note);
			}
		}
		return results.sort((a, b) => a.start.localeCompare(b.start));
	}

	getByTag(tag: string): EventNote[] {
		const results: EventNote[] = [];
		for (const entry of this.entries.values()) {
			if (entry.note.tags?.includes(tag)) {
				results.push(entry.note);
			}
		}
		return results.sort((a, b) => a.start.localeCompare(b.start));
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
			const note = parseEventNote(markdown);
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
