"use client";

import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { ROLES, type Role } from "@/lib/auth/roles";

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

					<Field>
						<FieldLabel className="text-label" htmlFor="name">
							Name
						</FieldLabel>

						<Input
							id="name"
							name="name"
							type="text"
							autoComplete="name"
							placeholder="Ada Lovelace"
							className="h-11"
							required
						/>
					</Field>

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
							autoComplete="new-password"
							className="h-11"
							required
							minLength={8}
						/>

						<FieldDescription className="text-caption">
							At least 8 characters.
						</FieldDescription>
					</Field>

					<FieldSet>
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
					</FieldSet>

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Creating account…" : "Create account"}
					</Button>
				</FieldGroup>
			</form>
		</AuthCard>
	);
}
