"use client";

import { useActionState, useState } from "react";
import { sendResetPasswordEmail } from "@/app/(auth)/actions";
import { AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordDialog() {
	const [open, setOpen] = useState(false);

	const [state, action, pending] = useActionState(sendResetPasswordEmail, {
		success: "",
		error: "",
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				className="ml-auto rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
				render={<button type="button" />}
			>
				Forgot password?
			</DialogTrigger>

			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Reset your password</DialogTitle>

					<DialogDescription>
						Enter the email on your account and we&apos;ll send you a link to set a new
						password.
					</DialogDescription>
				</DialogHeader>

				{state.success ? (
					<div className="flex flex-col gap-4">
						<p
							role="status"
							className="rounded-2xl border border-wsu-green/30 bg-wsu-green/10 px-4 py-3 text-body-sm text-foreground"
						>
							{state.success}
						</p>

						<DialogClose render={<Button size="lg" className="w-full" />}>
							Done
						</DialogClose>
					</div>
				) : (
					<form action={action}>
						<FieldGroup>
							{state.error && <AuthFormError>{state.error}</AuthFormError>}

							<Field>
								<FieldLabel className="text-label" htmlFor="reset-email">
									Email
								</FieldLabel>

								<Input
									id="reset-email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="you@wayne.edu"
									className="h-11"
									required
								/>
							</Field>

							<Button type="submit" size="lg" className="w-full" disabled={pending}>
								{pending ? "Sending…" : "Send reset link"}
							</Button>
						</FieldGroup>
					</form>
				)}
			</DialogPopup>
		</Dialog>
	);
}
