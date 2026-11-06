"use client";

import { Delete02Icon, MoreHorizontalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { DeleteChallengeDialog } from "@/components/challenge/delete-challenge-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChallengeActions({
	classId,
	challengeId,
	title,
}: {
	classId: string;
	challengeId: number;
	title: string;
}) {
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`}>
							<HugeiconsIcon icon={MoreHorizontalIcon} />
						</Button>
					}
				/>

				<DropdownMenuContent align="end" className="w-auto">
					<DropdownMenuItem
						render={
							<Link
								href={`/dashboard/classes/${classId}/challenges/${challengeId}/edit`}
							/>
						}
					>
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

			<DeleteChallengeDialog
				classId={classId}
				challengeId={challengeId}
				title={title}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
