export interface CalendarEvent {
	id: string;
	title: string;
	date: string;
	startTime?: string;
	endTime?: string;
	description?: string;
	tags?: string[];
}

export interface CalendarDay {
	date: string;
	events: CalendarEvent[];
}
