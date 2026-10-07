"use client";

//import the neccessary components/modules
import { useActionState } from "react";
import { AuthCard, AuthFormError } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"; ///plsplspls remeber the spelling
import { Input } from "@/components/ui/input";
import { createChallenge } from "./actions"; //error bc not made yet, in same folder

export default function CreateChallengePage() {
	const [state, action, pending] = useActionState(createChallenge, {});
	return (
		<AuthCard title="Create your own challenge">
			<form action={action}>
				<FieldGroup>
					{state.error && <AuthFormError>{state.error}</AuthFormError>}

					<Field>
						<FieldLabel className="text-label" htmlFor="challengeName">
							{" "}
							Challenge Name{" "}
						</FieldLabel>
						<Input
							className="h-11"
							id="challengeName"
							name="challengeName"
							type="text"
							placeholder="Challenge Name (Ex: For Loops)"
							required
						/>
					</Field>

					<Field>
						<FieldLabel className="text-label" htmlFor="challengeDescription">
							{" "}
							Challenge Name{" "}
						</FieldLabel>
						<Input
							className="h-11"
							id="challengeDescription"
							name="challengeDescription"
							type="text"
							placeholder="Challenge Description (Ex: For Loops)"
							required
						/>
					</Field>

					<Field>
						<FieldLabel className="text-label" htmlFor="correctAnswer">
							{" "}
							Challenge Name{" "}
						</FieldLabel>
						<Input
							className="h-11"
							id="correctAnswer"
							name="correctAnswer"
							type="text"
							placeholder="Challenge Name (Ex: For Loops)"
							required
						/>
					</Field>

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Create" : "Create Challenge"}
					</Button>
				</FieldGroup>
			</form>
		</AuthCard>
	);
}
