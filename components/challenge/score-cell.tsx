"use client";

import { useId, useRef, useState, useTransition } from "react";
import { overrideSubmissionScore } from "@/app/dashboard/classes/[classId]/challenges/[challengeId]/actions";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScoreCell({ submission }: { submission: SubmissionRow }) {
	const { id, score, maxScore, studentName } = submission;

	const errorId = useId();
	const [editing, setEditing] = useState(false);
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();
	// Shown until the refreshed row arrives from the server
	const [saved, setSaved] = useState<number | null>(null);
	// Removing a focused input can fire blur, so ignore it once the edit has ended
	const closing = useRef(false);

	const shown = pending && saved !== null ? saved : score;

	function startEditing() {
		closing.current = false;
		setEditing(true);
	}

	function cancel() {
		closing.current = true;
		setEditing(false);
		setError(undefined);
	}

	function save(raw: string) {
		if (closing.current) return;

		const value = raw.trim() === "" ? NaN : Number(raw);

		if (value === score) {
			return cancel();
		}

		if (!Number.isInteger(value) || value < 0 || value > maxScore) {
			setError(`Enter a whole number from 0 to ${maxScore}.`);
			return;
		}

		closing.current = true;
		setEditing(false);
		setError(undefined);
		setSaved(value);

		startTransition(async () => {
			try {
				const result = await overrideSubmissionScore({
					submissionId: id,
					score: value,
				});

				if (result.error) setError(result.error);
			} catch (error) {
				console.error(error);

				setError("Something went wrong. Check your connection and try again.");
			}
		});
	}

	if (editing) {
		return (
			<span className="flex flex-col gap-1">
				<span className="flex items-center gap-1.5 tabular-nums">
					<Input
						type="number"
						inputMode="numeric"
						min={0}
						max={maxScore}
						step={1}
						defaultValue={score ?? ""}
						className="h-7 w-16 px-2"
						aria-label={`Points for ${studentName}`}
						aria-invalid={Boolean(error) || undefined}
						aria-describedby={error ? errorId : undefined}
						autoFocus
						onFocus={(e) => e.currentTarget.select()}
						onBlur={(e) => save(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								save(e.currentTarget.value);
							} else if (e.key === "Escape") {
								e.preventDefault();
								cancel();
							}
						}}
					/>
					<span className="text-muted-foreground">/ {maxScore}</span>
				</span>

				{error && (
					<span id={errorId} role="alert" className="text-caption text-destructive">
						{error}
					</span>
				)}
			</span>
		);
	}

	return (
		<span className="flex flex-col items-start gap-1">
			<Button
				variant="ghost"
				size="xs"
				className="-mx-2.5 tabular-nums"
				disabled={pending}
				aria-label={`${shown ?? "No"} points for ${studentName}. Change points`}
				title="Change points"
				onClick={startEditing}
			>
				{shown ?? "—"}
				<span className="text-muted-foreground">/ {maxScore}</span>
			</Button>

			{error && (
				<span role="alert" className="text-caption text-destructive">
					{error}
				</span>
			)}
		</span>
	);
}
