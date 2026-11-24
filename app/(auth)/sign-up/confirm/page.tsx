import { redirect } from "next/navigation";
import { confirmEmail } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";

export default async function ConfirmEmail({ searchParams }: PageProps<"/sign-up/confirm">) {
	const { token_hash } = await searchParams;

	if (typeof token_hash !== "string" || !token_hash) {
		redirect("/sign-in?error=link_expired");
	}

	return (
		<AuthCard
			title="Confirm your email"
			description="Continue to verify your email and finish setting up your account."
			altPrompt="Already confirmed?"
			altLabel="Sign in"
			altHref="/sign-in"
		>
			<form action={confirmEmail}>
				<input type="hidden" name="token_hash" value={token_hash} />

				<Button type="submit" size="lg" className="w-full">
					Continue
				</Button>
			</form>
		</AuthCard>
	);
}
