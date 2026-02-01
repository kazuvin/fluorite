import { colors, fontSize, fontWeight, parseNumeric, spacing } from "@fluorite/design-tokens";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { CalendarGridContainer } from "../../features/calendar";

export default function HomeScreen() {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Text style={[styles.title, { color: theme.text }]}>Fluorite</Text>
			<CalendarGridContainer />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
		paddingHorizontal: parseNumeric(spacing[3]),
	},
	title: {
		fontSize: parseNumeric(fontSize["2xl"]),
		fontWeight: fontWeight.bold,
		marginBottom: parseNumeric(spacing[4]),
		paddingHorizontal: parseNumeric(spacing[2]),
	},
});
