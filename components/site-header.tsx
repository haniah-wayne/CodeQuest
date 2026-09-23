import { Map } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";

export async function SiteHeader() {
	const user = await getSessionUser();

	return (
		<header id="site-header" className="fixed inset-x-0 top-0 z-20 px-3 pt-3 sm:px-5 sm:pt-5">
			<div className="inner mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-4xl border border-border bg-background/80 pr-2 pl-5 backdrop-blur-md sm:h-16 sm:pr-3 sm:pl-6">
				<Link
					className="flex items-center gap-2.5 rounded-sm text-[1.0625rem] font-bold tracking-tight"
					href="/"
				>
					<HugeiconsIcon icon={Map} />
					CodeQuest
				</Link>

				<div className="ml-auto flex items-center gap-1 sm:gap-2">
					{user ? (
						<form action={signOut}>
							<Button className="px-3" type="submit" size="sm" variant="outline">
								Sign out
							</Button>
						</form>
					) : (
						<>
							<Button
								className="px-3"
								size="sm"
								variant="ghost"
								render={<Link href="/sign-in" />}
							>
								Sign in
							</Button>

							<Button className="px-3" size="sm" render={<Link href="/sign-up" />}>
								Create account
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
