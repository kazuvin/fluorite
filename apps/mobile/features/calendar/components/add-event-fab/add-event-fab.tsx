import { useAddEventForm } from "../../hooks/use-add-event-form";
import { AddEventDialog } from "./add-event-dialog";
import { AddEventFabButton } from "./add-event-fab-button";

export function AddEventFab() {
	const {
		visible,
		handleOpen,
		handleClose,
		formState,
		setTitle,
		setAllDay,
		isDatePickerMode,
		datePickerTarget,
		handleDateTriggerPress,
		handleDayPress,
		handleDatePickerBack,
		displayYear,
		displayMonth,
		handlePrevMonth,
		handleNextMonth,
		grid,
		getDateTriggerDisplayValue,
		getDateTriggerHasValue,
		hasRange,
	} = useAddEventForm();

	return (
		<>
			<AddEventFabButton onPress={handleOpen} />
			<AddEventDialog
				visible={visible}
				onClose={handleClose}
				title={formState.title}
				onTitleChange={setTitle}
				start={formState.start}
				end={formState.end}
				allDay={formState.allDay}
				onAllDayChange={setAllDay}
				isDatePickerMode={isDatePickerMode}
				datePickerTarget={datePickerTarget}
				onDateTriggerPress={handleDateTriggerPress}
				onDatePickerBack={handleDatePickerBack}
				displayYear={displayYear}
				displayMonth={displayMonth}
				grid={grid}
				hasRange={hasRange}
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				onDayPress={handleDayPress}
				getDateTriggerDisplayValue={getDateTriggerDisplayValue}
				getDateTriggerHasValue={getDateTriggerHasValue}
			/>
		</>
	);
}
