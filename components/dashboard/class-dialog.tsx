"use client";

import type * as React from "react";
import { useActionState, useId, useState } from "react";
import { type ClassFormState, createClass, updateClass } from "@/app/dashboard/actions";
import { AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ClassDialogMode =
	| { mode: "create" }
	| { mode: "edit"; classId: number; defaults: { name: string; description: string } };

const copy = {
	create: {
		title: "New class",
		submit: "Create class",
		pending: "Creating class…",
	},
	edit: {
		title: "Edit class",
		submit: "Save changes",
		pending: "Saving…",
	},
};

export function CreateClassDialog() {
	const [open, setOpen] = useState(false);

	return (
		<ClassDialog
			mode="create"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<DialogTrigger render={<Button className="px-4" />}>Create a class</DialogTrigger>
			}
		/>
	);
}

export function ClassDialog({
	open,
	onOpenChange,
	trigger,
	...props
}: ClassDialogMode & {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger?: React.ReactNode;
}) {
	const id = useId();
	const text = copy[props.mode];

	const [state, action, pending] = useActionState(
		async (prevState: ClassFormState, formData: FormData) => {
			const save = props.mode === "edit" ? updateClass : createClass;
			const result = await save(prevState, formData);

			if (result.success) onOpenChange(false);

			return result;
		},
		{},
	);

	const defaults = state.values ?? (props.mode === "edit" ? props.defaults : undefined);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger}

			<DialogPopup>
				<DialogHeader>
					<DialogTitle>{text.title}</DialogTitle>
				</DialogHeader>

				{/* React resets the form after each submit, so the defaults put back
				    whatever was typed when the action fails */}
				<form action={action}>
					{props.mode === "edit" && (
						<input type="hidden" name="classId" value={props.classId} />
					)}

					<FieldGroup>
						{state.error && <AuthFormError>{state.error}</AuthFormError>}

						<Field data-invalid={Boolean(state.fieldErrors?.name) || undefined}>
							<FieldLabel className="text-label" htmlFor={`${id}-name`}>
								Class name
							</FieldLabel>

							<Input
								className="h-11"
								id={`${id}-name`}
								name="name"
								type="text"
								placeholder="Intro to Programming"
								defaultValue={defaults?.name}
								required
								aria-invalid={Boolean(state.fieldErrors?.name) || undefined}
							/>

							<FieldError>{state.fieldErrors?.name}</FieldError>
						</Field>

						<Field data-invalid={Boolean(state.fieldErrors?.description) || undefined}>
							<FieldLabel className="text-label" htmlFor={`${id}-description`}>
								Description
							</FieldLabel>

							<Textarea
								id={`${id}-description`}
								name="description"
								placeholder="What students will work on this semester"
								defaultValue={defaults?.description}
								required
								aria-invalid={Boolean(state.fieldErrors?.description) || undefined}
							/>

							<FieldError>{state.fieldErrors?.description}</FieldError>
						</Field>

						<Button type="submit" size="lg" className="w-full" disabled={pending}>
							{pending ? text.pending : text.submit}
						</Button>
					</FieldGroup>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
