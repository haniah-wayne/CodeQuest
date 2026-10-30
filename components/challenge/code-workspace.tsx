"use client";

import {
	CancelCircleIcon,
	CheckmarkCircle02Icon,
	CommandLineIcon,
	PlayIcon,
	SentIcon,
	SourceCodeIcon,
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
import { Panel, PanelHeader, PanelIcon, PanelSurface } from "@/components/ui/panel";
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
			<Panel aria-labelledby="solution-heading">
				<PanelHeader>
					<PanelIcon icon={SourceCodeIcon} />

					<h2 className="text-label" id="solution-heading">
						Your solution
					</h2>

					<label className="ml-auto">
						<span className="sr-only">Language</span>

						<select
							className="h-9 rounded-4xl border border-input bg-card pr-8 pl-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
							value={language}
							onChange={(e) => setLanguage(e.target.value as LanguageId)}
							disabled={pending}
						>
							{LANGUAGE_IDS.map((id) => (
								<option key={id} value={id}>
									{LANGUAGES[id].label}
								</option>
							))}
						</select>
					</label>
				</PanelHeader>

				{/* clip, not hidden, so the editor's sticky symbol bar still sticks */}
				<PanelSurface className="overflow-clip">
					<CodeEditor
						language={language}
						value={code}
						onChange={(value) => setDrafts((d) => ({ ...d, [language]: value }))}
					/>
				</PanelSurface>

				<footer className="flex items-center justify-end gap-2 p-1">
					<Button
						variant="outline"
						size="lg"
						className="flex-1 bg-card sm:flex-none"
						onClick={() => run("run")}
						disabled={pending}
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
			</Panel>

			<div ref={outputRef} className="scroll-mt-24" role="status" aria-live="polite">
				{pending ? (
					<OutputShell
						title={pendingKind === "submit" ? "Checking your solution" : "Running"}
					>
						<PanelSurface className="flex flex-col gap-2 p-5" aria-hidden>
							<span className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
							<span className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
						</PanelSurface>
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
				<PanelSurface className="overflow-clip">
					<pre className="max-h-96 overflow-auto px-5 py-4 font-mono text-sm leading-6 wrap-break-word whitespace-pre-wrap">
						{result.output || (
							<span className="text-muted-foreground italic">No output</span>
						)}
					</pre>
				</PanelSurface>
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
		<Panel>
			<PanelHeader>
				<PanelIcon icon={CommandLineIcon} />

				<h2 className="text-label">{title}</h2>

				{meta && (
					<span className="ml-auto text-caption text-destructive tabular-nums">
						{meta}
					</span>
				)}
			</PanelHeader>

			{children}
		</Panel>
	);
}

function Verdict({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
	return (
		<p
			className={cn(
				"flex items-start gap-2 rounded-(--panel-radius) bg-card px-5 py-3 text-body-sm smooth-shadow-ring-sm",
				tone === "success"
					? "text-wsu-green smooth-ring-wsu-green/35"
					: "text-destructive smooth-ring-destructive/35",
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
