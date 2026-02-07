import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import { IconSymbol } from "../icon-symbol";

export type SelectOption = {
	label: string;
	value: string;
	color?: string;
};

export type SelectProps = {
	options: SelectOption[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	testID?: string;
};

export function Select({
	options,
	value,
	onValueChange,
	placeholder,
	disabled = false,
	testID = "select-trigger",
}: SelectProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];
	const [isOpen, setIsOpen] = useState(false);

	const selectedOption = options.find((opt) => opt.value === value);

	const handleTriggerPress = () => {
		if (disabled) return;
		setIsOpen((prev) => !prev);
	};

	const handleOptionPress = (optionValue: string) => {
		onValueChange(optionValue);
		setIsOpen(false);
	};

	return (
		<View>
			<Pressable
				testID={testID}
				onPress={handleTriggerPress}
				style={[styles.trigger, { backgroundColor: theme.surface }]}
				disabled={disabled}
			>
				<Text
					style={[
						styles.triggerText,
						{
							color: selectedOption ? theme.text : theme.textMuted,
						},
					]}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</Text>
				<IconSymbol name="chevron.down" size={16} color={theme.icon} />
			</Pressable>

			{isOpen && (
				<View testID="select-options" style={[styles.options, { backgroundColor: theme.surface }]}>
					{options.map((option) => (
						<Pressable
							key={option.value}
							onPress={() => handleOptionPress(option.value)}
							style={styles.option}
						>
							{option.color && (
								<View
									testID={`color-dot-${option.value}`}
									style={[styles.colorDot, { backgroundColor: option.color }]}
								/>
							)}
							<Text style={{ color: theme.text }}>{option.label}</Text>
						</Pressable>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	trigger: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		fontSize: parseNumeric(fontSize.base),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	triggerText: {
		fontSize: parseNumeric(fontSize.base),
	},
	options: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[2]),
		marginTop: parseNumeric(spacing[1]),
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		padding: parseNumeric(spacing[2]),
		gap: parseNumeric(spacing[2]),
	},
	colorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
});
