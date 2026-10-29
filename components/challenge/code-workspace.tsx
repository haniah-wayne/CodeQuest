"use client";

import {
	CancelCircleIcon,
	CheckmarkCircle02Icon,
	CommandLineIcon,
	PlayIcon,
	SentIcon,
	SourceCodeIcon,
	SquareLock02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";
import { useEffect, useRef, useState, useTransition } from "react";
import {
	runCode,
	type SubmitSolutionState,
	submitSolution,
} from "@/app/dashboard/classes/[classId]/challenges/[challengeId]/actions";
import { CodeEditor } from "@/components/challenge/code-editor";
import { Button } from "@/components/ui/button";
import { LANGUAGE_IDS, LANGUAGES, type LanguageId } from "@/lib/challenges/languages";

type Outcome = SubmitSolutionState & { kind: "run" | "submit" };

export function CodeWorkspace({
	challengeId,
	initialLanguage,
	initialCode,
	solved,
}: {
	challengeId: number;
	initialLanguage: LanguageId;
	initialCode: string | null;
	solved: boolean;
}) {
	const [language, setLanguage] = useState(initialLanguage);

	// Save drafts for each language so switching back and forth doesn't delete
	// work
	const [drafts, setDrafts] = useState(() => {
		const starters = Object.fromEntries(
			LANGUAGE_IDS.map((id) => [id, LANGUAGES[id].starter]),
		) as Record<LanguageId, string>;

		return initialCode ? { ...starters, [initialLanguage]: initialCode } : starters;
	});

	const [outcome, setOutcome] = useState<Outcome | null>(null);
	const [pendingKind, setPendingKind] = useState<Outcome["kind"] | null>(null);

	const [pending, startTransition] = useTransition();

	const outputRef = useRef<HTMLDivElement>(null);

	const code = drafts[language];
	const isSolved = solved || (outcome?.kind === "submit" && outcome.correct === true);

	// Locked once solved, and while a submission is being graded so the code
	// left in the editor is exactly what was submitted
	const locked = isSolved || (pending && pendingKind === "submit");

	function run(kind: Outcome["kind"]) {
		setPendingKind(kind);

		startTransition(async () => {
			try {
				const state =
					kind === "run"
						? await runCode({ language, code })
						: await submitSolution({ challengeId, language, code });

				setOutcome({ ...state, kind });
			} catch (error) {
				console.error(error);

				setOutcome({
					kind,
					error: "Something went wrong. Check your connection and try again.",
				});
			}
		});
	}

	useEffect(() => {
		if (outcome) {
			outputRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
		}
	}, [outcome]);

	return (
		<div className="flex min-w-0 flex-col gap-4">
			<section
				className="flex min-w-0 flex-col rounded-3xl border border-accent bg-white"
				aria-labelledby="solution-heading"
			>
				<header className="flex items-center gap-3 border-b border-border/60 px-5 py-3 sm:px-6">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-wsu-green">
						<HugeiconsIcon icon={SourceCodeIcon} className="size-4.5" />
					</span>

					<h2 className="text-label" id="solution-heading">
						Your solution
					</h2>

					{isSolved && (
						<span className="flex items-center gap-1 text-caption text-muted-foreground">
							<HugeiconsIcon icon={SquareLock02Icon} className="size-3.5" />
							Read-only
						</span>
					)}

					<label className="ml-auto">
						<span className="sr-only">Language</span>

						<select
							className="h-9 rounded-4xl border border-input bg-input/30 pr-8 pl-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
							value={language}
							onChange={(e) => setLanguage(e.target.value as LanguageId)}
							disabled={pending || isSolved}
						>
							{LANGUAGE_IDS.map((id) => (
								<option key={id} value={id}>
									{LANGUAGES[id].label}
								</option>
							))}
						</select>
					</label>
				</header>

				<CodeEditor
					language={language}
					value={code}
					onChange={(value) => setDrafts((d) => ({ ...d, [language]: value }))}
					readOnly={locked}
				/>

				<footer className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-3 sm:px-5">
					<Button
						variant="outline"
						size="lg"
						className="flex-1 sm:flex-none"
						onClick={() => run("run")}
						disabled={pending || isSolved}
					>
						<HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
						{pending && pendingKind === "run" ? "Running" : "Run"}
					</Button>

					<Button
						size="lg"
						className="flex-1 sm:flex-none"
						onClick={() => run("submit")}
						disabled={pending || isSolved}
					>
						<HugeiconsIcon
							icon={isSolved ? CheckmarkCircle02Icon : SentIcon}
							data-icon="inline-start"
						/>
						{isSolved
							? "Solved"
							: pending && pendingKind === "submit"
								? "Submitting"
								: "Submit"}
					</Button>
				</footer>
			</section>

			<div ref={outputRef} className="scroll-mt-24" role="status" aria-live="polite">
				{pending ? (
					<OutputShell
						title={pendingKind === "submit" ? "Checking your solution" : "Running"}
					>
						<div className="flex flex-col gap-2 p-5 sm:px-6" aria-hidden>
							<span className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
							<span className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
						</div>
					</OutputShell>
				) : outcome ? (
					<OutputPanel outcome={outcome} />
				) : null}
			</div>
		</div>
	);
}

function OutputPanel({ outcome }: { outcome: Outcome }) {
	const { result, error, kind, correct, points } = outcome;

	return (
		<OutputShell title={result?.failed ? "Compiler output" : "Output"} meta={result?.problem}>
			{kind === "submit" && correct !== undefined && (
				<Verdict tone={correct ? "success" : "error"}>
					{correct
						? points
							? `Correct! You earned ${points} ${points === 1 ? "point" : "points"}.`
							: "Correct!"
						: result?.problem
							? "Your program didn’t finish cleanly, so it wasn’t graded as correct."
							: "Not quite. Your output didn’t match what this challenge expects."}
				</Verdict>
			)}

			{error && <Verdict tone="error">{error}</Verdict>}

			{result && (
				<pre className="max-h-96 overflow-auto px-5 py-4 font-mono text-sm leading-6 wrap-break-word whitespace-pre-wrap sm:px-6">
					{result.output || (
						<span className="text-muted-foreground italic">No output</span>
					)}
				</pre>
			)}
		</OutputShell>
	);
}

function OutputShell({
	title,
	meta,
	children,
}: {
	title: string;
	meta?: string | null;
	children: React.ReactNode;
}) {
	return (
		<section className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-accent bg-white">
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-3 sm:px-6">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-wsu-green">
					<HugeiconsIcon icon={CommandLineIcon} className="size-4.5" />
				</span>

				<h2 className="text-label">{title}</h2>

				{meta && (
					<span className="ml-auto text-caption text-destructive tabular-nums">
						{meta}
					</span>
				)}
			</header>

			{children}
		</section>
	);
}

function Verdict({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
	return (
		<p
			className={cn(
				"flex items-start gap-2 border-b border-border/60 px-5 py-3 text-body-sm sm:px-6",
				tone === "success"
					? "bg-emerald-50 text-wsu-green"
					: "bg-destructive/10 text-destructive",
			)}
		>
			<HugeiconsIcon
				icon={tone === "success" ? CheckmarkCircle02Icon : CancelCircleIcon}
				className="mt-0.5 size-4 shrink-0"
			/>
			{children}
		</p>
	);
}
