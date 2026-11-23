import { Type, type Schema } from "@google/genai";
import { generateJson } from "@/lib/ai/gemini";
import { TEST_CASE_VALIDATION_PROMPT } from "@/lib/ai/prompts";

export async function validateTestCase(
	title: string,
	description: string,
	input: string,
	expectedOutput: string,
) {
	const contents = JSON.stringify({
		title,
		description,
		input,
		expectedOutput,
	});
	const result = await generateJson({
		systemInstruction: TEST_CASE_VALIDATION_PROMPT,
		schema,
		contents,
	});
	return JSON.parse(result) as {
		valid: boolean;
		message: string;
	};
}

const schema: Schema = {
	type: Type.OBJECT,
	properties: {
		valid: { type: Type.BOOLEAN },
		message: { type: Type.STRING },
	},
	required: ["valid", "message"],
};
