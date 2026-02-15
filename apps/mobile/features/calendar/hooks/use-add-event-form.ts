import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { formatDateLabel } from "../../../components/ui/date-picker/utils";
import {
	type DatePickerTarget,
	allDayValueAtom,
	closeFormAtom,
	datePickerTargetValueAtom,
	displayMonthValueAtom,
	displayYearValueAtom,
	endTimeValueAtom,
	endValueAtom,
	enterDatePickerModeAtom,
	exitDatePickerModeAtom,
	gridValueAtom,
	hasRangeValueAtom,
	isDatePickerModeValueAtom,
	nextMonthAtom,
	openFormAtom,
	prevMonthAtom,
	selectDayAtom,
	setAllDayAtom,
	setEndTimeAtom,
	setStartTimeAtom,
	setTitleAtom,
	startTimeValueAtom,
	startValueAtom,
	switchDatePickerTargetAtom,
	titleValueAtom,
	visibleValueAtom,
} from "../stores/add-event-form-atoms";
import type { CalendarDay } from "../utils/calendar-grid-utils";

export type { DatePickerTarget } from "../stores/add-event-form-atoms";

export type AddEventFormState = {
	title: string;
	start: string;
	end: string;
	allDay: boolean;
	startTime: string;
	endTime: string;
};

export type AddEventFormUI = {
	visible: boolean;
	isDatePickerMode: boolean;
	datePickerTarget: DatePickerTarget;
	displayYear: number;
	displayMonth: number;
	grid: CalendarDay[][];
	hasRange: boolean;
};

export type AddEventFormActions = {
	handleOpen: () => void;
	handleClose: () => void;
	setTitle: (text: string) => void;
	setAllDay: (value: boolean) => void;
	setStartTime: (value: string) => void;
	setEndTime: (value: string) => void;
	handleDateTriggerPress: (target: "start" | "end") => void;
	handleDayPress: (dateKey: string) => void;
	handleDatePickerBack: () => void;
	handlePrevMonth: () => void;
	handleNextMonth: () => void;
	getDateTriggerDisplayValue: (target: "start" | "end") => string;
	getDateTriggerHasValue: (target: "start" | "end") => boolean;
};

export type UseAddEventFormReturn = {
	formState: AddEventFormState;
	ui: AddEventFormUI;
	actions: AddEventFormActions;
};

export function useAddEventForm() {
	// Read-only values
	const title = useAtomValue(titleValueAtom);
	const start = useAtomValue(startValueAtom);
	const end = useAtomValue(endValueAtom);
	const allDay = useAtomValue(allDayValueAtom);
	const startTime = useAtomValue(startTimeValueAtom);
	const endTime = useAtomValue(endTimeValueAtom);
	const visible = useAtomValue(visibleValueAtom);
	const datePickerTarget = useAtomValue(datePickerTargetValueAtom);
	const displayYear = useAtomValue(displayYearValueAtom);
	const displayMonth = useAtomValue(displayMonthValueAtom);
	const isDatePickerMode = useAtomValue(isDatePickerModeValueAtom);
	const hasRange = useAtomValue(hasRangeValueAtom);
	const grid = useAtomValue(gridValueAtom);

	// Actions
	const openForm = useSetAtom(openFormAtom);
	const closeForm = useSetAtom(closeFormAtom);
	const setTitle = useSetAtom(setTitleAtom);
	const setAllDay = useSetAtom(setAllDayAtom);
	const setStartTime = useSetAtom(setStartTimeAtom);
	const setEndTime = useSetAtom(setEndTimeAtom);
	const enterDatePickerMode = useSetAtom(enterDatePickerModeAtom);
	const switchDatePickerTarget = useSetAtom(switchDatePickerTargetAtom);
	const exitDatePickerMode = useSetAtom(exitDatePickerModeAtom);
	const selectDay = useSetAtom(selectDayAtom);
	const prevMonth = useSetAtom(prevMonthAtom);
	const nextMonth = useSetAtom(nextMonthAtom);

	const handleOpen = useCallback(() => openForm(), [openForm]);
	const handleClose = useCallback(() => closeForm(), [closeForm]);

	const handleDateTriggerPress = useCallback(
		(target: "start" | "end") => {
			if (!isDatePickerMode) {
				enterDatePickerMode(target);
			} else {
				switchDatePickerTarget(target);
			}
		},
		[isDatePickerMode, enterDatePickerMode, switchDatePickerTarget],
	);

	const handleDayPress = useCallback(
		(dateKey: string) => {
			selectDay(dateKey);
		},
		[selectDay],
	);

	const handleDatePickerBack = useCallback(() => {
		exitDatePickerMode();
	}, [exitDatePickerMode]);

	const handlePrevMonth = useCallback(() => {
		prevMonth();
	}, [prevMonth]);

	const handleNextMonth = useCallback(() => {
		nextMonth();
	}, [nextMonth]);

	const getDateTriggerDisplayValue = useCallback(
		(target: "start" | "end") => {
			const value = target === "start" ? start : end;
			return value ? formatDateLabel(value) : target === "start" ? "開始日" : "終了日";
		},
		[start, end],
	);

	const getDateTriggerHasValue = useCallback(
		(target: "start" | "end") => {
			return target === "start" ? !!start : !!end;
		},
		[start, end],
	);

	return {
		formState: {
			title,
			start,
			end,
			allDay,
			startTime,
			endTime,
		},
		ui: {
			visible,
			isDatePickerMode,
			datePickerTarget,
			displayYear,
			displayMonth,
			grid,
			hasRange,
		},
		actions: {
			handleOpen,
			handleClose,
			setTitle,
			setAllDay,
			setStartTime,
			setEndTime,
			handleDateTriggerPress,
			handleDayPress,
			handleDatePickerBack,
			handlePrevMonth,
			handleNextMonth,
			getDateTriggerDisplayValue,
			getDateTriggerHasValue,
		},
	} satisfies UseAddEventFormReturn;
}
