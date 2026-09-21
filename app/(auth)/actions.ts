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
