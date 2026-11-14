"use client";

// test cases section of the challenge form
//11.13 - Haniah Ahmed - added the test case editor to the challenge form

import { Add01Icon, AiMagicIcon, Delete02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState, useTransition } from "react";
import { suggestTestCases } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGE_IDS, LANGUAGES, type LanguageId } from "@/lib/challenges/languages";
import { MAX_TEST_CASES, type TestCaseInput } from "@/lib/schemas";

// test case interface with an id for the editor to track them
interface TestCaseDraft extends TestCaseInput {
	id: number;
}

// code that they use to find the expected outputs
export interface SampleSolution {
	language: LanguageId;
	code: string;
}

export function TestCaseEditor({
	classId,
	initialTestCases = [],
	sample,
	onSampleChange,
	getDescription,
	error,
}: {
	classId: string;
	initialTestCases?: TestCaseInput[];
	sample: SampleSolution; // in the form, generate with ai can fill it in but not saved in the database
	onSampleChange: (sample: SampleSolution) => void;
	getDescription: () => string;
	error?: string;
}) {
	// positions for each of the test cases
	const [testCases, setTestCases] = useState<TestCaseDraft[]>(() =>
		initialTestCases.map((tc, i) => ({ id: i, ...tc })),
	);

	// making sure each has a unique id, editor tracking
	const nextId = useRef(initialTestCases.length);

	function newTestCase(fields: Partial<TestCaseInput> = {}): TestCaseDraft {
		return { id: nextId.current++, input: "", expectedOutput: "", hidden: false, ...fields };
	}

	function updateTestCase(id: number, changes: Partial<TestCaseInput>) {
		setTestCases((current) => current.map((tc) => (tc.id === id ? { ...tc, ...changes } : tc)));
	}

	function removeTestCase(id: number) {
		setTestCases((current) => current.filter((tc) => tc.id !== id));
	}

	function addTestCase() {
		setTestCases((current) => [...current, newTestCase({ hidden: current.length > 0 })]);
	}

	//generating the test cases with ai

	const [generating, startGenerating] = useTransition(); // keep true while the ai is generating
	const [aiError, setAiError] = useState<string | null>(null);

	function generate() {
		setAiError(null);

		startGenerating(async () => {
			//ai start generating, writing inputs
			const result = await suggestTestCases({
				classId: Number(classId),
				description: getDescription(),
				sampleSolution: sample.code,
				language: sample.language,
			});

			if (result.error || !result.testCases) {
				setAiError(result.error ?? "Something went wrong.");
				return;
			}

			const suggested = result.testCases;

			setTestCases((current) => {
				// keep any exisint test cases and add ai generate ones after it
				const kept = current.filter((tc) => tc.input.trim() || tc.expectedOutput.trim());
				const drafts = suggested.map((tc) => newTestCase({ ...tc, hidden: false }));

				return [...kept, ...drafts].slice(0, MAX_TEST_CASES);
			});
		});
	}

	return (
		<div className="flex flex-col gap-4 p-5 sm:p-6">
			{/* test case is trandported as a JSON string */}
			<input
				type="hidden"
				name="testCases"
				value={JSON.stringify(testCases.map(({ id: _id, ...tc }) => tc))}
			/>

			<p className="text-body-sm text-muted-foreground">
				Optional. Each test gives the input to the student&apos;s program (as stdin) and
				checks what it prints. Without test cases, the expected output above is used. Hidden
				tests are never shown to students.
			</p>

			{/* sample solution: only used to find outputs, the idea is to not save it */}
			<Field>
				<div className="flex items-center justify-between gap-3">
					<FieldLabel htmlFor="sample-solution">Sample solution</FieldLabel>

					<label>
						<span className="sr-only">Sample solution language</span>

						<select
							className="h-9 rounded-4xl border border-input bg-input/30 pr-8 pl-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
							value={sample.language}
							onChange={(e) =>
								onSampleChange({
									...sample,
									language: e.target.value as LanguageId,
								})
							}
						>
							{LANGUAGE_IDS.map((id) => (
								<option key={id} value={id}>
									{LANGUAGES[id].label}
								</option>
							))}
						</select>
					</label>
				</div>

				<Textarea
					className="min-h-24 font-mono"
					id="sample-solution"
					value={sample.code}
					onChange={(e) => onSampleChange({ ...sample, code: e.target.value })}
					placeholder={"a, b = map(int, input().split())\nprint(a + b)"}
					autoComplete="off"
					spellCheck={false}
				/>

				<FieldDescription>
					Used to generate test cases. Filled in for you by Generate with AI.
				</FieldDescription>
			</Field>

			<div className="flex flex-col gap-2">
				<Button
					type="button"
					variant="outline"
					className="w-fit"
					onClick={generate}
					disabled={generating || testCases.length >= MAX_TEST_CASES}
				>
					<HugeiconsIcon
						icon={generating ? Loading03Icon : AiMagicIcon}
						data-icon="inline-start"
					/>
					{generating ? "Generating" : "Generate test cases with AI"}
				</Button>

				{aiError && (
					<p role="alert" className="text-body-sm text-destructive">
						{aiError}
					</p>
				)}
			</div>

			<ol className="flex flex-col gap-4">
				{testCases.map((tc, index) => {
					const inputId = `test-${tc.id}-input`;
					const outputId = `test-${tc.id}-output`;
					const hiddenId = `test-${tc.id}-hidden`;

					return (
						<li
							key={tc.id}
							className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<h3 className="text-label">Test {index + 1}</h3>

								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label={`Remove test ${index + 1}`}
									onClick={() => removeTestCase(tc.id)}
								>
									<HugeiconsIcon icon={Delete02Icon} />
								</Button>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor={inputId}>Input</FieldLabel>

									<Textarea
										className="min-h-24 font-mono"
										id={inputId}
										value={tc.input}
										onChange={(e) =>
											updateTestCase(tc.id, { input: e.target.value })
										}
										placeholder={"3\n1 2 3"}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor={outputId}>Expected output</FieldLabel>

									<Textarea
										className="min-h-24 font-mono"
										id={outputId}
										value={tc.expectedOutput}
										onChange={(e) =>
											updateTestCase(tc.id, {
												expectedOutput: e.target.value,
											})
										}
										placeholder="6"
									/>
								</Field>
							</div>

							<Field orientation="horizontal">
								<Checkbox
									id={hiddenId}
									checked={tc.hidden}
									onCheckedChange={(checked) =>
										updateTestCase(tc.id, { hidden: checked })
									}
								/>

								<FieldLabel htmlFor={hiddenId}>Hidden from students</FieldLabel>
							</Field>
						</li>
					);
				})}
			</ol>

			{error && (
				<p role="alert" className="text-body-sm text-destructive">
					{error}
				</p>
			)}

			<Button
				type="button"
				variant="outline"
				className="w-fit"
				onClick={addTestCase}
				disabled={testCases.length >= MAX_TEST_CASES}
			>
				<HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
				Add test case
			</Button>
		</div>
	);
}
