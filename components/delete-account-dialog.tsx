"use client";

import { deleteAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@/components/ui/dialog";

export function DeleteAccountDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Are you sure you want to delete your account?</DialogTitle>

					<DialogDescription>
						This action cannot be undone. All of your data will be permanently deleted.
					</DialogDescription>
				</DialogHeader>

				<DialogClose render={<Button size="sm" className="px-3" />}>Cancel</DialogClose>

				<form
					action={async () => {
						await deleteAccount();
					}}
				>
					<DialogClose
						render={<Button size="sm" className="px-3" variant="destructive" />}
					>
						Delete.
					</DialogClose>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
