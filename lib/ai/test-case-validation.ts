import { type Schema, Type } from "@google/genai";
import * as v from "valibot";
import { generateJson } from "@/lib/ai/gemini";
import type { TestCaseInput } from "@/lib/schemas";
import { TEST_CASE_VALIDATION_PROMPT } from "./prompts";

export interface TestCaseValidation {
	valid: boolean;
	message: string;
}

export interface TestCaseValidationInput {
	challenge: { title: string; description: string };
	testCase: TestCaseInput;
}

const RESPONSE_SCHEMA: Schema = {
	type: Type.OBJECT,
	properties: {
		valid: {
			type: Type.BOOLEAN,
			description:
				"Whether the input follows the description and the expected output is correct.",
		},
		message: {
			type: Type.STRING,
			description: "One to three short sentences for the professor explaining the result.",
		},
	},
	required: ["valid", "message"],
};

const ModelValidationSchema = v.object({
	valid: v.boolean(),
	message: v.string(),
});

export async function requestTestCaseValidation({
	challenge,
	testCase,
}: TestCaseValidationInput): Promise<TestCaseValidation> {
	const payload = {
		title: challenge.title,
		description: challenge.description,
		input: testCase.input,
		expectedOutput: testCase.expectedOutput,
	};

	const text = await generateJson({
		systemInstruction: TEST_CASE_VALIDATION_PROMPT,
		schema: RESPONSE_SCHEMA,
		contents: JSON.stringify(payload, null, 2),
	});

	return v.parse(ModelValidationSchema, JSON.parse(text));
}
