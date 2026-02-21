import { parseNumeric, spacing } from "@fluorite/design-tokens";
import { useAtomValue, useSetAtom } from "jotai";
import { ScrollView, StyleSheet } from "react-native";
import { Badge } from "../../../components/ui/badge";
import {
	categoryRegistryValueAtom,
	clearSelectedCategoriesAtom,
	selectedCategoriesValueAtom,
	toggleSelectedCategoryAtom,
} from "../stores/calendar-atoms";

export function CategoryFilterBar() {
	const categories = useAtomValue(categoryRegistryValueAtom).all();
	const selectedCategories = useAtomValue(selectedCategoriesValueAtom);
	const toggleCategory = useSetAtom(toggleSelectedCategoryAtom);
	const clearCategories = useSetAtom(clearSelectedCategoriesAtom);

	const isAllSelected = selectedCategories.size === 0;

	return (
		<ScrollView
			testID="category-filter-scroll"
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
		>
			<Badge
				testID="filter-badge-all"
				label="すべて"
				selected={isAllSelected}
				onPress={clearCategories}
			/>
			{categories.map((category) => (
				<Badge
					key={category.name}
					testID={`filter-badge-${category.name}`}
					label={category.name}
					color={category.color}
					selected={selectedCategories.has(category.name)}
					onPress={() => toggleCategory(category.name)}
				/>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: parseNumeric(spacing[2]),
		paddingHorizontal: parseNumeric(spacing[4]),
		paddingVertical: parseNumeric(spacing[3]),
	},
});
