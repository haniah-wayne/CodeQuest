"use client";

import { AiMagicIcon, BubbleChatEditIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Row } from "@tanstack/react-table";
import { cn } from "cn";
import { useState } from "react";
import { useGrading, verdictStyles } from "@/components/challenge/ai-grade";
import { FeedbackDialog } from "@/components/challenge/feedback-dialog";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import type { DataTableFeatures } from "@/components/class/data-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SubmissionActions({ row }: { row: Row<DataTableFeatures, SubmissionRow> }) {
	const { entries, grade } = useGrading();
	const [feedbackOpen, setFeedbackOpen] = useState(false);

	const { id, code, studentName, feedback } = row.original;
	const entry = entries[id];
	const result = entry?.grade;

	const gradeLabel = entry?.pending
		? "Grading…"
		: result
			? "Regrade with AI"
			: entry?.error
				? "Retry AI grade"
				: "Grade with AI";

	return (
		<div className="flex items-center justify-end gap-1">
			{result && (
				<Button
					variant="ghost"
					size="xs"
					className={cn("tabular-nums", verdictStyles[result.verdict].className)}
					aria-label={`AI recommends ${result.score} of ${result.maxScore} points for ${studentName}. ${row.getIsExpanded() ? "Hide" : "Show"} details`}
					onClick={row.getToggleExpandedHandler()}
				>
					{result.score} / {result.maxScore}
				</Button>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Actions for ${studentName}'s submission`}
						>
							<HugeiconsIcon icon={MoreHorizontalIcon} />
						</Button>
					}
				/>

				<DropdownMenuContent align="end" className="w-auto">
					<DropdownMenuItem
						disabled={!code || entry?.pending}
						onClick={() => {
							row.toggleExpanded(true);
							grade(id);
						}}
					>
						<HugeiconsIcon icon={AiMagicIcon} />
						{gradeLabel}
					</DropdownMenuItem>

					{feedback && (
						<DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
							<HugeiconsIcon icon={BubbleChatEditIcon} />
							Edit feedback
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{feedback && (
				<FeedbackDialog
					submissionId={id}
					title="Edit feedback"
					submitLabel="Save feedback"
					initialFeedback={feedback}
					open={feedbackOpen}
					onOpenChange={setFeedbackOpen}
				/>
			)}
		</div>
	);
}
