"use client";

import { BubbleChatIcon } from "@hugeicons/core-free-icons";
import { StatusBadge } from "@/components/challenge/submission-status";
import { ClassSection } from "@/components/class/class-section";

export interface FeedbackEntry {
	id: number;
	status: string | null;
	submittedAt: string;
	feedback: string;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

export function SubmissionFeedback({ entries }: { entries: FeedbackEntry[] }) {
	if (entries.length === 0) return null;

	return (
		<ClassSection id="feedback" title="Instructor feedback" icon={BubbleChatIcon}>
			<ul className="flex flex-col gap-2">
				{entries.map((entry) => (
					<li
						className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-4"
						key={entry.id}
					>
						<div className="flex flex-wrap items-center gap-2">
							<StatusBadge status={entry.status} />

							<span className="text-caption text-muted-foreground">
								Submission from{" "}
								<time
									className="tabular-nums"
									dateTime={entry.submittedAt}
									suppressHydrationWarning
								>
									{dateFormat.format(new Date(entry.submittedAt))}
								</time>
							</span>
						</div>

						<p className="text-body-sm wrap-break-word whitespace-pre-wrap">
							{entry.feedback}
						</p>
					</li>
				))}
			</ul>
		</ClassSection>
	);
}
