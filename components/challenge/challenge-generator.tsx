"use client";

import { AiMagicIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { generateChallenge } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
import { CodeEditor } from "@/components/challenge/code-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedChallenge } from "@/lib/ai/challenge";
import { LANGUAGES } from "@/lib/challenges/languages";
import { MAX_GENERATION_REQUEST_LENGTH } from "@/lib/schemas";

export function ChallengeGenerator({
	classId,
	onApply,
}: {
	classId: string;
	onApply: (challenge: GeneratedChallenge) => void;
}) {
	const [request, setRequest] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [draft, setDraft] = useState<GeneratedChallenge | null>(null);
	const [pending, startTransition] = useTransition();

	function generate() {
		if (pending || !request.trim()) return;

		startTransition(async () => {
			try {
				const state = await generateChallenge({ classId: Number(classId), request });

				setError(state.error ?? null);

				if (state.challenge) {
					setDraft(state.challenge);
				}
			} catch (error) {
				console.error(error);
				setError("Something went wrong. Check your connection and try again.");
			}
		});
	}

	return (
		<section
			className="flex min-w-0 flex-col rounded-3xl border border-accent bg-white"
			aria-labelledby="challenge-generator"
			aria-busy={pending}
		>
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-wsu-green">
					<HugeiconsIcon icon={AiMagicIcon} className="size-4.5" />
				</span>

				<h2 className="text-label" id="challenge-generator">
					Generate with AI
				</h2>
			</header>

			<div className="flex flex-col gap-4 p-5 sm:p-6">
				<div className="flex flex-col gap-2">
					<label className="text-label" htmlFor="generator-request">
						What should the challenge be about?
					</label>

					<Textarea
						className="min-h-20"
						id="generator-request"
						placeholder="A warm-up on nested loops that prints a small multiplication table"
						value={request}
						maxLength={MAX_GENERATION_REQUEST_LENGTH}
						onChange={(e) => setRequest(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								generate();
							}
						}}
						aria-describedby="generator-hint"
					/>

					<p id="generator-hint" className="text-caption text-muted-foreground">
						Mention the topic, difficulty, or style. You can review the draft and its
						test cases before they fill in the form.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button
						type="button"
						variant={draft ? "outline" : "default"}
						disabled={pending || !request.trim()}
						onClick={generate}
					>
						<HugeiconsIcon
							icon={pending ? Loading03Icon : AiMagicIcon}
							className={pending ? "animate-spin" : undefined}
							data-icon="inline-start"
						/>
						{pending ? "Generating…" : draft ? "Regenerate" : "Generate"}
					</Button>

					{error && (
						<p className="text-body-sm text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>

				{draft && <DraftPreview draft={draft} />}

				{draft && (
					<Button
						className="self-start"
						type="button"
						disabled={pending}
						onClick={() => onApply(draft)}
					>
						Use this challenge
					</Button>
				)}
			</div>
		</section>
	);
}

function DraftPreview({ draft }: { draft: GeneratedChallenge }) {
	return (
		<article className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
			<header className="flex flex-wrap items-center gap-2">
				<h3 className="text-label">{draft.title}</h3>

				<Badge className="bg-emerald-50 text-wsu-green tabular-nums">
					{draft.points} pts
				</Badge>
			</header>

			<p className="text-body-sm whitespace-pre-wrap">{draft.description}</p>

			<div className="flex flex-col gap-1.5">
				<h4 className="text-caption text-muted-foreground">
					Test cases ({draft.testCases.length})
				</h4>

				<ol className="flex max-h-80 flex-col gap-2 overflow-auto">
					{draft.testCases.map((tc, index) => (
						<li key={index} className="grid gap-2 sm:grid-cols-2">
							{[
								["Input", tc.input],
								["Output", tc.expectedOutput],
							].map(([label, value]) => (
								<div key={label} className="flex min-w-0 flex-col gap-1">
									<span className="text-caption text-muted-foreground">
										{label} {index + 1}
									</span>

									<pre className="m-0 max-h-40 overflow-auto rounded-xl border border-border/60 bg-background p-3 font-mono text-sm leading-6">
										{value || (
											<span className="text-muted-foreground italic">
												(empty)
											</span>
										)}
									</pre>
								</div>
							))}
						</li>
					))}
				</ol>
			</div>

			<details className="group flex flex-col gap-1.5">
				<summary className="cursor-pointer text-caption text-muted-foreground">
					Reference solution ({LANGUAGES[draft.reference.language].label})
				</summary>

				<div className="mt-1.5 overflow-hidden rounded-xl border border-border/60 bg-background">
					<CodeEditor
						language={draft.reference.language}
						value={draft.reference.code}
						onChange={() => {}}
						readOnly
					/>
				</div>
			</details>
		</article>
	);
}
