import { parseCalendarMarkdown } from "@fluorite/core";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const SAMPLE_MARKDOWN = `## 2025-01-31

- 09:00-10:00 Team standup #work
- 12:00-13:00 Lunch break
- 15:00 Review PR #work
`;

export default function HomeScreen() {
	const days = parseCalendarMarkdown(SAMPLE_MARKDOWN);

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Fluorite Calendar</Text>
			{days.map((day) => (
				<View key={day.date} style={styles.daySection}>
					<Text style={styles.dateHeading}>{day.date}</Text>
					{day.events.map((event) => (
						<View key={event.id} style={styles.eventRow}>
							{event.startTime && (
								<Text style={styles.time}>
									{event.startTime}
									{event.endTime ? `-${event.endTime}` : ""}
								</Text>
							)}
							<Text style={styles.eventTitle}>{event.title}</Text>
							{event.tags?.map((tag) => (
								<View key={tag} style={styles.tag}>
									<Text style={styles.tagText}>#{tag}</Text>
								</View>
							))}
						</View>
					))}
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		paddingTop: 60,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
	},
	daySection: {
		marginBottom: 20,
	},
	dateHeading: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 8,
	},
	eventRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		flexWrap: "wrap",
	},
	time: {
		fontWeight: "600",
		marginRight: 8,
		color: "#4f46e5",
	},
	eventTitle: {
		fontSize: 16,
	},
	tag: {
		marginLeft: 8,
		backgroundColor: "#e0e7ff",
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	tagText: {
		fontSize: 13,
		color: "#4338ca",
	},
});
