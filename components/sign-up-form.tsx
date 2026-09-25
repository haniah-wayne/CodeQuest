"use client";

import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { ROLES, type Role } from "@/lib/auth/roles";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/schemas";

const ROLE_LABELS: Record<Role, string> = {
	student: "Student",
	professor: "Professor",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
	student: "Take on quests and turn in problem sets.",
	professor: "Post quests and track how your class is doing.",
};

export function SignUpForm() {
	const [state, action, pending] = useActionState(signUp, {});

	return (
		<AuthCard
			title="Create your account"
			description="Start hunting down problem sets across campus."
			altPrompt="Already have an account?"
			altLabel="Sign in"
			altHref="/sign-in"
		>
			<form action={action}>
				<FieldGroup>
					{state.error && <AuthFormError>{state.error}</AuthFormError>}

					<Field data-invalid={Boolean(state.fieldErrors?.name) || undefined}>
						<FieldLabel className="text-label" htmlFor="name">
							Name
						</FieldLabel>

						<Input
							className="h-11"
							id="name"
							name="name"
							type="text"
							autoComplete="name"
							placeholder="Ada Lovelace"
							required
							aria-invalid={Boolean(state.fieldErrors?.name) || undefined}
						/>

						<FieldError>{state.fieldErrors?.name}</FieldError>
					</Field>

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
							autoComplete="new-password"
							required
							minLength={MIN_PASSWORD_LENGTH}
							aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
						/>

						<FieldDescription className="text-caption">
							At least {MIN_PASSWORD_LENGTH} characters.
						</FieldDescription>

						<FieldError>{state.fieldErrors?.password}</FieldError>
					</Field>

					<FieldSet data-invalid={Boolean(state.fieldErrors?.role) || undefined}>
						<FieldLegend className="text-label" variant="label">
							I&apos;m a
						</FieldLegend>

						<RadioGroup name="role" defaultValue="student" required>
							{ROLES.map((role) => (
								<FieldLabel
									className="w-full gap-3 rounded-2xl border border-input bg-input/20 p-4 transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
									key={role}
								>
									<Radio value={role} className="mt-0.5" />

									<span className="flex flex-col gap-1">
										<span className="text-label">{ROLE_LABELS[role]}</span>

										<span className="text-caption font-normal text-muted-foreground">
											{ROLE_DESCRIPTIONS[role]}
										</span>
									</span>
								</FieldLabel>
							))}
						</RadioGroup>

						<FieldError>{state.fieldErrors?.role}</FieldError>
					</FieldSet>

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Creating account…" : "Create account"}
					</Button>
				</FieldGroup>
			</form>
		</AuthCard>
	);
}
