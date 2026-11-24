"use client";

import { BubbleChatIcon } from "@hugeicons/core-free-icons";
import { StatusBadge } from "@/components/challenge/submission-status";
import { ClassSection } from "@/components/class/class-section";

const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

export function SubmissionFeedback({
	status,
	submittedAt,
	feedback,
}: {
	status: string | null;
	submittedAt: string;
	feedback: string;
}) {
	return (
		<ClassSection id="feedback" title="Instructor feedback" icon={BubbleChatIcon}>
			<div className="p-4">
				<div className="flex flex-wrap items-center gap-2">
					<StatusBadge status={status} />

					<span className="text-caption text-muted-foreground">
						Submission from{" "}
						<time
							className="tabular-nums"
							dateTime={submittedAt}
							suppressHydrationWarning
						>
							{dateFormat.format(new Date(submittedAt))}
						</time>
					</span>
				</div>

				<p className="text-body-sm wrap-break-word whitespace-pre-wrap">{feedback}</p>
			</div>
		</ClassSection>
	);
}
