"use client";

import { useActionState, useState } from "react";
import { type JoinClassState, joinClass } from "@/app/dashboard/actions";
import { AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function JoinClassDialog() {
	const [open, setOpen] = useState(false);

	const [state, action, pending] = useActionState<JoinClassState, FormData>(
		async (prevState, formData) => {
			const result = await joinClass(prevState, formData);
			if (result.success) setOpen(false);

			return result;
		},
		{},
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button className="px-4" />}>Join a class</DialogTrigger>

			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Join a class</DialogTitle>

					<DialogDescription>
						Enter the join code your professor shared.
					</DialogDescription>
				</DialogHeader>

				<form action={action}>
					<FieldGroup>
						{state.error && <AuthFormError>{state.error}</AuthFormError>}

						<Field data-invalid={Boolean(state.fieldErrors?.code) || undefined}>
							<FieldLabel className="text-label" htmlFor="code">
								Join code
							</FieldLabel>

							<Input
								className="h-11 font-mono tracking-wider"
								id="code"
								name="code"
								type="text"
								placeholder="a1b2c3d4e5"
								autoComplete="off"
								autoCapitalize="none"
								spellCheck={false}
								defaultValue={state.values?.code}
								required
								aria-invalid={Boolean(state.fieldErrors?.code) || undefined}
							/>

							<FieldError>{state.fieldErrors?.code}</FieldError>
						</Field>

						<Button type="submit" size="lg" className="w-full" disabled={pending}>
							{pending ? "Joining class…" : "Join class"}
						</Button>
					</FieldGroup>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
