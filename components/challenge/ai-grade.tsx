"use client";

import { AiMagicIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Row } from "@tanstack/react-table";
import { cn } from "cn";
import { createContext, use, useState } from "react";
import type * as React from "react";
import { gradeSubmission } from "@/app/dashboard/classes/[classId]/challenges/[challengeId]/actions";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import type { DataTableFeatures } from "@/components/class/data-table";
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

function useGrading() {
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

const verdictStyles: Record<AiVerdict, { label: string; className: string }> = {
	correct: {
		label: "Correct",
		className: "bg-secondary text-wsu-green",
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

export function GradeCell({ row }: { row: Row<DataTableFeatures, SubmissionRow> }) {
	const { entries, grade } = useGrading();
	const { id, code, studentName } = row.original;
	const entry = entries[id];

	if (!code) {
		return <span className="text-muted-foreground">—</span>;
	}

	if (entry?.pending) {
		return (
			<Button variant="outline" size="xs" disabled>
				<HugeiconsIcon
					icon={Loading03Icon}
					className="animate-spin"
					data-icon="inline-start"
				/>
				Grading…
			</Button>
		);
	}

	if (entry?.grade) {
		const { score, maxScore, verdict } = entry.grade;

		return (
			<Button
				variant="ghost"
				size="xs"
				className={cn("tabular-nums", verdictStyles[verdict].className)}
				aria-label={`AI recommends ${score} of ${maxScore} points for ${studentName}. ${row.getIsExpanded() ? "Hide" : "Show"} details`}
				onClick={row.getToggleExpandedHandler()}
			>
				{score} / {maxScore}
			</Button>
		);
	}

	return (
		<Button
			variant="outline"
			size="xs"
			aria-label={`Grade ${studentName}'s submission with AI`}
			onClick={() => {
				row.toggleExpanded(true);
				grade(id);
			}}
		>
			<HugeiconsIcon icon={AiMagicIcon} data-icon="inline-start" />
			{entry?.error ? "Retry" : "Grade"}
		</Button>
	);
}

export function GradePanel({ submissionId }: { submissionId: number }) {
	const { entries, grade } = useGrading();
	const entry = entries[submissionId];

	if (!entry) return null;

	const result = entry.grade;

	return (
		<section
			className="flex flex-col gap-3 rounded-(--panel-inner-radius) bg-card p-4 smooth-shadow-ring-sm"
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

					<p className="text-caption text-muted-foreground">
						AI feedback can be wrong. Review the code before relying on this grade.
					</p>
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
