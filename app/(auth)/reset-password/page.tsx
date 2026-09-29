"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
	const [state, action, pending] = useActionState(updatePassword, {
		success: "",
		error: "",
	});

	return (
		<AuthCard
			title="Set a new password"
			description="Choose a new password for your account."
			altPrompt="Remembered it?"
			altLabel="Back to sign in"
			altHref="/sign-in"
		>
			{state.success ? (
				<div className="flex flex-col gap-4">
					<p
						role="status"
						className="rounded-2xl border border-wsu-green/30 bg-wsu-green/10 px-4 py-3 text-body-sm text-foreground"
					>
						{state.success}
					</p>

					<Button
						className="w-full"
						size="lg"
						nativeButton={false}
						render={<Link href="/" />}
					>
						Continue
					</Button>
				</div>
			) : (
				<form action={action}>
					<FieldGroup>
						{state.error && <AuthFormError>{state.error}</AuthFormError>}

						<Field>
							<FieldLabel className="text-label" htmlFor="password">
								New password
							</FieldLabel>

							<Input
								className="h-11"
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
							/>
						</Field>

						<Button type="submit" size="lg" className="w-full" disabled={pending}>
							{pending ? "Updating…" : "Update password"}
						</Button>
					</FieldGroup>
				</form>
			)}
		</AuthCard>
	);
}
