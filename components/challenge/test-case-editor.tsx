"use client";

// test cases section of the challenge form
//11.13 - Haniah Ahmed - added the test case editor to the challenge form

import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEST_CASES, type TestCaseInput } from "@/lib/schemas";

// test case interface with an id for the editor to track them
export interface TestCaseDraft extends TestCaseInput {
	id: string;
}

export function toInitialTestCaseDrafts(testCases: TestCaseInput[] = []): TestCaseDraft[] {
	return testCases.map((tc, i) => ({ id: `initial-${i}`, ...tc }));
}

let nextId = 0;

export function toTestCaseDrafts(testCases: Partial<TestCaseInput>[]): TestCaseDraft[] {
	return testCases.map((tc) => ({
		id: `new-${nextId++}`,
		input: "",
		expectedOutput: "",
		...tc,
	}));
}

export function TestCaseEditor({
	testCases,
	onTestCasesChange: setTestCases,
	error,
}: {
	testCases: TestCaseDraft[];
	onTestCasesChange: (update: (current: TestCaseDraft[]) => TestCaseDraft[]) => void;
	error?: string;
}) {
	function updateTestCase(id: string, changes: Partial<TestCaseInput>) {
		setTestCases((current) => current.map((tc) => (tc.id === id ? { ...tc, ...changes } : tc)));
	}

	function removeTestCase(id: string) {
		setTestCases((current) => current.filter((tc) => tc.id !== id));
	}

	function addTestCase() {
		setTestCases((current) => [...current, ...toTestCaseDrafts([{}])]);
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
				Each test passes its input to the student&apos;s program on stdin and checks what it
				prints. A solution has to pass every test. Students will see the first test as an
				example.
			</p>

			<ol className="flex flex-col gap-4">
				{testCases.map((tc, index) => {
					const inputId = `test-${tc.id}-input`;
					const outputId = `test-${tc.id}-output`;

					return (
						<li
							key={tc.id}
							className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<h3 className="text-label">
									Test {index + 1}
									{index === 0 && (
										<span className="font-normal text-muted-foreground">
											{" "}
											· Shown to students
										</span>
									)}
								</h3>

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
