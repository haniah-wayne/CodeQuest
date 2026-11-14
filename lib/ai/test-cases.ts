//11.12 - Haniah Ahmed - making the test cases file
//test cases files, runnign the reference solution on each ai generated input

import type { LanguageId } from "@/lib/challenges/languages";
import { executeAll } from "@/lib/piston";
import { MAX_TEST_CASES } from "@/lib/schemas";

export interface SuggestedTestCase {
	input: string;
	expectedOutput: string;
}

export interface FailedTestInput {
	input: string;
	problem: string;
	output: string;
}

export async function runTestInputs(
	language: LanguageId,
	code: string,
	rawInputs: string[],
): Promise<{ testCases: SuggestedTestCase[]; failures: FailedTestInput[] }> {
	// drop any duplicates as a safety measure
	const inputs = [...new Set(rawInputs)].slice(0, MAX_TEST_CASES);

	const runs = await executeAll(language, code, inputs);

	//keeping only the cleanly run inputs - clean as in it acutally works
	const testCases: SuggestedTestCase[] = [];
	const failures: FailedTestInput[] = [];

	inputs.forEach((stdin, i) => {
		const run = runs[i];

		if (run.problem === null && run.stdout.trim() !== "") {
			testCases.push({ input: stdin, expectedOutput: run.stdout.trimEnd() });
		} else {
			failures.push({
				input: stdin,
				problem: run.problem ?? "Printed nothing",
				output: run.output,
			});
		}
	});

	return { testCases, failures };
}
