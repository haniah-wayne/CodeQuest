"use client";

import { AiMagicIcon, BubbleChatAddIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";
import { createContext, use, useState } from "react";
import type * as React from "react";
import { gradeSubmission } from "@/app/dashboard/classes/[classId]/challenges/[challengeId]/actions";
import { FeedbackDialog } from "@/components/challenge/feedback-dialog";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiGrade, AiVerdict } from "@/lib/ai/grading";

interface GradeEntry {
	pending: boolean;
	error?: string;
	grade?: AiGrade;
}

const GradingContext = createContext<{
	entries: Record<number, GradeEntry>;
	grade: (submissionId: number) => void;
} | null>(null);

export function useGrading() {
	const context = use(GradingContext);

	if (!context) {
		throw new Error("useGrading must be used inside GradingProvider");
	}

	return context;
}

export function GradingProvider({ children }: { children: React.ReactNode }) {
	const [entries, setEntries] = useState<Record<number, GradeEntry>>({});

	function setEntry(id: number, update: (entry: GradeEntry | undefined) => GradeEntry) {
		setEntries((all) => ({ ...all, [id]: update(all[id]) }));
	}

	async function grade(submissionId: number) {
		// Keep the previous grade on screen while regrading
		setEntry(submissionId, (entry) => ({ grade: entry?.grade, pending: true }));

		try {
			const state = await gradeSubmission({ submissionId });

			setEntry(submissionId, (entry) => ({
				pending: false,
				error: state.error,
				grade: state.grade ?? entry?.grade,
			}));
		} catch (error) {
			console.error(error);

			setEntry(submissionId, (entry) => ({
				pending: false,
				error: "Something went wrong. Check your connection and try again.",
				grade: entry?.grade,
			}));
		}
	}

	return <GradingContext value={{ entries, grade }}>{children}</GradingContext>;
}

export const verdictStyles: Record<AiVerdict, { label: string; className: string }> = {
	correct: {
		label: "Correct",
		className: "bg-emerald-50 text-wsu-green",
	},
	partially_correct: {
		label: "Partially correct",
		className: "bg-amber-50 text-amber-700",
	},
	incorrect: {
		label: "Incorrect",
		className: "bg-destructive/10 text-destructive",
	},
};

export function formatAiFeedback(grade: AiGrade) {
	const sections = [
		grade.summary.trim(),
		listSection("What went well", grade.strengths),
		listSection("Issues", grade.issues),
		listSection("Suggestions", grade.suggestions),
	];

	return sections.filter(Boolean).join("\n\n");
}

function listSection(title: string, items: string[]) {
	const lines = items.map((item) => item.trim()).filter(Boolean);

	return lines.length === 0 ? "" : `${title}:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

export function GradePanel({ submission }: { submission: SubmissionRow }) {
	const { entries, grade } = useGrading();
	const [feedbackOpen, setFeedbackOpen] = useState(false);

	const submissionId = submission.id;
	const entry = entries[submissionId];
	const hasFeedback = submission.feedback !== null;

	if (!entry) return null;

	const result = entry.grade;

	return (
		<section
			className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4"
			aria-label="AI grade"
			aria-busy={entry.pending}
		>
			<header className="flex flex-wrap items-center gap-2">
				<HugeiconsIcon icon={AiMagicIcon} className="size-4 text-muted-foreground" />
				<h3 className="text-label">AI recommendation</h3>

				{result && (
					<>
						<Badge
							className={cn("tabular-nums", verdictStyles[result.verdict].className)}
						>
							{result.score} / {result.maxScore} pts
						</Badge>
						<Badge variant="secondary">{verdictStyles[result.verdict].label}</Badge>
					</>
				)}

				<Button
					variant="ghost"
					size="xs"
					className="ml-auto"
					disabled={entry.pending}
					onClick={() => grade(submissionId)}
				>
					{entry.pending ? (
						<>
							<HugeiconsIcon
								icon={Loading03Icon}
								className="animate-spin"
								data-icon="inline-start"
							/>
							Grading…
						</>
					) : result ? (
						"Regrade"
					) : (
						"Retry"
					)}
				</Button>
			</header>

			{entry.error && (
				<p className="text-body-sm text-destructive" role="alert">
					{entry.error}
				</p>
			)}

			{!result && entry.pending && (
				<p className="text-body-sm text-muted-foreground">
					Reviewing this submission against the challenge…
				</p>
			)}

			{result && (
				<>
					<p className="text-body-sm">{result.summary}</p>

					<GradeNotes title="Issues" items={result.issues} />
					<GradeNotes title="Suggestions" items={result.suggestions} />
					<GradeNotes title="Strengths" items={result.strengths} />

					<footer className="flex flex-wrap items-center gap-2">
						<p className="text-caption text-muted-foreground">
							AI feedback can be wrong. Review the code before relying on this grade.
						</p>

						<Button
							variant="outline"
							size="xs"
							className="ml-auto"
							disabled={entry.pending}
							onClick={() => setFeedbackOpen(true)}
						>
							<HugeiconsIcon icon={BubbleChatAddIcon} data-icon="inline-start" />
							{hasFeedback ? "Replace feedback" : "Send as feedback"}
						</Button>
					</footer>

					<FeedbackDialog
						submissionId={submissionId}
						title={`Feedback for ${submission.studentName}`}
						submitLabel={hasFeedback ? "Replace feedback" : "Send feedback"}
						initialFeedback={formatAiFeedback(result)}
						open={feedbackOpen}
						onOpenChange={setFeedbackOpen}
					/>
				</>
			)}
		</section>
	);
}

function GradeNotes({ title, items }: { title: string; items: string[] }) {
	if (items.length === 0) return null;

	return (
		<div className="flex flex-col gap-1">
			<h4 className="text-caption text-muted-foreground">{title}</h4>

			<ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm">
				{items.map((item, i) => (
					<li key={i}>{item}</li>
				))}
			</ul>
		</div>
	);
}
