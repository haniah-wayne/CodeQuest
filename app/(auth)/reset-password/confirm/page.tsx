import { redirect } from "next/navigation";
import { confirmPasswordReset } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";

export default async function ConfirmPasswordReset({
	searchParams,
}: PageProps<"/reset-password/confirm">) {
	const { token_hash } = await searchParams;

	if (typeof token_hash !== "string" || !token_hash) {
		redirect("/sign-in?error=link_expired");
	}

	return (
		<AuthCard
			title="Reset your password"
			description="Continue to choose a new password for your account."
			altPrompt="Remembered it?"
			altLabel="Back to sign in"
			altHref="/sign-in"
		>
			<form action={confirmPasswordReset}>
				<input type="hidden" name="token_hash" value={token_hash} />

				<Button type="submit" size="lg" className="w-full">
					Continue
				</Button>
			</form>
		</AuthCard>
	);
}
