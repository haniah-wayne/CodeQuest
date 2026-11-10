import { type ResponseSchema, SchemaType } from "@google/generative-ai";
import * as v from "valibot";
import { getGeminiModel } from "@/lib/ai/gemini";
import { LANGUAGE_IDS, LANGUAGES, type LanguageId } from "@/lib/challenges/languages";
import { execute } from "@/lib/piston";
import { MAX_POINTS, MIN_POINTS } from "@/lib/schemas.js";
import { CHALLENGE_SYSTEM_PROMPT } from "./prompts.js";

export interface GeneratedChallenge {
	title: string;
	description: string;
	points: number;
	expectedOutput: string;
	reference: { language: LanguageId; code: string };
}

export interface GenerationInput {
	request: string;
	className: string;
}

//structured output schema
const RESPONSE_SCHEMA: ResponseSchema = {
	type: SchemaType.OBJECT,
	properties: {
		title: {
			type: SchemaType.STRING,
			description: "Short challenge name.",
		},
		description: {
			type: SchemaType.STRING,
			description: "Problem statement shown to students.",
		},
		points: {
			type: SchemaType.INTEGER,
			description: `Suggested points, from ${MIN_POINTS} to ${MAX_POINTS}.`,
		},
		referenceLanguage: {
			type: SchemaType.STRING,
			format: "enum",
			enum: [...LANGUAGE_IDS],
			description: "Language of the reference solution.",
		},
		referenceSolution: {
			type: SchemaType.STRING,
			description: "Complete program that prints the expected output.",
		},
	},
	required: ["title", "description", "points", "referenceLanguage", "referenceSolution"],
};

//the schema to validate the model's output against
const ModelChallengeSchema = v.object({
	title: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	description: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	points: v.number(),
	referenceLanguage: v.picklist(LANGUAGE_IDS),
	referenceSolution: v.pipe(v.string(), v.nonEmpty()),
});

const MAX_ATTEMPTS = 2;

export class GenerationError extends Error {}

export async function generateChallenge(input: GenerationInput): Promise<GeneratedChallenge> {
	const model = getGeminiModel({
		systemInstruction: CHALLENGE_SYSTEM_PROMPT,
		generationConfig: {
			responseMimeType: "application/json",
			responseSchema: RESPONSE_SCHEMA,
		},
	});

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
		const result = await model.generateContent({ contents });

		//parse the model's output and validate it against the schema
		const text = result.response.text();
		const draft = v.parse(ModelChallengeSchema, JSON.parse(text));

		//execute the reference solution to see if it works
		const run = await execute(draft.referenceLanguage, draft.referenceSolution);
		const expectedOutput = run.stdout.trimEnd();

		//if it worked
		if (run.problem === null && expectedOutput !== "") {
			return {
				title: draft.title,
				description: draft.description,
				points: Math.min(Math.max(Math.round(draft.points), MIN_POINTS), MAX_POINTS),
				expectedOutput,
				reference: {
					language: draft.referenceLanguage,
					code: draft.referenceSolution,
				},
			};
		}

		console.error(`Reference solution failed (attempt ${attempt}):`, run.problem, run.output);

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
						text: `The ${LANGUAGES[draft.referenceLanguage].label} reference solution ${
							run.problem
								? `failed: ${run.problem}\n${run.output.slice(0, 2000)}`
								: "printed nothing"
						}\nReturn the whole challenge again with a working reference solution.`,
					},
				],
			},
		);
	}

	throw new GenerationError("The reference solution never ran successfully");
}
