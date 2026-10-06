"use client";

import { useActionState, useState } from "react";
import { type CreateClassState, createClass } from "@/app/dashboard/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function CreateClassDialog() {
	const [open, setOpen] = useState(false);

	const [state, action, pending] = useActionState(
		async (prevState: CreateClassState, formData: FormData) => {
			const result = await createClass(prevState, formData);

			if (result.success) setOpen(false);

			return result;
		},
		{},
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button className="px-4" />}>Create a class</DialogTrigger>

			<DialogPopup>
				<DialogHeader>
					<DialogTitle>New class</DialogTitle>

					<DialogDescription>
						Students join with the code we generate for you.
					</DialogDescription>
				</DialogHeader>

				{/* React resets the form after each submit, so the defaults put back
				    whatever was typed when the action fails */}
				<form action={action}>
					<FieldGroup>
						{state.error && <AuthFormError>{state.error}</AuthFormError>}

						<Field data-invalid={Boolean(state.fieldErrors?.name) || undefined}>
							<FieldLabel className="text-label" htmlFor="name">
								Class name
							</FieldLabel>

							<Input
								className="h-11"
								id="name"
								name="name"
								type="text"
								placeholder="Intro to Programming"
								defaultValue={state.values?.name}
								required
								aria-invalid={Boolean(state.fieldErrors?.name) || undefined}
							/>

							<FieldError>{state.fieldErrors?.name}</FieldError>
						</Field>

						<Field data-invalid={Boolean(state.fieldErrors?.description) || undefined}>
							<FieldLabel className="text-label" htmlFor="description">
								Description
							</FieldLabel>

							<Textarea
								id="description"
								name="description"
								placeholder="What students will work on this semester"
								defaultValue={state.values?.description}
								required
								aria-invalid={Boolean(state.fieldErrors?.description) || undefined}
							/>

							<FieldError>{state.fieldErrors?.description}</FieldError>
						</Field>

						<Button type="submit" size="lg" className="w-full" disabled={pending}>
							{pending ? "Creating class…" : "Create class"}
						</Button>
					</FieldGroup>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
