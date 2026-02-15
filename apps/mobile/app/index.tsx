import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "../components/shared/themed-view";
import { AddEvent, CalendarContainer, DeselectDateFab, TodayFab } from "../features/calendar";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<CalendarContainer />
			</SafeAreaView>
			<TodayFab />
			<DeselectDateFab />
			<AddEvent />
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
});
