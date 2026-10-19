"use client";
import { EyeClosedIcon as eye_closed } from "@hugeicons/core-free-icons";
import { EyeIcon as eye_open } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useState } from "react";
import { signIn } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignInForm({ initialError }: { initialError?: string }) {
	const [state, action, pending] = useActionState(signIn, {});
	const [password, setPassword] = useState("");
	const [visible, setVisible] = useState(false);
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
							defaultValue={state.values?.email}
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
							type={visible ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
							required
							aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
						/>
						<div p-2 onClick={() => setVisible(!visible)}>
							<HugeiconsIcon icon={visible ? eye_open : eye_closed} />
						</div>
						<FieldError>{state.fieldErrors?.password}</FieldError>
					</Field>

					<Field orientation="horizontal">
						<FieldLabel className="text-label" htmlFor="remember">
							{/* React resets the form after each submit, and Base UI's hidden
							input only picks up defaultChecked on mount, so remount it */}
							<Checkbox
								key={String(state.values?.remember)}
								id="remember"
								name="remember"
								defaultChecked={state.values?.remember}
							/>
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
