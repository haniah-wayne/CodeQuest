"use client";

import { useActionState } from "react";
import { signIn } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignInForm({ initialError }: { initialError?: string }) {
	const [state, action, pending] = useActionState(signIn, {});

	const error = state.error ?? initialError;

	return (
		<AuthCard
			title="Welcome back"
			description="Sign in to pick up your quests where you left off."
			altPrompt="New here?"
			altLabel="Create an account"
			altHref="/sign-up"
		>
			<form action={action}>
				<FieldGroup>
					{error && <AuthFormError>{error}</AuthFormError>}

					<Field data-invalid={Boolean(state.fieldErrors?.email) || undefined}>
						<FieldLabel className="text-label" htmlFor="email">
							Email
						</FieldLabel>

						<Input
							className="h-11"
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="you@wayne.edu"
							required
							aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
						/>

						<FieldError>{state.fieldErrors?.email}</FieldError>
					</Field>

					<Field data-invalid={Boolean(state.fieldErrors?.password) || undefined}>
						<FieldLabel className="text-label" htmlFor="password">
							Password
						</FieldLabel>

						<Input
							className="h-11"
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
						/>

						<FieldError>{state.fieldErrors?.password}</FieldError>
					</Field>

					<Field orientation="horizontal">
						<FieldLabel className="text-label" htmlFor="remember">
							<Checkbox id="remember" name="remember" />
							Remember me
						</FieldLabel>

						<ForgotPasswordDialog />
					</Field>

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Signing in…" : "Sign in"}
					</Button>
				</FieldGroup>
			</form>
		</AuthCard>
	);
}
