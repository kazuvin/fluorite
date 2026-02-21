import {
	categoryForeground,
	colors,
	fontSize,
	fontWeight,
	parseNumeric,
	radius,
	spacing,
} from "@fluorite/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../../constants/theme";
import type { CalendarEvent } from "../../../../features/calendar/utils/event-layout";

type AllDaySectionProps = {
	events: CalendarEvent[];
	textColor: string;
};

export function AllDaySection({ events, textColor }: AllDaySectionProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	if (events.length === 0) return null;

	return (
		<View
			testID="all-day-section"
			style={[styles.container, { borderBottomColor: theme.borderMuted }]}
		>
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
						<Text style={[styles.eventTitle, { color: categoryForeground }]} numberOfLines={1}>
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
		paddingHorizontal: parseNumeric(spacing["4"]),
		borderBottomWidth: 1,
	},
	labelContainer: {
		width: parseNumeric(spacing["12"]),
		alignItems: "flex-start",
		justifyContent: "center",
	},
	label: {
		...textBase,
		fontSize: parseNumeric(fontSize.xs),
	},
	eventsContainer: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: parseNumeric(spacing["2"]),
	},
	eventBlock: {
		paddingHorizontal: parseNumeric(spacing["4"]),
		paddingVertical: parseNumeric(spacing["3"]),
		borderRadius: parseNumeric(radius.full),
		borderCurve: "continuous",
	},
	eventTitle: {
		...textBase,
		fontSize: parseNumeric(fontSize.xs),
		fontWeight: fontWeight.semibold,
	},
});
