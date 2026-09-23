"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { isRole, roleHome } from "@/lib/auth/roles";
import { SignInSchema, SignUpSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
	error?: string;
	fieldErrors?: Partial<Record<"name" | "email" | "password" | "role", string>>;
}

function toFieldErrors(
	nested: Partial<Record<string, [string, ...string[]]>>,
): NonNullable<AuthFormState["fieldErrors"]> {
	return Object.fromEntries(
		Object.entries(nested).flatMap(([field, messages]) =>
			messages?.[0] ? [[field, messages[0]]] : [],
		),
	);
}

export async function signIn(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const parsed = v.safeParse(SignInSchema, Object.fromEntries(formData));

	if (!parsed.success) {
		return {
			fieldErrors: toFieldErrors(v.flatten<typeof SignInSchema>(parsed.issues).nested ?? {}),
		};
	}

	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword(parsed.output);

	if (error) {
		return { error: error.message };
	}

	const role = data.user.user_metadata?.role;

	redirect(roleHome(isRole(role) ? role : null));
}

export async function signUp(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	const parsed = v.safeParse(SignUpSchema, Object.fromEntries(formData));

	if (!parsed.success) {
		return {
			fieldErrors: toFieldErrors(v.flatten<typeof SignUpSchema>(parsed.issues).nested ?? {}),
		};
	}

	const { name, email, password, role } = parsed.output;

	const supabase = await createClient();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				name,
				role,
			},
		},
	});

	if (error) {
		return { error: error.message };
	}

	redirect(roleHome(role));
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();

	revalidatePath("/", "layout");
	redirect("/sign-in");
}

export async function sendResetPasswordEmail(prevState: unknown, formData: FormData) {
	//calls server functiona to send the email, parameter of state and data
	const supabase = await createClient(); //new client

	const { error } = await supabase.auth.resetPasswordForEmail(
		//the form data being sent is email as a string
		formData.get("email") as string,
	);

	if (error) {
		//return object describing error
		return { success: "", error: error.message };
	}

	return { success: "Please check your email", error: "" };
}

export async function updatePassword(prevState: unknown, formData: FormData) {
	//same thing as above but this time formdata is password
	const supabase = await createClient();

	const { error } = await supabase.auth.updateUser({
		password: formData.get("password") as string,
	});

	if (error) {
		return { success: "", error: error.message };
	}

	return { success: "Password updated", error: "" };
}
