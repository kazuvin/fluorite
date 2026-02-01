import { type DailyNote, parseDailyNote } from "@fluorite/core";
import { useState } from "react";

const SAMPLE_MARKDOWN = `# 2025-01-31

- [09:00-10:00] Team standup #work
- [12:00-13:00] Lunch break
- [15:00] Review PR #work
`;

function App() {
	const [markdown] = useState(SAMPLE_MARKDOWN);
	const dailyNote: DailyNote | null = parseDailyNote(markdown);

	if (!dailyNote) {
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
				<h2 className="text-xl font-semibold mb-2">{dailyNote.date}</h2>
				<ul className="space-y-1">
					{dailyNote.entries.map((entry) => (
						<li key={entry.title} className="flex items-center flex-wrap gap-2 py-1">
							{entry.time && (
								<span className="font-semibold text-tint">
									{entry.time.start}
									{entry.time.end && `-${entry.time.end}`}
								</span>
							)}
							<span className="text-base">{entry.title}</span>
							{entry.tags?.map((tag: string) => (
								<span key={tag} className="px-2 py-0.5 bg-tint/15 text-tint rounded-sm text-sm">
									#{tag}
								</span>
							))}
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}

export default App;
