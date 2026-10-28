"use server";

import { revalidatePath } from "next/cache";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import type { LanguageId } from "@/lib/challenges/languages";
import { RunCodeSchema, SubmitSolutionSchema } from "@/lib/challenges/schemas";
import { type ExecutionResult, execute } from "@/lib/piston";
import { createClient } from "@/lib/supabase/server";

export interface RunCodeState {
	error?: string;
	result?: ExecutionResult;
}

export interface SubmitSolutionState extends RunCodeState {
	correct?: boolean;
	points?: number;
}

const RUNNER_DOWN = "The code runner isn't responding. Try again in a moment.";

// Ignore whitespace differences
function normalize(output: string) {
	return output
		.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n")
		.trimEnd();
}

export async function runCode(input: {
	language: LanguageId;
	code: string;
}): Promise<RunCodeState> {
	const user = await getSessionUser();

	if (!user) {
		return { error: "Sign in to run code." };
	}

	const parsed = v.safeParse(RunCodeSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { language, code } = parsed.output;

	try {
		return { result: await execute(language, code) };
	} catch (error) {
		console.error(error);

		return { error: RUNNER_DOWN };
	}
}

export async function submitSolution(input: {
	challengeId: number;
	language: LanguageId;
	code: string;
}): Promise<SubmitSolutionState> {
	const user = await getSessionUser();

	if (user?.role !== "student") {
		return { error: "Only students can submit solutions." };
	}

	const parsed = v.safeParse(SubmitSolutionSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { challengeId, language, code } = parsed.output;

	const supabase = await createClient();

	const [challengeResult, solvedResult] = await Promise.all([
		supabase
			.from("Challenges")
			.select("ClassID, Points, Solutions(Solution)")
			.eq("ChallengeID", challengeId)
			.maybeSingle(),
		supabase
			.from("Submission")
			.select("SubmissionID")
			.eq("ChallengeID", challengeId)
			.eq("StudentID", user.id)
			.eq("Status", "correct")
			.limit(1),
	]);

	const challenge = challengeResult.data;

	if (!challenge) {
		if (challengeResult.error) {
			console.error(challengeResult.error);
		}

		return { error: "That challenge doesn't exist." };
	}

	if (solvedResult.data?.length) {
		return { error: "You've already solved this challenge." };
	}

	const expected = challenge.Solutions?.Solution;

	if (expected === undefined) {
		console.error(`Challenge ${challengeId} has no solution to grade against`);

		return { error: "This challenge isn't ready for submissions yet." };
	}

	let result: ExecutionResult;

	try {
		result = await execute(language, code);
	} catch (error) {
		console.error(error);

		return { error: RUNNER_DOWN };
	}

	const correct = result.problem === null && normalize(result.stdout) === normalize(expected);
	const points = correct ? challenge.Points : 0;

	const { error: insertError } = await supabase.from("Submission").insert({
		ChallengeID: challengeId,
		StudentID: user.id,
		Code: code,
		Language: language,
		Output: result.output,
		Score: points,
		Status: correct ? "correct" : "incorrect",
	});

	if (insertError) {
		console.error(insertError);

		return { result, error: "Your code ran, but we couldn't save your submission." };
	}

	revalidatePath(`/dashboard/classes/${challenge.ClassID}`);
	revalidatePath(`/dashboard/classes/${challenge.ClassID}/challenges/${challengeId}`);

	return { result, correct, points };
}
