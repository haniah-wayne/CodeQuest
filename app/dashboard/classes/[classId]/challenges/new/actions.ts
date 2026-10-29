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
		Record<"title" | "description" | "solution" | "longitude" | "latitude" | "radius", string>
	>;
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

	const location = {
		longitude: formData.get("longitude")?.toString() ?? "",
		latitude: formData.get("latitude")?.toString() ?? "",
		radius: formData.get("radius")?.toString() ?? "",
		hidden: formData.has("hidden"),
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

	const { title, description, solution, longitude, latitude, radius, hidden } = parsed.output;

	const { error } = await supabase.rpc("create_challenge", {
		class_id: classId,
		title,
		description,
		solution,
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
