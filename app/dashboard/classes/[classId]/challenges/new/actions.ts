"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import { CreateChallengeSchema } from "@/lib/challenges/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

export interface CreateChallengeState {
	error?: string;
	fieldErrors?: Partial<Record<"title" | "description" | "solution", string>>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { title: string; description: string; solution: string };
}

export async function createChallenge(
	_prevState: CreateChallengeState,
	formData: FormData,
): Promise<CreateChallengeState> {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		solution: formData.get("solution")?.toString() ?? "",
	};

	const classId = Number(formData.get("classId"));

	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create challenges." };
	}

	if (!Number.isSafeInteger(classId)) {
		return { values, error: "That class doesn't exist." };
	}

	const parsed = v.safeParse(CreateChallengeSchema, values);

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof CreateChallengeSchema>(parsed.issues).nested ?? {},
			),
		};
	}

	const supabase = await createClient();

	// The class ID comes from the form, so confirm this professor owns it
	const { data: classInfo } = await supabase
		.from("Classes")
		.select("ProfessorID")
		.eq("ClassID", classId)
		.maybeSingle();

	if (classInfo?.ProfessorID !== user.id) {
		return { values, error: "You don't have permission to add challenges to this class." };
	}

	const { title, description, solution } = parsed.output;

	const { data: challenge, error: challengeError } = await supabase
		.from("Challenges")
		.insert({ ClassID: classId, Title: title, Description: description })
		.select("ChallengeID")
		.single();

	if (challengeError) {
		console.error(challengeError);

		return { values, error: "Something went wrong saving that challenge." };
	}

	const { data: question, error: questionError } = await supabase
		.from("Questions")
		.insert({
			ChallengeID: challenge.ChallengeID,
			QuestionText: description,
			QuestionType: "short_answer",
		})
		.select("QuestionID")
		.single();

	const { error: answerError } = question
		? await supabase
				.from("AnswerChoices")
				.insert({ QuestionID: question.QuestionID, AnswerText: solution, IsCorrect: true })
		: { error: null };

	if (questionError || answerError) {
		console.error(questionError ?? answerError);

		if (question) {
			await supabase.from("Questions").delete().eq("QuestionID", question.QuestionID);
		}

		await supabase.from("Challenges").delete().eq("ChallengeID", challenge.ChallengeID);

		return { values, error: "Something went wrong saving that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	redirect(`/dashboard/classes/${classId}`);
}
