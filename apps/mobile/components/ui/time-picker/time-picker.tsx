import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme } from "react-native";

type TimePickerProps = {
	value?: string;
	onValueChange: (time: string) => void;
	placeholder?: string;
	testID?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export function TimePicker({ value, onValueChange, placeholder, testID }: TimePickerProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const [isOpen, setIsOpen] = useState(false);

	const parseInitialHour = (): number | null => {
		if (!value) return null;
		const h = Number.parseInt(value.split(":")[0], 10);
		return Number.isNaN(h) ? null : h;
	};
	const parseInitialMinute = (): number | null => {
		if (!value) return null;
		const m = Number.parseInt(value.split(":")[1], 10);
		return Number.isNaN(m) ? null : m;
	};

	const [selectedHour, setSelectedHour] = useState<number | null>(parseInitialHour);
	const [selectedMinute, setSelectedMinute] = useState<number | null>(parseInitialMinute);

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	const handleHourSelect = (hour: number) => {
		setSelectedHour(hour);
		if (selectedMinute !== null) {
			const hh = String(hour).padStart(2, "0");
			const mm = String(selectedMinute).padStart(2, "0");
			onValueChange(`${hh}:${mm}`);
			setIsOpen(false);
		}
	};

	const handleMinuteSelect = (minute: number) => {
		setSelectedMinute(minute);
		if (selectedHour !== null) {
			const hh = String(selectedHour).padStart(2, "0");
			const mm = String(minute).padStart(2, "0");
			onValueChange(`${hh}:${mm}`);
			setIsOpen(false);
		}
	};

	return (
		<View>
			<Pressable
				testID={testID ?? "time-picker-trigger"}
				onPress={handleToggle}
				style={{
					borderRadius: parseNumeric(radius.xl),
					borderCurve: "continuous",
					padding: parseNumeric(spacing[4]),
					fontSize: parseNumeric(fontSize.base),
					backgroundColor: theme.muted,
					color: theme.text,
				}}
			>
				<Text
					style={{
						fontSize: parseNumeric(fontSize.base),
						color: value ? theme.text : theme.icon,
					}}
				>
					{value ?? placeholder}
				</Text>
			</Pressable>

			{isOpen && (
				<View
					testID="time-picker-panel"
					style={{
						flexDirection: "row",
						gap: parseNumeric(spacing[4]),
						marginTop: parseNumeric(spacing[2]),
					}}
				>
					<View style={{ flex: 1, maxHeight: 200 }}>
						<Text
							style={{
								fontSize: parseNumeric(fontSize.sm),
								fontWeight: "600",
								textAlign: "center",
								marginBottom: parseNumeric(spacing[2]),
								color: theme.text,
							}}
						>
							時
						</Text>
						<ScrollView>
							{HOURS.map((hh) => {
								const hourNum = Number.parseInt(hh, 10);
								const isSelected = selectedHour === hourNum;
								return (
									<Pressable
										key={hh}
										testID={`hour-${hh}`}
										onPress={() => handleHourSelect(hourNum)}
										style={{
											padding: parseNumeric(spacing[2]),
											borderRadius: parseNumeric(radius.md),
											alignItems: "center",
											backgroundColor: isSelected ? theme.tint : undefined,
										}}
									>
										<Text
											style={{
												color: isSelected ? "#fff" : theme.text,
											}}
										>
											{hh}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>

					<View style={{ flex: 1, maxHeight: 200 }}>
						<Text
							style={{
								fontSize: parseNumeric(fontSize.sm),
								fontWeight: "600",
								textAlign: "center",
								marginBottom: parseNumeric(spacing[2]),
								color: theme.text,
							}}
						>
							分
						</Text>
						<ScrollView>
							{MINUTES.map((mm) => {
								const minNum = Number.parseInt(mm, 10);
								const isSelected = selectedMinute === minNum;
								return (
									<Pressable
										key={mm}
										testID={`minute-${mm}`}
										onPress={() => handleMinuteSelect(minNum)}
										style={{
											padding: parseNumeric(spacing[2]),
											borderRadius: parseNumeric(radius.md),
											alignItems: "center",
											backgroundColor: isSelected ? theme.tint : undefined,
										}}
									>
										<Text
											style={{
												color: isSelected ? "#fff" : theme.text,
											}}
										>
											{mm}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				</View>
			)}
		</View>
	);
}
