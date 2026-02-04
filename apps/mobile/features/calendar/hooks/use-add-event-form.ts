import { useCallback, useState } from "react";
import type { CalendarDay } from "../../../components/ui/calendar-grid/utils";
import { generateCalendarGrid } from "../../../components/ui/calendar-grid/utils";
import { formatDateLabel } from "../../../components/ui/date-picker/utils";
import { getTodayString, padGrid } from "../utils/calendar-utils";

export type DatePickerTarget = "start" | "end" | null;

export type AddEventFormState = {
	title: string;
	start: string;
	end: string;
	allDay: boolean;
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
	const [visible, setVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [start, setStart] = useState(getTodayString);
	const [end, setEnd] = useState("");
	const [allDay, setAllDay] = useState(true);
	const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget>(null);
	const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
	const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());

	const isDatePickerMode = datePickerTarget !== null;
	const hasRange = !!start && !!end && start !== end;

	const handleOpen = useCallback(() => setVisible(true), []);

	const handleClose = useCallback(() => {
		setVisible(false);
		setTitle("");
		setStart(getTodayString());
		setEnd("");
		setAllDay(true);
		setDatePickerTarget(null);
	}, []);

	const enterDatePickerMode = useCallback(
		(target: "start" | "end") => {
			const currentValue = target === "start" ? start : end;
			if (currentValue) {
				const [y, m] = currentValue.split("-").map(Number);
				setDisplayYear(y);
				setDisplayMonth(m - 1);
			} else {
				setDisplayYear(new Date().getFullYear());
				setDisplayMonth(new Date().getMonth());
			}
			setDatePickerTarget(target);
		},
		[start, end],
	);

	const handleDateTriggerPress = useCallback(
		(target: "start" | "end") => {
			if (!isDatePickerMode) {
				enterDatePickerMode(target);
			} else {
				setDatePickerTarget(target);
			}
		},
		[isDatePickerMode, enterDatePickerMode],
	);

	const handleDayPress = useCallback(
		(dateKey: string) => {
			if (datePickerTarget === "start") {
				setStart(dateKey);
				if (end && dateKey > end) {
					setStart(end);
					setEnd(dateKey);
				}
			} else if (datePickerTarget === "end") {
				if (start && dateKey < start) {
					setEnd(start);
					setStart(dateKey);
				} else {
					setEnd(dateKey);
				}
			}
		},
		[datePickerTarget, start, end],
	);

	const handleDatePickerBack = useCallback(() => {
		setDatePickerTarget(null);
	}, []);

	const handlePrevMonth = useCallback(() => {
		if (displayMonth === 0) {
			setDisplayYear((y) => y - 1);
			setDisplayMonth(11);
		} else {
			setDisplayMonth((m) => m - 1);
		}
	}, [displayMonth]);

	const handleNextMonth = useCallback(() => {
		if (displayMonth === 11) {
			setDisplayYear((y) => y + 1);
			setDisplayMonth(0);
		} else {
			setDisplayMonth((m) => m + 1);
		}
	}, [displayMonth]);

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

	const rawGrid = generateCalendarGrid(displayYear, displayMonth);
	const grid = padGrid(rawGrid);

	return {
		formState: {
			title,
			start,
			end,
			allDay,
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
