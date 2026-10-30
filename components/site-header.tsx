import { MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";

export async function SiteHeader() {
	const user = await getSessionUser();

	return (
		<header id="site-header" className="fixed inset-x-0 top-0 z-20 px-3 pt-3 sm:px-5 sm:pt-5">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 rounded-4xl bg-secondary/85 pr-2 pl-2.5 smooth-shadow-ring-lg backdrop-blur-md sm:h-16 sm:pr-3 sm:pl-3">
				<Link
					className="flex items-center gap-2.5 rounded-full pr-2 text-[1.0625rem] font-bold tracking-tight"
					href="/"
				>
					<span className="flex size-9 items-center justify-center rounded-full bg-wsu-green text-wsu-gold sm:size-10">
						<HugeiconsIcon icon={MapsLocation01Icon} className="size-5" />
					</span>
					CodeQuest
				</Link>

				<div className="ml-auto flex items-center gap-1 sm:gap-2">
					{user ? (
						<>
							<span className="mr-2">{user.name}</span>

							<form action={signOut}>
								<Button
									className="bg-card px-3"
									type="submit"
									size="sm"
									variant="outline"
								>
									Sign out
								</Button>
							</form>
						</>
					) : (
						<>
							<Link
								className={cn(
									buttonVariants({ variant: "ghost", size: "sm" }),
									"hover:bg-card/70",
								)}
								href="/sign-in"
							>
								Sign in
							</Link>

							<Link className={buttonVariants({ size: "sm" })} href="/sign-up">
								Create account
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
