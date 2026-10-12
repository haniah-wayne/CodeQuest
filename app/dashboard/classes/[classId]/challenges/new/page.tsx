"use client";

import { useActionState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createChallenge } from "./actions";

export default function CreateChallengePage() {
	const [state, action, pending] = useActionState(createChallenge, {}); //for the form

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-10">
			<DashboardPageHeader title="Create a Challenge" />

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Challenge details</CardTitle>
					<CardDescription>
						Have your students hunt problem sets across campus
					</CardDescription>
				</CardHeader>

				<form action={action}>
					<CardContent>
						<FieldGroup>
							{state.error && (
								<div
									role="alert"
									className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
								>
									{state.error}
								</div>
							)}

							<input type="hidden" name="classId" value="" />

							<Field data-invalid={Boolean(state.fieldErrors?.title) || undefined}>
								<FieldLabel htmlFor="title">Challenge Name</FieldLabel>
								<Input
									id="title"
									name="title"
									type="text"
									placeholder="Loops & Arrays"
									required
									aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
								/>
								<FieldError>{state.fieldErrors?.title}</FieldError>
							</Field>

							<Field
								data-invalid={Boolean(state.fieldErrors?.description) || undefined}
							>
								<FieldLabel htmlFor="description">Challenge Description</FieldLabel>
								<Input
									id="description"
									name="description"
									type="text"
									placeholder="What the student will be solving"
									required
									aria-invalid={
										Boolean(state.fieldErrors?.description) || undefined
									}
								/>
								<FieldError>{state.fieldErrors?.description}</FieldError>
							</Field>

							<Field data-invalid={Boolean(state.fieldErrors?.solution) || undefined}>
								<FieldLabel htmlFor="solution">Solution</FieldLabel>
								<Input
									id="solution"
									name="solution"
									type="text"
									placeholder="Correct answer"
									required
									aria-invalid={Boolean(state.fieldErrors?.solution) || undefined}
								/>
								<FieldError>{state.fieldErrors?.solution}</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>

					<CardFooter>
						<Button type="submit" size="lg" className="w-full" disabled={pending}>
							{pending ? "Creating challenge" : "Create Challenge"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

//my notes
//input checking the class id
