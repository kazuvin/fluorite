import { colors, fontSize, parseNumeric, radius, spacing } from "@fluorite/design-tokens";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	Keyframe,
	LinearTransition,
} from "react-native-reanimated";
import { Button, ButtonText } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { IconSymbol } from "../../../../components/ui/icon-symbol";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import type {
	AddEventFormActions,
	AddEventFormState,
	AddEventFormUI,
} from "../../hooks/use-add-event-form";
import { DateRangePickerInline } from "./date-range-picker-inline";

const titleEntering = new Keyframe({
	0: { opacity: 0, transform: [{ translateX: 20 }] },
	100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.out(Easing.ease) },
}).duration(100);

const titleExiting = new Keyframe({
	0: { opacity: 1, transform: [{ translateX: 0 }] },
	100: { opacity: 0, transform: [{ translateX: -20 }], easing: Easing.in(Easing.ease) },
}).duration(80);

export type AddEventDialogProps = {
	visible: boolean;
	onClose: () => void;
	formState: AddEventFormState;
	ui: Omit<AddEventFormUI, "visible">;
	actions: AddEventFormActions;
};

export function AddEventDialog({ visible, onClose, formState, ui, actions }: AddEventDialogProps) {
	const scheme = useColorScheme() ?? "light";
	const theme = colors[scheme];

	const { title, start, end, allDay } = formState;
	const { isDatePickerMode, datePickerTarget, displayYear, displayMonth, grid, hasRange } = ui;
	const {
		setTitle,
		setAllDay,
		handleDateTriggerPress,
		handleDatePickerBack,
		handlePrevMonth,
		handleNextMonth,
		handleDayPress,
		getDateTriggerDisplayValue,
		getDateTriggerHasValue,
	} = actions;

	return (
		<Dialog visible={visible} onClose={onClose} closeOnOverlayPress={false}>
			<DialogHeader>
				{isDatePickerMode ? (
					<Animated.View
						key="picker-header"
						entering={titleEntering}
						exiting={titleExiting}
						style={styles.datePickerHeader}
					>
						<Pressable
							testID="date-picker-back"
							accessibilityRole="button"
							onPress={handleDatePickerBack}
							style={styles.backButton}
						>
							<IconSymbol name="chevron.left" size={20} color={theme.text} />
						</Pressable>
						<DialogTitle>開始日・終了日</DialogTitle>
					</Animated.View>
				) : (
					<Animated.View
						key="normal-header"
						entering={titleEntering}
						exiting={titleExiting}
						style={styles.normalHeader}
					>
						<DialogTitle>予定を追加</DialogTitle>
						<Pressable
							testID="dialog-close"
							accessibilityRole="button"
							onPress={onClose}
							style={styles.closeButton}
						>
							<IconSymbol name="xmark" size={16} color={colors.light.icon} />
						</Pressable>
					</Animated.View>
				)}
			</DialogHeader>
			<DialogContent>
				{!isDatePickerMode && (
					<Animated.View
						key="form-fields"
						entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
						exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
						style={styles.formFieldsAboveDate}
					>
						<Input placeholder="タイトル" value={title} onChangeText={setTitle} />
					</Animated.View>
				)}

				<Animated.View
					testID="date-row"
					layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
					style={styles.dateRow}
				>
					<Animated.View
						style={styles.dateFlex}
						layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
					>
						<Pressable
							testID="date-trigger-start"
							onPress={() => handleDateTriggerPress("start")}
							style={[
								styles.dateTrigger,
								{ backgroundColor: theme.muted },
								datePickerTarget === "start" && {
									...styles.dateTriggerFocused,
									borderColor: theme.tint,
								},
							]}
						>
							<Text
								style={{
									color: getDateTriggerHasValue("start") ? theme.text : theme.icon,
									fontSize: parseNumeric(fontSize.xs),
								}}
							>
								{getDateTriggerDisplayValue("start")}
							</Text>
						</Pressable>
					</Animated.View>
					<Animated.View
						style={styles.dateFlex}
						layout={LinearTransition.duration(100).easing(Easing.inOut(Easing.ease))}
					>
						<Pressable
							testID="date-trigger-end"
							onPress={() => handleDateTriggerPress("end")}
							style={[
								styles.dateTrigger,
								{ backgroundColor: theme.muted },
								datePickerTarget === "end" && {
									...styles.dateTriggerFocused,
									borderColor: theme.tint,
								},
							]}
						>
							<Text
								style={{
									color: getDateTriggerHasValue("end") ? theme.text : theme.icon,
									fontSize: parseNumeric(fontSize.xs),
								}}
							>
								{getDateTriggerDisplayValue("end")}
							</Text>
						</Pressable>
					</Animated.View>
				</Animated.View>

				{isDatePickerMode && (
					<Animated.View
						key="calendar-mode"
						entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
						exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
					>
						<DateRangePickerInline
							displayYear={displayYear}
							displayMonth={displayMonth}
							grid={grid}
							start={start}
							end={end}
							hasRange={hasRange}
							onPrevMonth={handlePrevMonth}
							onNextMonth={handleNextMonth}
							onDayPress={handleDayPress}
						/>
					</Animated.View>
				)}

				{!isDatePickerMode && (
					<Animated.View
						key="switch-all-day"
						entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
						exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
						style={styles.formFieldsAboveDate}
					>
						<Switch label="終日" value={allDay} onValueChange={setAllDay} />
					</Animated.View>
				)}

				{!isDatePickerMode && (
					<Animated.View
						key="add-button"
						entering={FadeIn.duration(100).easing(Easing.out(Easing.ease))}
						exiting={FadeOut.duration(80).easing(Easing.in(Easing.ease))}
					>
						<Button>
							<ButtonText>追加する</ButtonText>
						</Button>
					</Animated.View>
				)}
			</DialogContent>
		</Dialog>
	);
}

const OUTLINE_OFFSET = 3;
const OUTLINE_WIDTH = 2;

const styles = StyleSheet.create({
	dateRow: {
		flexDirection: "row",
		gap: parseNumeric(spacing[2]),
	},
	dateFlex: {
		flex: 1,
	},
	datePickerHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: parseNumeric(spacing[3]),
	},
	normalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		flex: 1,
	},
	backButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(104, 112, 118, 0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	dateTrigger: {
		borderRadius: parseNumeric(radius.xl),
		borderCurve: "continuous",
		padding: parseNumeric(spacing[4]),
		borderWidth: OUTLINE_WIDTH,
		borderColor: "transparent",
		margin: OUTLINE_OFFSET,
	},
	dateTriggerFocused: {
		borderWidth: OUTLINE_WIDTH,
	},
	formFieldsAboveDate: {
		gap: parseNumeric(spacing[6]),
	},
});
