import { CategoryRegistry } from "@fluorite/core";

const registry = new CategoryRegistry();
registry.set("work", "#4A90D9");
registry.set("personal", "#50C878");
registry.set("holiday", "#FF6B6B");

export const MOCK_CATEGORY_REGISTRY = registry;
