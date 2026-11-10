import { type ResponseSchema, SchemaType } from "@google/generative-ai";
import * as v from "valibot";
import { getGeminiModel } from "@/lib/ai/gemini";
import { isLanguageId, LANGUAGES } from "@/lib/challenges/languages";

export const AI_VERDICTS = ["correct", "partially_correct", "incorrect"] as const;

export type AiVerdict = (typeof AI_VERDICTS)[number];

export interface AiGrade {
	verdict: AiVerdict;
	score: number;
	maxScore: number;
	summary: string;
	strengths: string[];
	issues: string[];
	suggestions: string[];
}

interface Challenge {
	title: string;
	description: string | null;
	points: number;
	expectedOutput: string | null;
}

interface TestCase {
	input: string | null;
	expectedOutput: string | null;
	points: number | null;
}

interface Submission {
	language: string | null;
	code: string;
	output: string | null;
	// The automatic output comparison done at submit time
	autoStatus: string | null;
}

export interface GradingInput {
	challenge: Challenge;
	testCases: TestCase[];
	submission: Submission;
}

const SYSTEM_PROMPT = `TODO`;

const RESPONSE_SCHEMA: ResponseSchema = {
	type: SchemaType.OBJECT,
	properties: {
		verdict: {
			type: SchemaType.STRING,
			format: "enum",
			enum: [...AI_VERDICTS],
			description: "Overall judgment of the submission.",
		},
		score: {
			type: SchemaType.INTEGER,
			description: "Recommended points, from 0 to the challenge's maximum points.",
		},
		summary: {
			type: SchemaType.STRING,
			description: "One or two sentence overview of the assessment.",
		},
		strengths: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: "What the submission does well.",
		},
		issues: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: "Bugs or ways the submission fails the problem.",
		},
		suggestions: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: "Hints for improving the submission without giving away the answer.",
		},
	},
	required: ["verdict", "score", "summary", "strengths", "issues", "suggestions"],
};

// Structured output is constrained by the schema but still check it before
// trusting it
const ModelGradeSchema = v.object({
	verdict: v.picklist(AI_VERDICTS),
	score: v.number(),
	summary: v.string(),
	strengths: v.array(v.string()),
	issues: v.array(v.string()),
	suggestions: v.array(v.string()),
});

export async function requestAiGrade(input: GradingInput): Promise<AiGrade> {
	const model = getGeminiModel({
		systemInstruction: SYSTEM_PROMPT,
		generationConfig: {
			responseMimeType: "application/json",
			responseSchema: RESPONSE_SCHEMA,
		},
	});

	const { language } = input.submission;

	const payload = {
		...input,
		submission: {
			...input.submission,
			language: isLanguageId(language) ? LANGUAGES[language].label : language,
		},
	};

	const result = await model.generateContent(JSON.stringify(payload, null, 2));
	const parsed = v.parse(ModelGradeSchema, JSON.parse(result.response.text()));
	const maxScore = input.challenge.points;

	return {
		...parsed,
		score: Math.min(Math.max(Math.round(parsed.score), 0), maxScore),
		maxScore,
	};
}
