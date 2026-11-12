import { type Schema, Type } from "@google/genai";
import * as v from "valibot";
import { generateJson } from "@/lib/ai/gemini";
import { isLanguageId, LANGUAGES } from "@/lib/challenges/languages";
import { GRADING_SYSTEM_PROMPT } from "./prompts";

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

const RESPONSE_SCHEMA: Schema = {
	type: Type.OBJECT,
	properties: {
		verdict: {
			type: Type.STRING,
			enum: [...AI_VERDICTS],
			description: "Overall judgment of the submission.",
		},
		score: {
			type: Type.INTEGER,
			description: "Recommended points, from 0 to the challenge's maximum points.",
		},
		summary: {
			type: Type.STRING,
			description: "One or two sentence overview of the assessment.",
		},
		strengths: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: "What the submission does well.",
		},
		issues: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: "Bugs or ways the submission fails the problem.",
		},
		suggestions: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
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
	const { language } = input.submission;

	const payload = {
		...input,
		submission: {
			...input.submission,
			language: isLanguageId(language) ? LANGUAGES[language].label : language,
		},
	};

	const text = await generateJson({
		systemInstruction: GRADING_SYSTEM_PROMPT,
		schema: RESPONSE_SCHEMA,
		contents: JSON.stringify(payload, null, 2),
	});

	const parsed = v.parse(ModelGradeSchema, JSON.parse(text));
	const maxScore = input.challenge.points;

	return {
		...parsed,
		score: Math.min(Math.max(Math.round(parsed.score), 0), maxScore),
		maxScore,
	};
}
