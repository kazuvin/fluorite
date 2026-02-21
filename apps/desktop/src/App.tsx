import { type EventNote, parseEventNote } from "@fluorite/core";
import { useState } from "react";

const SAMPLE_MARKDOWN = `---
start: 2025-01-31
end: 2025-01-31
time: "09:00 - 10:00"
tags:
  - work
---

# Team standup
`;

function App() {
	const [markdown] = useState(SAMPLE_MARKDOWN);
	const eventNote: EventNote | null = parseEventNote(markdown);

	if (!eventNote) {
		return (
			<main className="p-8 bg-background text-text min-h-screen">
				<h1 className="text-3xl font-bold mb-5">Fluorite Calendar</h1>
				<p>No data</p>
			</main>
		);
	}

	return (
		<main className="p-8 bg-background text-text min-h-screen">
			<h1 className="text-3xl font-bold mb-5">Fluorite Calendar</h1>
			<section className="mb-5">
				<h2 className="text-xl font-semibold mb-2">{eventNote.title}</h2>
				<div className="flex items-center flex-wrap gap-2 py-1">
					<span className="text-sm text-textMuted">
						{eventNote.start}
						{eventNote.start !== eventNote.end && ` - ${eventNote.end}`}
					</span>
					{eventNote.time && (
						<span className="font-semibold text-accent">
							{eventNote.time.start}
							{eventNote.time.end && `-${eventNote.time.end}`}
						</span>
					)}
					{eventNote.tags?.map((tag: string) => (
						<span key={tag} className="px-2 py-0.5 bg-accent/15 text-accent rounded-sm text-sm">
							#{tag}
						</span>
					))}
				</div>
				{eventNote.body && <p className="mt-2 text-sm">{eventNote.body}</p>}
			</section>
		</main>
	);
}

export default App;
