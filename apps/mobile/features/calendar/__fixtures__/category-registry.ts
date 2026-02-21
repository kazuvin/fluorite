import { CategoryRegistry } from "@fluorite/core";
import { categoryPalette } from "@fluorite/design-tokens";

const registry = new CategoryRegistry();
registry.set("work", categoryPalette.slate);
registry.set("personal", categoryPalette.sage);
registry.set("holiday", categoryPalette.rose);

export const MOCK_CATEGORY_REGISTRY = registry;
