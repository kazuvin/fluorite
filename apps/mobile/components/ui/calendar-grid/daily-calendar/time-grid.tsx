import { fontSize, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, View } from "react-native";

const HOURS_IN_DAY = 24;
const TIME_LABEL_WIDTH = 48;

type TimeGridProps = {
	textColor: string;
	hourHeight: number;
};

export function TimeGrid({ textColor, hourHeight }: TimeGridProps) {
	const totalHeight = HOURS_IN_DAY * hourHeight;
	const hours = Array.from({ length: HOURS_IN_DAY }, (_, i) => i);

	return (
		<View testID="time-grid" style={[styles.container, { height: totalHeight }]}>
			{hours.map((hour) => (
				<View key={hour} style={[styles.hourRow, { height: hourHeight }]}>
					<View style={styles.labelContainer}>
						<Text style={[styles.label, { color: textColor }]}>{`${hour}:00`}</Text>
					</View>
					<View testID={`hour-line-${hour}`} style={styles.line} />
				</View>
			))}
		</View>
	);
}

export { TIME_LABEL_WIDTH };

const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	hourRow: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	labelContainer: {
		width: TIME_LABEL_WIDTH,
		paddingRight: parseNumeric(spacing["2"]),
		alignItems: "flex-end",
	},
	label: {
		fontSize: parseNumeric(fontSize.xs),
		marginTop: -6,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: "rgba(0,0,0,0.1)",
	},
});
