import { serializeEventNote } from "@fluorite/core";
import type { EventNote } from "@fluorite/core";
import { slugify } from "./stores/vault-atoms";
import { writeVaultFile } from "./vault-io";

export async function seedVault(vaultDir: string, notes: EventNote[]): Promise<void> {
	for (const note of notes) {
		const content = serializeEventNote(note);
		const fileName = `${note.start}-${slugify(note.title)}.md`;
		const path = `events/${fileName}`;
		await writeVaultFile(vaultDir, path, content);
	}
}
