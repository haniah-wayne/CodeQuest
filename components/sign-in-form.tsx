"use client";

import { useActionState } from "react";
import { signIn } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignInForm() {
	const [state, action, pending] = useActionState(signIn, {});

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
					{state.error && <AuthFormError>{state.error}</AuthFormError>}

					<Field>
						<FieldLabel className="text-label" htmlFor="email">
							Email
						</FieldLabel>

						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="you@wayne.edu"
							className="h-11"
							required
						/>
					</Field>

					<Field>
						<FieldLabel className="text-label" htmlFor="password">
							Password
						</FieldLabel>

						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							className="h-11"
							required
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
