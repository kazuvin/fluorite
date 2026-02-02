import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, View } from "react-native";

type DailyCalendarPlaceholderProps = {
	isVisible: boolean;
	dateKey: string | null;
	textColor?: string;
};

export function DailyCalendarPlaceholder({
	isVisible,
	dateKey,
	textColor,
}: DailyCalendarPlaceholderProps) {
	if (!isVisible) return null;

	return (
		<View testID="daily-calendar-placeholder" style={styles.container}>
			{dateKey && (
				<Text style={[styles.dateText, textColor ? { color: textColor } : undefined]}>
					{dateKey}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: parseNumeric(spacing[4]),
		paddingVertical: parseNumeric(spacing[4]),
		minHeight: 200,
	},
	dateText: {
		fontSize: parseNumeric(fontSize.sm),
		fontWeight: fontWeight.medium,
	},
});
