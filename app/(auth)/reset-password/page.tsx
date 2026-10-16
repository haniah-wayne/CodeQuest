"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import eye_closed from "@/assets/img/eye_closed.png";
import eye_open from "@/assets/img/eye_open.png";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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

							<Input
								className="h-11"
								id="password"
								name="password"
								type={visible ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="new-password"
								required
							/>
							<div p-2 onClick={() => setVisible(!visible)}>
								<Image src={visible ? eye_open : eye_closed} alt="view password" />
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
