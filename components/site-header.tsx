import { Map } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
	return (
		<header className="fixed inset-x-0 top-0 z-20 px-3 pt-3 sm:px-5 sm:pt-5">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-4xl border border-border bg-background/80 pr-2 pl-5 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_8px_24px_-12px_oklch(0_0_0/0.18)] backdrop-blur-md sm:h-16 sm:pr-3 sm:pl-6">
				<Link
					className="flex items-center gap-2.5 rounded-sm text-[1.0625rem] font-bold tracking-tight"
					href="/"
				>
					<HugeiconsIcon icon={Map} />
					CodeQuest
				</Link>

				<div className="ml-auto flex items-center gap-1 sm:gap-2">
					<Button
						render={<Link href="/sign-in" />}
						variant="ghost"
						size="sm"
						className="px-3"
					>
						Sign in
					</Button>

					<Button render={<Link href="/sign-up" />} size="sm" className="px-4">
						Create account
					</Button>
				</div>
			</div>
		</header>
	);
}
