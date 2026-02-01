import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "../components/themed-view";
import { CalendarGridContainer } from "../features/calendar";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<SafeAreaView>
				<CalendarGridContainer />
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
