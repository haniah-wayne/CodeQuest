"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import { CreateClassSchema } from "@/lib/classes/schemas";
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
		color: `#${randomBytes(3).toString("hex")}`,
		ClassCode: randomBytes(5).toString("hex"),
	});

	if (error) {
		console.error(error);

		return { values, error: "Couldn't create the class. Try again." };
	}

	revalidatePath("/dashboard");

	return { success: true };
}
