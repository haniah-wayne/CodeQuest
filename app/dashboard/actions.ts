"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as v from "valibot";
import { getSessionUser } from "@/lib/auth/session";
import { ClassSchema, JoinClassSchema } from "@/lib/classes/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

export interface ClassFormState {
	error?: string;
	fieldErrors?: Partial<Record<"name" | "description", string>>;
	// Sent back on failure so the form doesn't clear what was typed
	values?: { name: string; description: string };
	success?: boolean;
}

function readClassForm(formData: FormData) {
	const values = {
		name: formData.get("name")?.toString() ?? "",
		description: formData.get("description")?.toString() ?? "",
	};

	const parsed = v.safeParse(ClassSchema, values);

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(v.flatten<typeof ClassSchema>(parsed.issues).nested ?? {}),
		} as const;
	}

	return { values, output: parsed.output } as const;
}

function readClassId(formData: FormData) {
	const id = Number(formData.get("classId"));

	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function createClass(
	_prevState: ClassFormState,
	formData: FormData,
): Promise<ClassFormState> {
	const form = readClassForm(formData);
	const { values } = form;

	// RLS only checks ProfessorID = auth.uid(), so students must be stopped here
	const user = await getSessionUser();

	if (user?.role !== "professor") {
		return { values, error: "Only professors can create classes." };
	}

	if (!form.output) {
		return { values, fieldErrors: form.fieldErrors };
	}

	const supabase = await createClient();

	const { error } = await supabase.from("Classes").insert({
		ProfessorID: user.id,
		ClassName: form.output.name,
		Description: form.output.description,
		ClassCode: randomBytes(5).toString("hex"),
	});

	if (error) {
		console.error(error);

		return { values, error: "Couldn't create the class. Try again." };
	}

	revalidatePath("/dashboard");

	return { success: true };
}

export async function updateClass(
	_prevState: ClassFormState,
	formData: FormData,
): Promise<ClassFormState> {
	const form = readClassForm(formData);
	const { values } = form;
	const classId = readClassId(formData);

	const user = await getSessionUser();

	if (user?.role !== "professor" || classId === null) {
		return { values, error: "You don't have permission to edit this class." };
	}

	if (!form.output) {
		return { values, fieldErrors: form.fieldErrors };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Classes")
		.update({ ClassName: form.output.name, Description: form.output.description })
		.eq("ClassID", classId)
		.eq("ProfessorID", user.id)
		.select("ClassID");

	if (error || !data?.length) {
		console.error(error ?? `Class ${classId} not updated for ${user.id}`);

		return { values, error: "Couldn't save the class. Try again." };
	}

	revalidatePath("/dashboard");
	revalidatePath(`/dashboard/classes/${classId}`);

	return { success: true };
}

export interface DeleteClassState {
	error?: string;
	success?: boolean;
}

export async function deleteClass(
	_prevState: DeleteClassState,
	formData: FormData,
): Promise<DeleteClassState> {
	const classId = readClassId(formData);
	const user = await getSessionUser();

	if (user?.role !== "professor" || classId === null) {
		return { error: "You don't have permission to delete this class." };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Classes")
		.delete()
		.eq("ClassID", classId)
		.eq("ProfessorID", user.id)
		.select("ClassID");

	if (error || !data?.length) {
		console.error(error ?? `Class ${classId} not deleted for ${user.id}`);

		return { error: "Couldn't delete the class. Try again." };
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
