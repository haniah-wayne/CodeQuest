"use client";

import { Delete02Icon, MoreHorizontalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useState } from "react";
import { type DeleteClassState, deleteClass } from "@/app/dashboard/actions";
import { ClassDialog } from "@/components/dashboard/class-dialog";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClassActions({
	classId,
	name,
	description,
}: {
	classId: number;
	name: string;
	description: string;
}) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
							<HugeiconsIcon icon={MoreHorizontalIcon} />
						</Button>
					}
				/>

				<DropdownMenuContent align="end" className="w-auto">
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<HugeiconsIcon icon={PencilEdit02Icon} />
						Edit
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
						<HugeiconsIcon icon={Delete02Icon} />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ClassDialog
				mode="edit"
				classId={classId}
				defaults={{ name, description }}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>

			<DeleteClassDialog
				classId={classId}
				name={name}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}

function DeleteClassDialog({
	classId,
	name,
	open,
	onOpenChange,
}: {
	classId: number;
	name: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [state, action, pending] = useActionState(
		async (prevState: DeleteClassState, formData: FormData) => {
			const result = await deleteClass(prevState, formData);

			if (result.success) onOpenChange(false);

			return result;
		},
		{},
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Delete this class?</DialogTitle>

					<DialogDescription>
						&quot;{name}&quot; and its challenges, student submissions, and enrollments
						will be permanently removed.
					</DialogDescription>
				</DialogHeader>

				<form action={action} className="flex flex-col gap-4">
					<input type="hidden" name="classId" value={classId} />

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
							{pending ? "Deleting…" : "Delete class"}
						</Button>
					</DialogFooter>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
