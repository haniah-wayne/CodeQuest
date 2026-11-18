"use client";

import { useActionState } from "react";
import { deleteChallenge } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@/components/ui/dialog";

// Opened from the challenge actions menu, so it has no trigger of its own
export function DeleteChallengeDialog({
	classId,
	challengeId,
	title,
	open,
	onOpenChange,
}: {
	classId: string;
	challengeId: number;
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [state, action, pending] = useActionState(deleteChallenge, {});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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

					<DialogFooter>
						<DialogClose render={<Button type="button" variant="ghost" />}>
							Cancel
						</DialogClose>

						<Button type="submit" variant="destructive" disabled={pending}>
							{pending ? "Deleting…" : "Delete challenge"}
						</Button>
					</DialogFooter>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
