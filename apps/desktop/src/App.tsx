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
		<main style={{ padding: "2rem", fontFamily: "system-ui" }}>
			<h1>Fluorite Calendar</h1>
			{days.map((day) => (
				<section key={day.date}>
					<h2>{day.date}</h2>
					<ul>
						{day.events.map((event) => (
							<li key={event.id}>
								{event.startTime && (
									<strong>
										{event.startTime}
										{event.endTime && `-${event.endTime}`}{" "}
									</strong>
								)}
								{event.title}
								{event.tags?.map((tag) => (
									<span
										key={tag}
										style={{
											marginLeft: "0.5rem",
											padding: "0.1rem 0.4rem",
											backgroundColor: "#e0e7ff",
											borderRadius: "0.25rem",
											fontSize: "0.85em",
										}}
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
