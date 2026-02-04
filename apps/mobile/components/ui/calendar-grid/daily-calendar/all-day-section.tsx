import { fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, View } from "react-native";
import type { CalendarEvent } from "../event-layout";

type AllDaySectionProps = {
	events: CalendarEvent[];
	textColor: string;
};

export function AllDaySection({ events, textColor }: AllDaySectionProps) {
	if (events.length === 0) return null;

	return (
		<View testID="all-day-section" style={styles.container}>
			<View style={styles.labelContainer}>
				<Text style={[styles.label, { color: textColor }]}>終日</Text>
			</View>
			<View style={styles.eventsContainer}>
				{events.map((event) => (
					<View
						key={event.id}
						testID={`all-day-event-${event.id}`}
						style={[styles.eventBlock, { backgroundColor: event.color }]}
					>
						<Text style={styles.eventTitle} numberOfLines={1}>
							{event.title}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingVertical: parseNumeric(spacing["2"]),
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	labelContainer: {
		width: 48,
		paddingRight: parseNumeric(spacing["2"]),
		alignItems: "flex-end",
		justifyContent: "center",
	},
	label: {
		fontSize: parseNumeric(fontSize.xs),
	},
	eventsContainer: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: parseNumeric(spacing["1"]),
	},
	eventBlock: {
		paddingHorizontal: parseNumeric(spacing["2"]),
		paddingVertical: parseNumeric(spacing["1"]),
		borderRadius: 4,
	},
	eventTitle: {
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.medium,
		color: "#FFFFFF",
	},
});
