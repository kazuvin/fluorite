import { useAddEventForm } from "../../hooks/use-add-event-form";
import { AddEventDialog } from "./add-event-dialog";
import { AddEventFabButton } from "./add-event-fab-button";

export function AddEvent() {
	const { formState, ui, actions } = useAddEventForm();

	return (
		<>
			<AddEventFabButton onPress={actions.handleOpen} />
			<AddEventDialog
				visible={ui.visible}
				onClose={actions.handleClose}
				formState={formState}
				ui={ui}
				actions={actions}
			/>
		</>
	);
}
