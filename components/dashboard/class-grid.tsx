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

export type ClassSummary = Pick<
	Tables<"Classes">,
	"ClassID" | "ClassName" | "Description" | "color"
> &
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
			className="group/class flex flex-1 flex-col gap-2 rounded-3xl border border-accent bg-white p-6 transition-colors outline-none hover:border-emerald-200 hover:bg-emerald-50/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
			href={`/dashboard/classes/${c.ClassID}`}
		>
			<span
				aria-hidden
				className="mb-2 h-1.5 w-10 rounded-full bg-wsu-green"
				style={c.color ? { backgroundColor: c.color } : undefined}
			/>

			<h2 className="text-heading">{c.ClassName}</h2>

			{c.Description && (
				<p className="line-clamp-3 text-body-sm text-pretty text-muted-foreground">
					{c.Description}
				</p>
			)}

			{c.ClassCode && (
				<p className="mt-auto flex items-center justify-between gap-3 border-t border-muted pt-4">
					<span className="text-caption text-muted-foreground">Join code</span>

					<code className="font-mono text-label tracking-wider">{c.ClassCode}</code>
				</p>
			)}
		</Link>
	);
}

function GridEmpty({ icon, empty }: { icon: IconSvgElement; empty: EmptyState }) {
	return (
		<Empty className="min-h-72 rounded-3xl border border-emerald-200 bg-white/70">
			<EmptyHeader>
				<EmptyMedia className="bg-emerald-50 text-wsu-green" variant="icon">
					<HugeiconsIcon icon={icon} />
				</EmptyMedia>

				<EmptyTitle>{empty.title}</EmptyTitle>

				<EmptyDescription>{empty.description}</EmptyDescription>
			</EmptyHeader>

			{empty.action && <EmptyContent>{empty.action}</EmptyContent>}
		</Empty>
	);
}
