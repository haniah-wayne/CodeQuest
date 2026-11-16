import { type Schema, ThinkingLevel, Type } from "@google/genai";
import * as v from "valibot";
import { generateJson } from "@/lib/ai/gemini";
import type { LanguageId } from "@/lib/challenges/languages";
import { MAX_POINTS, MIN_POINTS } from "@/lib/schemas";
import { CHALLENGE_SYSTEM_PROMPT } from "./prompts";
import { runTestInputs, type SuggestedTestCase } from "./test-cases";

export interface GeneratedChallenge {
	title: string;
	description: string;
	points: number;
	testCases: SuggestedTestCase[];
	reference: { language: LanguageId; code: string };
}

export interface GenerationInput {
	request: string;
	className: string;
}

//structured output schema
const RESPONSE_SCHEMA: Schema = {
	type: Type.OBJECT,
	properties: {
		title: {
			type: Type.STRING,
			description: "Short challenge name.",
		},
		description: {
			type: Type.STRING,
			description: "Problem statement shown to students.",
		},
		points: {
			type: Type.INTEGER,
			description: `Suggested points, from ${MIN_POINTS} to ${MAX_POINTS}.`,
		},
		referenceSolution: {
			type: Type.STRING,
			description: "Complete Python 3 program that reads stdin and prints the answer.",
		},
		testInputs: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: "Text passed to the program on stdin, one string per test case.",
		},
	},
	required: ["title", "description", "points", "referenceSolution", "testInputs"],
};

//the schema to validate the model's output against
const ModelChallengeSchema = v.object({
	title: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	description: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	points: v.number(),
	referenceSolution: v.pipe(v.string(), v.nonEmpty()),
	testInputs: v.pipe(v.array(v.string()), v.minLength(1)),
});

const MAX_ATTEMPTS = 2;

// Python is the fastest to sample
const REFERENCE_LANGUAGE: LanguageId = "python";

export class GenerationError extends Error {}

export async function generateChallenge(input: GenerationInput): Promise<GeneratedChallenge> {
	const contents = [
		{
			role: "user",
			parts: [
				{
					text: JSON.stringify({
						class: input.className,
						request: input.request,
					}),
				},
			],
		},
	];

	//try to get a working reference solution from the model
	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		const text = await generateJson({
			systemInstruction: CHALLENGE_SYSTEM_PROMPT,
			schema: RESPONSE_SCHEMA,
			contents,
			thinkingLevel: ThinkingLevel.LOW,
		});

		//parse the model's output and validate it against the schema
		const draft = v.parse(ModelChallengeSchema, JSON.parse(text));

		//run the reference solution on every test input to get the expected outputs
		const { testCases, failures } = await runTestInputs(
			REFERENCE_LANGUAGE,
			draft.referenceSolution,
			draft.testInputs,
		);

		// Every input should work, but settle for the ones that did on the last try
		if (testCases.length > 0 && (failures.length === 0 || attempt === MAX_ATTEMPTS)) {
			return {
				title: draft.title,
				description: draft.description,
				points: Math.min(Math.max(Math.round(draft.points), MIN_POINTS), MAX_POINTS),
				testCases,
				reference: {
					language: REFERENCE_LANGUAGE,
					code: draft.referenceSolution,
				},
			};
		}

		console.error(`Reference solution failed (attempt ${attempt}):`, failures);

		const [failure] = failures;

		//show the model what went wrong so the retry can fix it
		contents.push(
			{
				role: "model",
				parts: [{ text }],
			},
			{
				role: "user",
				parts: [
					{
						text: `The reference solution failed on ${
							failures.length
						} of ${failures.length + testCases.length} test inputs. For the input:\n${failure.input.slice(0, 500)}\nit ${
							failure.problem === "Printed nothing"
								? "printed nothing"
								: `failed: ${failure.problem}\n${failure.output.slice(0, 2000)}`
						}\nReturn the whole challenge again with a reference solution that reads stdin and works on every test input.`,
					},
				],
			},
		);
	}

	throw new GenerationError("The reference solution never ran successfully on the test inputs");
}
