"use client";

import { useActionState } from "react";
import { deleteChallenge } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
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

export function DeleteChallengeButton({
	//values from challenge list
	classId,
	challengeId,
	title,
}: {
	classId: string; //types for the values
	challengeId: number;
	title: string;
}) {
	const [state, action, pending] = useActionState(deleteChallenge, {}); //action state of the function

	return (
		<Dialog>
			<DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
				Delete
			</DialogTrigger>

			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Delete this challenge?</DialogTitle>

					<DialogDescription>
						&quot;{title}&quot; and its student submissions and points will be
						permanently removed.
					</DialogDescription>
				</DialogHeader>

				<form action={action} className="flex flex-col gap-4">
					<input type="hidden" name="classId" value={classId} />
					<input type="hidden" name="challengeId" value={challengeId} />

					{state.error && (
						<p role="alert" className="text-body-sm text-destructive">
							{state.error}
						</p>
					)}

					<div className="flex justify-end gap-2">
						<DialogClose render={<Button type="button" variant="ghost" />}>
							Cancel
						</DialogClose>

						<Button type="submit" disabled={pending}>
							{pending ? "Deleting..." : "Delete challenge"}
						</Button>
					</div>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
