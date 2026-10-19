"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as v from "valibot";
import { isRole, roleHome } from "@/lib/auth/roles";
import { SignInSchema, SignUpSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";

export interface AuthFormState<T> {
	error?: string;
	fieldErrors?: Partial<Record<"name" | "email" | "password" | "role", string>>;
	// Passwords are excluded so they're not sent to the client.
	values?: T;
}

export type SignInState = AuthFormState<{ email: string; remember: boolean }>;

export type SignUpState = AuthFormState<{ name: string; email: string; role: string }>;

export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
	const values = {
		email: formData.get("email")?.toString() ?? "",
		remember: formData.has("remember"),
	};

	const parsed = v.safeParse(SignInSchema, Object.fromEntries(formData));

	if (!parsed.success) {
		return {
			values,
			fieldErrors: toFieldErrors(v.flatten<typeof SignInSchema>(parsed.issues).nested ?? {}),
		};
	}

	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword(parsed.output);

	if (error) {
		return { values, error: error.message };
	}

	const role = data.user.user_metadata?.role;

	redirect(roleHome(isRole(role) ? role : null));
}

export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
	const values = {
		name: formData.get("name")?.toString() ?? "",
		email: formData.get("email")?.toString() ?? "",
		role: formData.get("role")?.toString() ?? "",
	};

	const parsed = v.safeParse(SignUpSchema, Object.fromEntries(formData));

	if (!parsed.success) {
		return {
			values,
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
		return { values, error: error.message };
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
		{ redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/reset-password` },
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
