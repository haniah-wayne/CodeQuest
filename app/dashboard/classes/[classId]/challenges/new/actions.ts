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
	fieldErrors?: Partial<
		Record<"title" | "description" | "solution" | "points" | "longitude" | "latitude", string>
	>;
<<<<<<< HEAD
	// Sent back on failure so the form doesn't clear what was typed - 10/29.Haniah -> added the hidden bool
	values?: {
		title: string;
		description: string;
		solution: string;
		points: string;
		hidden: boolean;
	};
=======
	// Sent back on failure so the form doesn't clear what was typed
	values?: { title: string; description: string; solution: string; points: string };
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab
}

export async function createChallenge(
	_prevState: CreateChallengeState,
	formData: FormData,
): Promise<CreateChallengeState> {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		solution: formData.get("solution")?.toString() ?? "",
		points: formData.get("points")?.toString() ?? "",
<<<<<<< HEAD
		hidden: formData.get("hidden") === "true", //10.29.Haniah -> added the hidden bool, reads from form
=======
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab
	};

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
	};

	const classId = Number(formData.get("classId"));

	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create challenges." };
	}

	if (!Number.isSafeInteger(classId)) {
		return { values, error: "That class doesn't exist." };
	}

	const parsed = v.safeParse(CreateChallengeSchema, { ...values, ...location });

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

<<<<<<< HEAD
	const { title, description, solution, points, longitude, latitude, hidden } = parsed.output;
=======
	const { title, description, solution, points, longitude, latitude } = parsed.output;
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab

	const { error } = await supabase.rpc("create_challenge", {
		class_id: classId,
		title,
		description,
		solution,
		points,
		long: longitude,
		lat: latitude,
		radius: 100,
<<<<<<< HEAD
		hidden,
=======
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab
	});

	if (error) {
		console.error(error);

		return { values, error: "Something went wrong saving that challenge." };
	}

	revalidatePath(`/dashboard/classes/${classId}`);
	redirect(`/dashboard/classes/${classId}`);
}

<<<<<<< HEAD
export async function updateChallenge(
	_prevState: CreateChallengeState,
	formData: FormData,
): Promise<CreateChallengeState> {
	const values = {
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
		solution: formData.get("solution")?.toString() ?? "",
		points: formData.get("points")?.toString() ?? "",
		hidden: formData.get("hidden") === "true",
	};

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
	};

	const classId = Number(formData.get("classId"));
	const challengeId = Number(formData.get("challengeId"));

	// The IDs come from the form, so confirm this professor owns the challenge
	if (!(await professorOwnsChallenge(classId, challengeId))) {
		return { values, error: "You don't have permission to edit this challenge." };
	}

	const parsed = v.safeParse(CreateChallengeSchema, { ...values, ...location });

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof CreateChallengeSchema>(parsed.issues).nested ?? {},
			),
		};
	}

	const { title, description, solution, points, longitude, latitude, hidden } = parsed.output;

	const supabase = await createClient();

	const { error } = await supabase.rpc("update_challenge", {
		challenge_id: challengeId,
		title,
		description,
		solution,
		points,
		long: longitude,
		lat: latitude,
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
=======
//10.30 - functionality in updating any challenge
export async function updateChallenge() {
	//confirm challenge class and instructor
	//get all the already stored information
}

//export async function deleteChallenge() {
//confirm challenge class and instructor
//delete challnege from database
//}
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab

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

<<<<<<< HEAD
// 10.30.Haniah added a function to check if the professor owns the challenge
=======
// 10.30.Haniah - added a function to check if the professor owns the challenge before deleting it
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab
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
