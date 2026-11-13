//11.12 - Haniah Ahmed - making the test cases file
//test cases files, runnign the instructors sample solution on each ai generated input

// Test cases: AI-suggested test inputs, with expected outputs worked out by
// running the professor's sample solution on each one

import { type Schema, Type } from "@google/genai";
import * as v from "valibot";
import { generateJson } from "@/lib/ai/gemini";
import { LANGUAGES, type LanguageId } from "@/lib/challenges/languages";
import { execute } from "@/lib/piston";
import { MAX_TEST_CASES } from "@/lib/schemas";
import { TEST_CASE_PROMPT } from "./prompts";

export interface SuggestedTestCase {
	input: string;
	expectedOutput: string;
}

export interface TestCaseSuggestions {
	testCases: SuggestedTestCase[];
	skipped: number; // number of inputs that didn't run cleanly on the sample solution
}

// forces gemini to only return the inputs
const RESPONSE_SCHEMA: Schema = {
	type: Type.OBJECT,
	properties: {
		inputs: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: "Text passed to the program on stdin, one string per test case.",
		},
	},
	required: ["inputs"],
};

// The schema above constrains the reply, but check it before trusting it
const ModelInputsSchema = v.object({
	inputs: v.array(v.string()),
});

export class TestCaseError extends Error {}

export async function suggestTestCases(input: {
	description: string;
	sampleSolution: string;
	language: LanguageId;
}): Promise<TestCaseSuggestions> {
	// only ask gemini for the inputs
	const text = await generateJson({
		systemInstruction: TEST_CASE_PROMPT,
		schema: RESPONSE_SCHEMA,
		contents: JSON.stringify({
			problem: input.description,
			sampleSolution: {
				language: LANGUAGES[input.language].label,
				code: input.sampleSolution,
			},
		}),
	});

	const { inputs: rawInputs } = v.parse(ModelInputsSchema, JSON.parse(text));

	// drop any duplicates as a safety measure
	const inputs = [...new Set(rawInputs)].slice(0, MAX_TEST_CASES);

	// run all the inputs on the smampl solution at the same time
	const runs = await Promise.all(
		inputs.map((stdin) => execute(input.language, input.sampleSolution, stdin)),
	);

	//keeping only the cleanly run inputs - clean as in it acutally works
	const testCases = inputs.flatMap((stdin, i) => {
		const run = runs[i];

		return run.problem === null && run.stdout.trim() !== ""
			? [{ input: stdin, expectedOutput: run.stdout.trimEnd() }]
			: [];
	});

	//if none work, send an error message
	if (testCases.length === 0) {
		throw new TestCaseError("The sample solution didn't run cleanly on any suggested input");
	}

	return { testCases, skipped: inputs.length - testCases.length }; //fixed error with skip value
}
