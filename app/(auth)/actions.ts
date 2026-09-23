"use server";

export interface AuthFormState {
	error?: string;
	fieldErrors?: Partial<Record<"name" | "email" | "password" | "role", string>>;
}

export async function signIn(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	// TODO
	return {} as never;
}

export async function signUp(
	_prevState: AuthFormState,
	formData: FormData,
): Promise<AuthFormState> {
	// TODO
	return {} as never;
}

import { redirect } from "next/navigation";
//functionality for the forget and reset password forms
import { createClient } from "@/lib/supabase/client";

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
