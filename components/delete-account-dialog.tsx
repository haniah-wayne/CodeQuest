"use client";
import { useActionState, useState } from "react";
import { deleteAccount } from "@/app/(auth)/actions";
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
export function DeleteAccountDialog() {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				className="ml-auto rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
				render={<Button type="button" className="px-3" size="sm" variant="destructive" />}
			>
				Delete account.
			</DialogTrigger>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Are you sure you want to delete your account?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. All of your data will be permanently deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogClose render={<Button size="sm" className="px-3" variant="ghost" />}>
					Cancel
				</DialogClose>
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
