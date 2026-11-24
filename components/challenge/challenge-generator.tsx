"use client";

import { AiMagicIcon, Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { generateChallenge } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
import { CodeEditor } from "@/components/challenge/code-editor";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, PanelIcon, PanelSurface } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import type { GeneratedChallenge } from "@/lib/ai/challenge";
import { LANGUAGES } from "@/lib/challenges/languages";
import { MAX_GENERATION_REQUEST_LENGTH } from "@/lib/challenges/schemas";

export function ChallengeGenerator({
	classId,
	onGenerate,
	onClear,
}: {
	classId: string;
	onGenerate: (challenge: GeneratedChallenge) => void;
	onClear: () => void;
}) {
	const [request, setRequest] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [generated, setGenerated] = useState<GeneratedChallenge | null>(null);
	const [pending, startTransition] = useTransition();

	function generate() {
		if (pending || !request.trim()) return;

		startTransition(async () => {
			try {
				const state = await generateChallenge({ classId: Number(classId), request });

				setError(state.error ?? null);

				if (state.challenge) {
					setGenerated(state.challenge);
					onGenerate(state.challenge);
				}
			} catch (error) {
				console.error(error);
				setError("Something went wrong. Check your connection and try again.");
			}
		});
	}

	function clear() {
		setRequest("");
		setError(null);
		setGenerated(null);
		onClear();
	}

	return (
		<Panel aria-labelledby="challenge-generator" aria-busy={pending}>
			<PanelHeader>
				<PanelIcon icon={AiMagicIcon} />

				<h2 className="text-label" id="challenge-generator">
					Generate with AI
				</h2>
			</PanelHeader>

			<PanelSurface className="flex flex-col gap-4 p-5 sm:p-6">
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
						Mention the topic, difficulty, or style. The details and test cases fill in
						below so you can edit them before creating the challenge.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button
						type="button"
						variant={generated ? "outline" : "default"}
						disabled={pending || !request.trim()}
						onClick={generate}
					>
						<HugeiconsIcon
							icon={pending ? Loading03Icon : AiMagicIcon}
							className={pending ? "animate-spin" : undefined}
							data-icon="inline-start"
						/>
						{pending ? "Generating…" : generated ? "Regenerate" : "Generate"}
					</Button>

					<Button type="button" variant="ghost" disabled={pending} onClick={clear}>
						<HugeiconsIcon icon={Cancel01Icon} data-icon="inline-start" />
						Clear
					</Button>

					{error && (
						<p className="text-body-sm text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>

				<p className="sr-only" role="status">
					{generated
						? `Filled in “${generated.title}” with ${generated.testCases.length} test cases.`
						: ""}
				</p>

				{generated && <ReferenceSolution reference={generated.reference} />}
			</PanelSurface>
		</Panel>
	);
}

function ReferenceSolution({ reference }: { reference: GeneratedChallenge["reference"] }) {
	return (
		<details className="flex flex-col gap-1.5">
			<summary className="cursor-pointer text-caption text-muted-foreground">
				Reference solution ({LANGUAGES[reference.language].label})
			</summary>

			<div className="mt-1.5 overflow-hidden rounded-xl bg-card smooth-shadow-ring-sm">
				<CodeEditor
					language={reference.language}
					value={reference.code}
					onChange={() => {}}
					readOnly
				/>
			</div>
		</details>
	);
}
