"use client";

import { ChevronDown } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
	// the dialog lives outside the menu so it isn't unmounted when the menu closes
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button size="icon-sm" variant="ghost">
							<HugeiconsIcon icon={ChevronDown} />
						</Button>
					}
				/>

				<DropdownMenuContent>
					<DropdownMenuItem>
						<form action={signOut}>Sign out</form>
					</DropdownMenuItem>

					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
						Delete account
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
		</>
	);
}
