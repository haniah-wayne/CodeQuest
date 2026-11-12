"use client";

import { useActionState, useId } from "react";
import {
	type SaveFeedbackState,
	saveSubmissionFeedback,
} from "@/app/dashboard/classes/[classId]/challenges/[challengeId]/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { MAX_FEEDBACK_LENGTH } from "@/lib/schemas";

export function FeedbackDialog({
	submissionId,
	feedback,
	open,
	onOpenChange,
}: {
	submissionId: number;
	studentName: string;
	feedback: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>{feedback ? "Edit feedback" : "Add feedback"}</DialogTitle>
				</DialogHeader>

				<FeedbackForm
					submissionId={submissionId}
					feedback={feedback}
					onSaved={() => onOpenChange(false)}
				/>
			</DialogPopup>
		</Dialog>
	);
}

function FeedbackForm({
	submissionId,
	feedback,
	onSaved,
}: {
	submissionId: number;
	feedback: string | null;
	onSaved: () => void;
}) {
	const id = useId();

	const [state, action, pending] = useActionState<
		SaveFeedbackState & { value?: string },
		FormData
	>(async (_prev, formData) => {
		const value = String(formData.get("feedback") ?? "");
		let result: SaveFeedbackState;

		try {
			result = await saveSubmissionFeedback({ submissionId, feedback: value });
		} catch (error) {
			console.error(error);

			result = { error: "Something went wrong. Check your connection and try again." };
		}

		if (result.success) onSaved();

		return { ...result, value };
	}, {});

	return (
		<form action={action} className="flex flex-col gap-4">
			<Field data-invalid={Boolean(state.error) || undefined}>
				<FieldLabel className="sr-only text-label" htmlFor={`${id}-feedback`}>
					Feedback
				</FieldLabel>

				<Textarea
					id={`${id}-feedback`}
					name="feedback"
					className="max-h-80"
					placeholder="What went well, and what to work on next time"
					defaultValue={state.value ?? feedback ?? ""}
					maxLength={MAX_FEEDBACK_LENGTH}
					autoFocus
					aria-invalid={Boolean(state.error) || undefined}
					aria-describedby={`${id}-hint`}
				/>

				<FieldDescription id={`${id}-hint`}>
					Leave this blank to remove feedback.
				</FieldDescription>
			</Field>

			{state.error && (
				<p role="alert" className="text-body-sm text-destructive">
					{state.error}
				</p>
			)}

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>

				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Save feedback"}
				</Button>
			</DialogFooter>
		</form>
	);
}
