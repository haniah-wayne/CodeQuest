import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export function ClassSection({
	id,
	title,
	icon,
	count,
	children,
}: {
	id: string;
	title: string;
	icon: IconSvgElement;
	count?: number;
	children: React.ReactNode;
}) {
	return (
		<section
			className="flex min-w-0 flex-col rounded-3xl border border-accent bg-white"
			aria-labelledby={id}
		>
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-wsu-green">
					<HugeiconsIcon icon={icon} className="size-4.5" />
				</span>

				<h2 className="text-label" id={id}>
					{title}
				</h2>

				{count !== undefined && count > 0 && (
					<Badge className="tabular-nums" variant="secondary">
						{count}
					</Badge>
				)}
			</header>

			<div className="flex flex-1 flex-col p-2 sm:p-3">{children}</div>
		</section>
	);
}

export function SectionEmpty({
	icon,
	title,
	description,
}: {
	icon: IconSvgElement;
	title: string;
	description: React.ReactNode;
}) {
	return (
		<Empty className="gap-3 p-8">
			<EmptyHeader>
				<EmptyMedia className="bg-emerald-50 text-wsu-green" variant="icon">
					<HugeiconsIcon icon={icon} />
				</EmptyMedia>

				<EmptyTitle>{title}</EmptyTitle>

				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export function SectionError({ what }: { what: string }) {
	return (
		<SectionEmpty
			icon={Alert02Icon}
			title={`Couldn’t load ${what}`}
			description="Refresh the page to try again."
		/>
	);
}
