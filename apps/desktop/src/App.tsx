import { parseCalendarMarkdown } from "@fluorite/core";
import { useState } from "react";

const SAMPLE_MARKDOWN = `## 2025-01-31

- 09:00-10:00 Team standup #work
- 12:00-13:00 Lunch break
- 15:00 Review PR #work
`;

function App() {
	const [markdown] = useState(SAMPLE_MARKDOWN);
	const days = parseCalendarMarkdown(markdown);

	return (
		<main className="p-8 bg-background text-text min-h-screen">
			<h1 className="text-3xl font-bold mb-5">Fluorite Calendar</h1>
			{days.map((day) => (
				<section key={day.date} className="mb-5">
					<h2 className="text-xl font-semibold mb-2">{day.date}</h2>
					<ul className="space-y-1">
						{day.events.map((event) => (
							<li key={event.id} className="flex items-center flex-wrap gap-2 py-1">
								{event.startTime && (
									<span className="font-semibold text-tint">
										{event.startTime}
										{event.endTime && `-${event.endTime}`}
									</span>
								)}
								<span className="text-base">{event.title}</span>
								{event.tags?.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 bg-tint/15 text-tint rounded-sm text-sm"
									>
										#{tag}
									</span>
								))}
							</li>
						))}
					</ul>
				</section>
			))}
		</main>
	);
}

export default App;
