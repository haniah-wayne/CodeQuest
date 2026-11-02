"use client";

import { CheckmarkCircle02Icon, Flag02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import Link from "next/link";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import {
	DataTable,
	type DataTableFeatures,
	dataTableFeatures,
} from "@/components/class/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Tables } from "@/supabase/database.types";

export type ChallengeStatus = "not_started" | "attempted" | "solved";

type Challenge = Pick<
	Tables<"Challenges">,
	"ChallengeID" | "Title" | "Description" | "Points" | "CreatedAt"
> & { status: ChallengeStatus };

const statusOrder: ChallengeStatus[] = ["not_started", "attempted", "solved"];

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const helper = createColumnHelper<DataTableFeatures, Challenge>();

const titleColumn = (classId: string) =>
	helper.accessor("Title", {
		header: "Title",
		sortFn: "alphanumeric",
		cell: (info) => {
			const ch = info.row.original;

			return (
				<div className="flex max-w-md min-w-0 flex-col gap-0.5 py-1">
					<Link
						className="w-fit rounded-sm text-label whitespace-normal outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
						href={`/dashboard/classes/${classId}/challenges/${ch.ChallengeID}`}
					>
						{ch.Title}
					</Link>

					{ch.Description && (
						<p className="line-clamp-1 text-body-sm whitespace-normal text-muted-foreground">
							{ch.Description}
						</p>
					)}
				</div>
			);
		},
	});

const pointsColumn = helper.accessor("Points", {
	header: "Points",
	sortFn: "basic",
	cell: (info) => (
		<Badge className="bg-emerald-50 text-wsu-green tabular-nums">{info.getValue()} pts</Badge>
	),
});

const statusColumn = helper.accessor("status", {
	header: "Status",
	sortFn: (a, b, id) =>
		statusOrder.indexOf(a.getValue<ChallengeStatus>(id)) -
		statusOrder.indexOf(b.getValue<ChallengeStatus>(id)),
	cell: (info) => <StatusBadge status={info.getValue()} />,
});

const createdAtColumn = helper.accessor("CreatedAt", {
	header: "Created",
	sortFn: "basic",
	cell: (info) => (
		<time
			className="text-muted-foreground tabular-nums"
			dateTime={info.getValue()}
			suppressHydrationWarning
		>
			{dateFormat.format(new Date(info.getValue()))}
		</time>
	),
});

export function ChallengeList({
	challenges,
	error,
	classId,
	create,
	showStatus,
}: {
	challenges: Challenge[];
	error: boolean;
	classId: string;
	create?: boolean;
	showStatus: boolean;
}) {
	const createButton = create ? (
		<Link
			className={buttonVariants({ size: "sm" })}
			href={`/dashboard/classes/${classId}/challenges/new`}
		>
			Create a challenge
		</Link>
	) : null;

	const isEmpty = !error && challenges.length === 0;

	return (
		<ClassSection
			id="challenges"
			title="Challenges"
			icon={Flag02Icon}
			count={challenges.length}
			action={isEmpty ? null : createButton}
		>
			{error ? (
				<SectionError what="challenges" />
			) : isEmpty ? (
				<SectionEmpty
					icon={Flag02Icon}
					title="No challenges yet"
					description="Challenges added to this class will show up here."
					actions={createButton}
				/>
			) : (
				<ChallengeTable challenges={challenges} classId={classId} showStatus={showStatus} />
			)}
		</ClassSection>
	);
}

function ChallengeTable({
	challenges,
	classId,
	showStatus,
}: {
	challenges: Challenge[];
	classId: string;
	showStatus: boolean;
}) {
	const title = titleColumn(classId);
	const columns = showStatus
		? helper.columns([title, pointsColumn, createdAtColumn, statusColumn])
		: helper.columns([title, pointsColumn, createdAtColumn]);

	const table = useTable({
		features: dataTableFeatures,
		columns,
		data: challenges,
		getRowId: (ch) => String(ch.ChallengeID),
	});

	return <DataTable table={table} emptyMessage="No challenges" />;
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
	switch (status) {
		case "solved":
			return (
				<Badge className="bg-emerald-50 text-wsu-green">
					<HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" />
					Solved
				</Badge>
			);
		case "attempted":
			return <Badge variant="outline">Attempted</Badge>;
		case "not_started":
			return <Badge variant="secondary">Not started</Badge>;
	}
}
