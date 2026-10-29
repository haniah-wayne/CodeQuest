import { Alert02Icon, Book02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import type * as React from "react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import type { Tables } from "@/supabase/database.types";

export type ClassSummary = Pick<Tables<"Classes">, "ClassID" | "ClassName" | "Description"> &
	Partial<Pick<Tables<"Classes">, "ClassCode">>;

interface EmptyState {
	title: string;
	description: string;
	action?: React.ReactNode;
}

export function ClassGrid({
	classes,
	error,
	empty,
}: {
	classes: ClassSummary[] | null;
	error: unknown;
	empty: EmptyState;
}) {
	if (error) {
		return (
			<GridEmpty
				icon={Alert02Icon}
				empty={{
					title: "Couldn’t load your classes",
					description: "Refresh the page to try again.",
				}}
			/>
		);
	}

	if (!classes?.length) {
		return <GridEmpty icon={Book02Icon} empty={empty} />;
	}

	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{classes.map((c) => (
				<li key={c.ClassID} className="flex">
					<ClassCard class={c} />
				</li>
			))}
		</ul>
	);
}

function ClassCard({ class: c }: { class: ClassSummary }) {
	return (
		<Link
			className="group/class flex flex-1 flex-col gap-2 rounded-3xl bg-card p-6 smooth-shadow-ring-md transition-[box-shadow,translate] duration-150 outline-none hover:-translate-y-0.5 hover:smooth-shadow-ring-lg hover:smooth-ring-wsu-green/45 focus-visible:smooth-ring-ring/50 focus-visible:[--smooth-ring-width:3px]"
			href={`/dashboard/classes/${c.ClassID}`}
		>
			<h2 className="text-heading">{c.ClassName}</h2>

			{c.Description && (
				<p className="line-clamp-3 text-body-sm text-pretty text-muted-foreground">
					{c.Description}
				</p>
			)}

			{c.ClassCode && (
				<p className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
					<span className="text-caption text-muted-foreground">Join code</span>

					<code className="font-mono text-label tracking-wider">{c.ClassCode}</code>
				</p>
			)}
		</Link>
	);
}

function GridEmpty({ icon, empty }: { icon: IconSvgElement; empty: EmptyState }) {
	return (
		<Empty className="min-h-72 rounded-3xl border-2 border-input bg-card/60">
			<EmptyHeader>
				<EmptyMedia className="bg-wsu-green text-wsu-gold" variant="icon">
					<HugeiconsIcon icon={icon} />
				</EmptyMedia>

				<EmptyTitle>{empty.title}</EmptyTitle>

				<EmptyDescription>{empty.description}</EmptyDescription>
			</EmptyHeader>

			{empty.action && <EmptyContent>{empty.action}</EmptyContent>}
		</Empty>
	);
}
