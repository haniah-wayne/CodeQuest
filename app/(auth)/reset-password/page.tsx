"use client";

import { EyeClosedIcon } from "@hugeicons/core-free-icons";
import { EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/schemas.js";

export default function ResetPassword() {
	const [state, action, pending] = useActionState(updatePassword, {
		success: "",
		error: "",
	});
	const [password, setPassword] = useState("");
	const [visible, setVisible] = useState(false);

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

							<div className="relative">
								<Input
									className="h-11 pr-11"
									id="password"
									name="password"
									type={visible ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="new-password"
									minLength={MIN_PASSWORD_LENGTH}
									required
								/>

								<button
									type="button"
									className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
									onClick={() => setVisible(!visible)}
									aria-label={visible ? "Hide password" : "Show password"}
								>
									<HugeiconsIcon
										icon={visible ? EyeIcon : EyeClosedIcon}
										size={18}
									/>
								</button>
							</div>
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
