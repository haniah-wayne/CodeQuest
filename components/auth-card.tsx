import Link from "next/link";
import type * as React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AuthCard({
	title,
	description,
	altPrompt,
	altLabel,
	altHref,
	children,
}: {
	title: string;
	description: string;
	altPrompt: string;
	altLabel: string;
	altHref: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="mx-auto w-full max-w-md rounded-3xl border border-accent bg-white ring-0 [--card-spacing:--spacing(8)]">
			<CardHeader>
				<hgroup className="flex flex-col gap-2">
					<h1 className="text-title">{title}</h1>

					<p className="text-body-sm text-muted-foreground">{description}</p>
				</hgroup>
			</CardHeader>

			<CardContent>{children}</CardContent>

			<CardFooter className="flex-col gap-4">
				<Separator className="bg-accent" />

				<p className="text-caption text-muted-foreground">
					{altPrompt}{" "}
					<Link
						href={altHref}
						className="font-medium text-foreground underline underline-offset-4 hover:text-wsu-green"
					>
						{altLabel}
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}

export function AuthFormError({ children }: { children: React.ReactNode }) {
	return (
		<div
			role="alert"
			className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-sm text-destructive"
		>
			{children}
		</div>
	);
}
