import { colors, fontSize, parseNumeric, spacing } from "@fluorite/design-tokens";
import { Switch as RNSwitch, StyleSheet, Text, View, useColorScheme } from "react-native";
import { textBase } from "../../../constants/theme";

export type SwitchProps = {
	value: boolean;
	onValueChange: (v: boolean) => void;
	disabled?: boolean;
	label?: string;
	testID?: string;
};

export function Switch({ value, onValueChange, disabled = false, label, testID }: SwitchProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	return (
		<View style={styles.container}>
			{label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
			<RNSwitch
				value={value}
				onValueChange={onValueChange}
				disabled={disabled}
				aria-disabled={disabled}
				trackColor={{ false: theme.surface, true: theme.primary }}
				testID={testID}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	label: {
		...textBase,
		fontSize: parseNumeric(fontSize.base),
		marginRight: parseNumeric(spacing[2]),
	},
});
