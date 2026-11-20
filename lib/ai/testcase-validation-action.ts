"use server";

import { validateTestCase } from "@/lib/ai/testcase-validation";

export async function checkTestCaseWithAI(
  title: string,
  description: string,
  input: string,
  expectedOutput: string,
) {
  return await validateTestCase(
    title,
    description,
    input,
    expectedOutput,
  );
}