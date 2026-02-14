import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { setSelectedDateAtom } from "../../stores/selected-date-atoms";
import { getTodayString } from "../../utils/calendar-utils";
import { TodayFabButton } from "./today-fab-button";

export function TodayFab() {
	const setSelectedDate = useSetAtom(setSelectedDateAtom);

	const handlePress = useCallback(() => {
		setSelectedDate(getTodayString());
	}, [setSelectedDate]);

	return <TodayFabButton onPress={handlePress} />;
}
