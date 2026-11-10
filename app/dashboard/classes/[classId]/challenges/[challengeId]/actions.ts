"use server";

import { revalidatePath } from "next/cache";
import * as v from "valibot";
import { type AiGrade, requestAiGrade } from "@/lib/ai/grading";
import { getSessionUser } from "@/lib/auth/session";
import type { LanguageId } from "@/lib/challenges/languages";
import { isWithinUnlockRadius, type Position } from "@/lib/challenges/location";
import { type ExecutionResult, execute } from "@/lib/piston";
import { GradeSubmissionSchema, RunCodeSchema, SubmitSolutionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export interface RunCodeState {
	error?: string;
	result?: ExecutionResult;
}

export interface SubmitSolutionState extends RunCodeState {
	correct?: boolean;
	points?: number;
	// Set when a correct submission already exists, e.g. from another tab
	alreadySolved?: boolean;
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
	position: Position;
}): Promise<SubmitSolutionState> {
	const user = await getSessionUser();

	if (user?.role !== "student") {
		return { error: "Only students can submit solutions." };
	}

	const parsed = v.safeParse(SubmitSolutionSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { challengeId, language, code, position } = parsed.output;

	const supabase = await createClient();

	const [challengeResult, solvedResult] = await Promise.all([
		supabase
			.from("Challenges")
			.select("ClassID, Points, Solutions(Solution), Locations(Longitude, Latitude, Radius)")
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
		// This page may have been rendered before the solve so refresh it
		revalidatePath(`/dashboard/classes/${challenge.ClassID}`);
		revalidatePath(`/dashboard/classes/${challenge.ClassID}/challenges/${challengeId}`);

		return { error: "You've already solved this challenge.", alreadySolved: true };
	}

	// Checked against where the student is now, not where they opened the page
	if (!isWithinUnlockRadius(challenge.Locations, position)) {
		return {
			error: "You need to be at the challenge location to submit. Head back and try again.",
		};
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

export interface GradeSubmissionState {
	error?: string;
	grade?: AiGrade;
}

export async function gradeSubmission(input: {
	submissionId: number;
}): Promise<GradeSubmissionState> {
	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { error: "Only professors can grade submissions." };
	}

	const parsed = v.safeParse(GradeSubmissionSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { submissionId } = parsed.output;

	const supabase = await createClient();

	const { data: submission, error } = await supabase
		.from("Submission")
		.select(
			"ChallengeID, Code, Language, Output, Status, Challenges(Title, Description, Points, Classes(ProfessorID), Solutions(Solution))",
		)
		.eq("SubmissionID", submissionId)
		.maybeSingle();

	if (error) console.error(error);

	// RLS may let other professors read the row, so check ownership here too
	if (!submission || submission.Challenges.Classes.ProfessorID !== user.id) {
		return { error: "That submission doesn't exist." };
	}

	if (!submission.Code?.trim()) {
		return { error: "This submission has no code to grade." };
	}

	const { data: testCases, error: testCaseError } = await supabase
		.from("TestCase")
		.select("Input, ExpectedOutput, Score")
		.eq("ChallengeID", submission.ChallengeID);

	// Test cases are optional extra context, so grade without them on failure
	if (testCaseError) console.error(testCaseError);

	const challenge = submission.Challenges;

	try {
		const grade = await requestAiGrade({
			challenge: {
				title: challenge.Title,
				description: challenge.Description,
				points: challenge.Points,
				expectedOutput: challenge.Solutions?.Solution ?? null,
			},
			testCases: (testCases ?? []).map((t) => ({
				input: t.Input,
				expectedOutput: t.ExpectedOutput,
				points: t.Score,
			})),
			submission: {
				language: submission.Language,
				code: submission.Code,
				output: submission.Output,
				autoStatus: submission.Status,
			},
		});

		return { grade };
	} catch (error) {
		console.error(error);

		return { error: "The AI grader couldn't grade this submission. Try again in a moment." };
	}
}
