"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import { CreateClassSchema, JoinClassSchema } from "@/lib/classes/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

export interface CreateClassState {
	error?: string;
	fieldErrors?: Partial<Record<"name" | "description", string>>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { name: string; description: string };
	success?: boolean;
}

export async function createClass(
	_prevState: CreateClassState,
	formData: FormData,
): Promise<CreateClassState> {
	const values = {
		name: formData.get("name")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
	};

	// RLS only checks ProfessorID = auth.uid(), so students must be stopped here
	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create classes." };
	}

	const parsed = v.safeParse(CreateClassSchema, values);

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof CreateClassSchema>(parsed.issues).nested ?? {},
			),
		};
	}

	const supabase = await createClient();

	const { error } = await supabase.from("Classes").insert({
		ProfessorID: user.id,
		ClassName: parsed.output.name,
		Description: parsed.output.description,
		ClassCode: randomBytes(5).toString("hex"),
	});

	if (error) {
		console.error(error);

		return { values, error: "Couldn't create the class. Try again." };
	}

	revalidatePath("/dashboard");

	return { success: true };
}

export interface JoinClassState {
	error?: string;
	fieldErrors?: Partial<Record<"code", string>>;
	values?: { code: string };
	success?: boolean;
}

export async function joinClass(
	_prevState: JoinClassState,
	formData: FormData,
): Promise<JoinClassState> {
	const values = { code: formData.get("code")?.toString() ?? "" };

	const user = await getSessionUser();

	if (user?.role !== "student") {
		return { values, error: "Only students can join classes." };
	}

	const parsed = v.safeParse(JoinClassSchema, values);

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(
				v.flatten<typeof JoinClassSchema>(parsed.issues).nested ?? {},
			),
		};
	}

	const supabase = await createClient();

	const { data, error } = await supabase.rpc("join_class_by_code", {
		class_code: parsed.output.code,
	});

	if (error || data !== "joined") {
		console.error(error ?? data);

		return {
			values,
			fieldErrors: {
				code: "No class matches that code.",
			},
		};
	}

	revalidatePath("/dashboard");

	return { success: true };
}
