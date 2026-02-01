import { type DailyNote, parseDailyNote } from "@fluorite/core";
import {
	colors,
	fontSize,
	fontWeight,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { useColorScheme } from "react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const SAMPLE_MARKDOWN = `# 2025-01-31

- [09:00-10:00] Team standup #work
- [12:00-13:00] Lunch break
- [15:00] Review PR #work
`;

export default function HomeScreen() {
	const dailyNote: DailyNote | null = parseDailyNote(SAMPLE_MARKDOWN);
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	if (!dailyNote) {
		return (
			<ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.title, { color: theme.text }]}>Fluorite Calendar</Text>
				<Text style={{ color: theme.text }}>No data</Text>
			</ScrollView>
		);
	}

	return (
		<ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.title, { color: theme.text }]}>Fluorite Calendar</Text>
			<View style={styles.daySection}>
				<Text style={[styles.dateHeading, { color: theme.text }]}>{dailyNote.date}</Text>
				{dailyNote.entries.map((entry) => (
					<View key={entry.title} style={styles.eventRow}>
						{entry.time && (
							<Text style={[styles.time, { color: theme.tint }]}>
								{entry.time.start}
								{entry.time.end ? `-${entry.time.end}` : ""}
							</Text>
						)}
						<Text style={[styles.eventTitle, { color: theme.text }]}>{entry.title}</Text>
						{entry.tags?.map((tag) => (
							<View key={tag} style={[styles.tag, { backgroundColor: `${theme.tint}26` }]}>
								<Text style={[styles.tagText, { color: theme.tint }]}>#{tag}</Text>
							</View>
						))}
					</View>
				))}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: parseNumeric(spacing[5]),
		paddingTop: 60,
	},
	title: {
		fontSize: parseNumeric(fontSize["3xl"]),
		fontWeight: fontWeight.bold,
		marginBottom: parseNumeric(spacing[5]),
	},
	daySection: {
		marginBottom: parseNumeric(spacing[5]),
	},
	dateHeading: {
		fontSize: parseNumeric(fontSize.xl),
		fontWeight: fontWeight.semibold,
		marginBottom: parseNumeric(spacing[2]),
	},
	eventRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: parseNumeric(spacing[1]),
		flexWrap: "wrap",
		gap: parseNumeric(spacing[2]),
	},
	time: {
		fontWeight: fontWeight.semibold,
	},
	eventTitle: {
		fontSize: parseNumeric(fontSize.base),
	},
	tag: {
		paddingHorizontal: parseNumeric(spacing[2]),
		paddingVertical: parseNumeric(spacing[0]),
		borderRadius: parseNumeric(radius.sm),
	},
	tagText: {
		fontSize: parseNumeric(fontSize.sm),
	},
});
