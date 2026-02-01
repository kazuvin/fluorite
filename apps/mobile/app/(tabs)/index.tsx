import { StyleSheet } from "react-native";
import { ThemedView } from "../../components/themed-view";
import { CalendarGridContainer } from "../../features/calendar";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<CalendarGridContainer />
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 40,
	},
});
