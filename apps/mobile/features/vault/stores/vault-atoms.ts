import { CategoryRegistry, VaultIndex, serializeEventNote } from "@fluorite/core";
import type { EventNote, FileInfo } from "@fluorite/core";
import { categoryPalette } from "@fluorite/design-tokens";
import { atom } from "jotai";
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

// --- slugify ---

const UNSAFE_CHARS = /[/\\:*?"<>|]/g;

export function slugify(text: string): string {
	return text.replace(UNSAFE_CHARS, "").replace(/\s+/g, "-");
}

// --- Private helpers ---

function createDefaultCategoryRegistry(): CategoryRegistry {
	const registry = new CategoryRegistry();
	registry.set("work", categoryPalette.slate);
	registry.set("personal", categoryPalette.sage);
	registry.set("holiday", categoryPalette.rose);
	return registry;
}

async function syncAndPersist(
	vaultDir: string,
	index: VaultIndex,
	files: FileInfo[],
): Promise<void> {
	const { updated, removed } = await index.applySync(files, (path) =>
		readVaultFile(vaultDir, path),
	);

	if (updated.length > 0 || removed.length > 0) {
		await saveCache(vaultDir, index.serialize());
	}
}

// --- Private primitive atoms ---

const vaultIndexAtom = atom<VaultIndex>(new VaultIndex());
const vaultReadyAtom = atom<boolean>(false);
const vaultCategoryRegistryAtom = atom<CategoryRegistry>(new CategoryRegistry());

// --- Public read-only atoms ---

export const vaultNotesValueAtom = atom<EventNote[]>((get) =>
	get(vaultIndexAtom)
		.allEntries()
		.map((e) => e.note),
);

export const vaultReadyValueAtom = atom<boolean>((get) => get(vaultReadyAtom));

export const vaultCategoryRegistryValueAtom = atom((get) => get(vaultCategoryRegistryAtom));

// --- Public action atoms ---

export const initializeVaultAtom = atom(null, async (get, set) => {
	const vaultDir = getVaultDir();
	await ensureVaultStructure(vaultDir);

	const cache = await loadCache(vaultDir);
	const index = cache ? VaultIndex.deserialize(cache) : new VaultIndex();

	const files = await scanMarkdownFiles(vaultDir);
	await syncAndPersist(vaultDir, index, files);

	set(vaultIndexAtom, index);

	// カテゴリの読み込み
	let categoryRegistry = await loadCategories(vaultDir);
	if (!categoryRegistry) {
		categoryRegistry = createDefaultCategoryRegistry();
		await saveCategories(vaultDir, categoryRegistry);
	}
	set(vaultCategoryRegistryAtom, categoryRegistry);

	set(vaultReadyAtom, true);
});

export const syncVaultAtom = atom(null, async (get, set) => {
	const vaultDir = getVaultDir();
	const files = await scanMarkdownFiles(vaultDir);
	const currentIndex = get(vaultIndexAtom);

	await syncAndPersist(vaultDir, currentIndex, files);

	// Jotai が変更検知するために新しい VaultIndex を作る
	const newIndex = VaultIndex.deserialize(currentIndex.serialize());
	set(vaultIndexAtom, newIndex);
});

export const addNoteToVaultAtom = atom(null, async (get, set, note: EventNote) => {
	const vaultDir = getVaultDir();
	const content = serializeEventNote(note);
	const fileName = `${note.start}-${slugify(note.title)}.md`;
	const path = `events/${fileName}`;

	await writeVaultFile(vaultDir, path, content);
	await set(syncVaultAtom);
});
