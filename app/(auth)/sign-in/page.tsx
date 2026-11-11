import { SignInForm } from "@/components/sign-in-form";

const ERROR_MESSAGES: Record<string, string> = {
	link_expired:
		"That link is invalid or has expired. Request a new one and use the latest email.",
};

export default async function SignIn({ searchParams }: PageProps<"/sign-in">) {
	const { error } = await searchParams;

	return (
		<SignInForm initialError={typeof error === "string" ? ERROR_MESSAGES[error] : undefined} />
	);
}
