"use client";

import { useActionState } from "react";
import { deleteAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";

export function DeleteAccountDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [state, formAction, pending] = useActionState(() => deleteAccount(), undefined);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Are you sure you want to delete your account?</DialogTitle>

					<DialogDescription>
						This action cannot be undone. All of your data will be permanently deleted.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose render={<Button size="sm" className="px-3" />}>Cancel</DialogClose>

					<form action={formAction}>
						<Button
							type="submit"
							size="sm"
							className="px-3"
							variant="destructive"
							disabled={pending}
						>
							Confirm
						</Button>

						{state?.error && (
							<p className="mt-2 text-sm text-destructive">{state.error}</p>
						)}
					</form>
				</DialogFooter>
			</DialogPopup>
		</Dialog>
	);
}
