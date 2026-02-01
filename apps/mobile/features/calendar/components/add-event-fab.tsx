import { colors, parseNumeric, spacing } from "@fluorite/design-tokens";
import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { Button, ButtonText } from "../../../components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import { Input } from "../../../components/ui/input";

export function AddEventFab() {
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState("");
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const handleOpen = () => setVisible(true);
	const handleClose = () => {
		setVisible(false);
		setTitle("");
	};

	return (
		<>
			<Pressable
				testID="add-event-fab"
				accessibilityRole="button"
				onPress={handleOpen}
				style={({ pressed }) => [
					styles.fab,
					{ backgroundColor: theme.tint },
					pressed && styles.pressed,
				]}
			>
				<IconSymbol name="plus" size={28} color="#fff" />
			</Pressable>
			<Dialog visible={visible} onClose={handleClose}>
				<DialogHeader>
					<DialogTitle>予定を追加</DialogTitle>
					<DialogClose />
				</DialogHeader>
				<DialogContent>
					<Input placeholder="タイトル" value={title} onChangeText={setTitle} />
					<Button>
						<ButtonText>追加する</ButtonText>
					</Button>
				</DialogContent>
			</Dialog>
		</>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		bottom: parseNumeric(spacing[8]),
		right: parseNumeric(spacing[5]),
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		elevation: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	pressed: {
		opacity: 0.8,
	},
});
