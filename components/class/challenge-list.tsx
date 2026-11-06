"use client";

import {
	CheckmarkCircle02Icon,
	FilterHorizontalIcon,
	Flag02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, type ReactTable, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import Link from "next/link";
import { useMemo } from "react";
import { ChallengeActions } from "@/components/challenge/challenge-actions";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import {
	DataTable,
	type DataTableFeatures,
	dataTableFeatures,
} from "@/components/class/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/supabase/database.types";

export type ChallengeStatus = "not_started" | "attempted" | "solved";

type Challenge = Pick<
	Tables<"Challenges">,
	"ChallengeID" | "Title" | "Description" | "Points" | "CreatedAt"
> & { status: ChallengeStatus };

type CompletionFilterValue = "all" | "completed" | "notCompleted";

const statusOrder: ChallengeStatus[] = ["not_started", "attempted", "solved"];

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const helper = createColumnHelper<DataTableFeatures, Challenge>();

const titleColumn = (classId: string, linkRows: boolean) =>
	helper.accessor("Title", {
		header: "Title",
		sortFn: "alphanumeric",
		cell: (info) => {
			const ch = info.row.original;

			return (
				<div className="flex max-w-md min-w-0 flex-col gap-0.5 py-1">
					<Link
						className={cn(
							"w-fit rounded-sm text-label whitespace-normal outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
							linkRows && "after:absolute after:inset-0",
						)}
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
		<Badge className="bg-wsu-gold text-wsu-green tabular-nums">{info.getValue()} pts</Badge>
	),
});

const statusColumn = helper.accessor("status", {
	header: "Status",
	sortFn: (a, b, id) =>
		statusOrder.indexOf(a.getValue<ChallengeStatus>(id)) -
		statusOrder.indexOf(b.getValue<ChallengeStatus>(id)),

	filterFn: (row, columnId, filterValue) => {
		const status = row.getValue<ChallengeStatus>(columnId);

		if (filterValue === "completed") {
			return status === "solved";
		}

		if (filterValue === "notCompleted") {
			return status !== "solved";
		}

		return true;
	},

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

const actionsColumn = (classId: string) =>
	helper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => (
			// Sits above the row-wide title link so the menu stays clickable
			<div className="relative z-10 flex justify-end">
				<ChallengeActions
					classId={classId}
					challengeId={info.row.original.ChallengeID}
					title={info.row.original.Title}
				/>
			</div>
		),
	});

export function ChallengeList({
	challenges,
	error,
	classId,
	create,
	showStatus,
	linkRows,
	empty = {
		title: "No challenges yet",
		description: "Challenges added to this class will show up here.",
	},
}: {
	challenges: Challenge[];
	error: boolean;
	classId: string;
	create?: boolean;
	showStatus: boolean;
	linkRows: boolean;
	empty?: { title: string; description: string };
}) {
	const createButton = create ? (
		<Link
			className={buttonVariants({ size: "sm" })}
			href={`/dashboard/classes/${classId}/challenges/new`}
		>
			Create a challenge
		</Link>
	) : null;

	const columns = useMemo(
		() =>
			helper.columns([
				titleColumn(classId, linkRows),
				pointsColumn,
				createdAtColumn,
				...(showStatus ? [statusColumn] : []),
				...(create ? [actionsColumn(classId)] : []),
			]),
		[classId, linkRows, showStatus, create],
	);

	const table = useTable({
		features: dataTableFeatures,
		columns,
		data: challenges,
		getRowId: (ch) => String(ch.ChallengeID),
	});

	const isEmpty = !error && challenges.length === 0;
	const filtered = table.state.columnFilters.length > 0;

	const action =
		error || isEmpty ? null : (
			<div className="flex items-center gap-2">
				{showStatus && <CompletionFilter table={table} />}
				{createButton}
			</div>
		);

	return (
		<ClassSection
			id="challenges"
			title="Challenges"
			icon={Flag02Icon}
			count={challenges.length}
			action={isEmpty ? null : action}
		>
			{error ? (
				<SectionError what="challenges" />
			) : isEmpty ? (
				<SectionEmpty
					icon={Flag02Icon}
					title={empty.title}
					description={empty.description}
					actions={createButton}
				/>
			) : (
				<DataTable
					table={table}
					emptyMessage={
						filtered ? "No challenges match the selected filter" : "No challenges"
					}
				/>
			)}
		</ClassSection>
	);
}

const completionOptions = [
	{ value: "all", label: "All" },
	{ value: "completed", label: "Completed" },
	{ value: "notCompleted", label: "Not completed" },
] as const;

function CompletionFilter({ table }: { table: ReactTable<DataTableFeatures, Challenge, unknown> }) {
	const column = table.getColumn("status");
	const value = (column?.getFilterValue() as CompletionFilterValue | undefined) ?? "all";
	const active = value !== "all";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="sm"
						aria-label={active ? "Filter challenges, 1 active" : "Filter challenges"}
					>
						<HugeiconsIcon icon={FilterHorizontalIcon} data-icon="inline-start" />
						Filter
						{active && <Badge className="h-4 min-w-4 px-1 tabular-nums">1</Badge>}
					</Button>
				}
			/>

			<DropdownMenuContent align="end" className="w-auto">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Completion</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={value}
						onValueChange={(next: CompletionFilterValue) =>
							column?.setFilterValue(next === "all" ? undefined : next)
						}
					>
						{completionOptions.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
	switch (status) {
		case "solved":
			return (
				<Badge>
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
