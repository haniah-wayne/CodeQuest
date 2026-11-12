"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import {
	type GeneratedChallenge,
	GenerationError,
	generateChallenge as requestGeneratedChallenge,
} from "@/lib/ai/challenge";
import { getSessionUser } from "@/lib/auth/session";
import { CreateChallengeSchema, GenerateChallengeSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

export interface ChallengeFormState {
	error?: string;
	fieldErrors?: Partial<
		Record<
			"title" | "description" | "solution" | "points" | "longitude" | "latitude" | "radius",
			string
		>
	>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { title: string; description: string; solution: string; points: string };
}

function readForm(formData: FormData) {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		solution: formData.get("solution")?.toString() ?? "",
		points: formData.get("points")?.toString() ?? "",
	};

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
		radius: formData.get("radius")?.toString() ?? "",
		hidden: formData.has("hidden"),
	};

	return { values, parsed: v.safeParse(CreateChallengeSchema, { ...values, ...location }) };
}

export async function createChallenge(
	_prevState: ChallengeFormState,
	formData: FormData,
): Promise<ChallengeFormState> {
	const { values, parsed } = readForm(formData);
	const classId = Number(formData.get("classId"));

	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create challenges." };
	}

	if (!Number.isSafeInteger(classId)) {
		return { values, error: "That class doesn't exist." };
	}

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

	const { title, description, solution, points, longitude, latitude, radius, hidden } =
		parsed.output;

	const { error } = await supabase.rpc("create_challenge", {
		class_id: classId,
		title,
		description,
		solution,
		points,
		long: longitude,
		lat: latitude,
		radius,
		hidden,
	});

	if (error) {
		console.error(error);

		return { values, error: "Something went wrong saving that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	redirect(`/dashboard/classes/${classId}`);
}

export interface GenerateChallengeState {
	error?: string;
	challenge?: GeneratedChallenge;
}

export async function generateChallenge(input: {
	classId: number;
	request: string;
}): Promise<GenerateChallengeState> {
	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { error: "Only professors can generate challenges." };
	}

	const parsed = v.safeParse(GenerateChallengeSchema, input);

	if (!parsed.success) {
		return { error: parsed.issues[0].message };
	}

	const { classId, request } = parsed.output;

	const supabase = await createClient();

	const { data: classInfo } = await supabase
		.from("Classes")
		.select("ClassName, ProfessorID")
		.eq("ClassID", classId)
		.maybeSingle();

	if (classInfo?.ProfessorID !== user.id) {
		return { error: "You don't have permission to add challenges to this class." };
	}

	try {
		return {
			challenge: await requestGeneratedChallenge({ request, className: classInfo.ClassName }),
		};
	} catch (error) {
		console.error(error);

		return {
			error:
				error instanceof GenerationError
					? "The AI couldn't write a challenge with a working solution. Try rewording your request."
					: "The AI couldn't generate a challenge right now. Try again in a moment.",
		};
	}
}

export async function updateChallenge(
	_prevState: ChallengeFormState,
	formData: FormData,
): Promise<ChallengeFormState> {
	const { values, parsed } = readForm(formData);
	const classId = Number(formData.get("classId"));
	const challengeId = Number(formData.get("challengeId"));

	// The IDs come from the form, so confirm this professor owns the challenge
	if (!(await professorOwnsChallenge(classId, challengeId))) {
		return { values, error: "You don't have permission to edit this challenge." };
	}

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof CreateChallengeSchema>(parsed.issues).nested ?? {},
			),
		};
	}

	const { title, description, solution, points, longitude, latitude, radius, hidden } =
		parsed.output;

	const supabase = await createClient();

	// Updates the challenge, solution, and location in one transaction
	const { error } = await supabase.rpc("update_challenge", {
		challenge_id: challengeId,
		class_id: classId,
		title,
		description,
		solution,
		points,
		long: longitude,
		lat: latitude,
		radius,
		hidden,
	});

	if (error) {
		console.error(error);

		return { values, error: "Something went wrong saving your changes." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	revalidatePath(`/dashboard/classes/${classId}/challenges/${challengeId}`);
	redirect(`/dashboard/classes/${classId}`);
}

export async function deleteChallenge(
	_prevState: { error?: string },
	formData: FormData,
): Promise<{ error?: string }> {
	const classId = Number(formData.get("classId"));
	const challengeId = Number(formData.get("challengeId"));

	if (!(await professorOwnsChallenge(classId, challengeId))) {
		return { error: "You don't have permission to delete this challenge." };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Challenges")
		.delete()
		.eq("ChallengeID", challengeId)
		.select("ChallengeID");

	if (error || !data?.length) {
		console.error(error);

		return { error: "Something went wrong deleting that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);

	return {};
}

// 10.30.Haniah added a function to check if the professor owns the challenge
async function professorOwnsChallenge(classId: number, challengeId: number) {
	const user = await getSessionUser();

	if (user?.role !== "professor") return false;
	if (!Number.isSafeInteger(classId) || !Number.isSafeInteger(challengeId)) return false;

	const supabase = await createClient();

	const { data: challenge, error } = await supabase
		.from("Challenges")
		.select("Classes(ProfessorID)")
		.eq("ChallengeID", challengeId)
		.eq("ClassID", classId)
		.maybeSingle();

	if (error) console.error(error);

	return challenge?.Classes.ProfessorID === user.id;
}
