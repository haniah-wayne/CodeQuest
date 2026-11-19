import { generateJson } from "@/lib/ai/gemini";
import type { Schema } from "@google/genai";
import { TESTCASE_VALIDATION_PROMPT } from "@/lib/ai/prompts";

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
    systemInstruction:TESTCASE_VALIDATION_PROMPT,
    schema,
    contents,
  });
  return JSON.parse(result) as {
    valid: boolean;
    message: string;
  };
}

const schema = {
  type: "OBJECT",
  properties: {
    valid: { type: "BOOLEAN" },
    message: { type: "STRING" },
  },
  required: ["valid", "message"],
};
