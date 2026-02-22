import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { MOCK_EVENT_NOTES } from "../../calendar/__fixtures__/event-notes";
import { seedVault } from "../seed-vault";
import { initializeVaultAtom, syncVaultAtom, vaultReadyValueAtom } from "../stores/vault-atoms";
import { getVaultDir, scanMarkdownFiles } from "../vault-io";

export function useVaultInit(): boolean {
	const isReady = useAtomValue(vaultReadyValueAtom);
	const initialize = useSetAtom(initializeVaultAtom);
	const sync = useSetAtom(syncVaultAtom);

	useEffect(() => {
		let cancelled = false;

		async function init() {
			await initialize();

			if (cancelled) return;

			const vaultDir = getVaultDir();
			const files = await scanMarkdownFiles(vaultDir);

			if (files.length === 0) {
				await seedVault(vaultDir, MOCK_EVENT_NOTES);
				await sync();
			}
		}

		init();

		return () => {
			cancelled = true;
		};
	}, [initialize, sync]);

	return isReady;
}
