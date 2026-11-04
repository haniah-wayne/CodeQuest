"use client";

import { CheckmarkCircle02Icon, Flag02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import Link from "next/link";
import { DeleteChallengeButton } from "@/components/challenge/delete-challenge-button";
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

const deleteColumn = (classId: string) =>
	helper.display({
		id: "delete",
		header: () => <span className="sr-only">Actions</span>,
		cell: (info) => (
			<div className="flex justify-end">
				<DeleteChallengeButton
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
<<<<<<< HEAD
				<ol className="flex flex-col">
					{challenges.map((ch, i) => (
						<li
							key={ch.ChallengeID}
							className="relative flex items-start gap-4 rounded-2xl px-3 py-3.5 transition-colors has-[a:hover]:bg-muted/60 sm:px-4"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-caption text-muted-foreground tabular-nums">
								{i + 1}
							</span>

							<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
								<div className="flex min-w-0 flex-col gap-0.5 pt-1">
									<h3 className="text-label">
										{create ? (
											ch.Title
										) : (
											<Link
												className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
												href={`/dashboard/classes/${classId}/challenges/${ch.ChallengeID}`}
											>
												{ch.Title}
											</Link>
										)}
									</h3>

									{ch.Description && (
										<p className="line-clamp-2 text-body-sm text-pretty text-muted-foreground">
											{ch.Description}
										</p>
									)}
								</div>

								<div>
									{create && (
										<div className="relative z-10 flex items-center gap-1.5">
											<Link
												className={buttonVariants({ variant: "outline", size: "sm" })}
												href={`/dashboard/classes/${classId}/challenges/${ch.ChallengeID}/edit`}
											>
												Edit
											</Link>

											<DeleteChallengeButton
												classId={classId}
												challengeId={ch.ChallengeID}
												title={ch.Title}
											/>
										</div>
									)}
								</div>

								<div className="flex shrink-0 items-center gap-1.5 sm:pt-1.5">
									{ch.ChallengeType && (
										<Badge className="capitalize" variant="outline">
											{ch.ChallengeType}
										</Badge>
									)}

									<Badge className="bg-emerald-50 text-wsu-green tabular-nums">
										{ch.Points} pts
									</Badge>
								</div>
							</div>
						</li>
					))}
				</ol>
=======
				<ChallengeTable
					challenges={challenges}
					classId={classId}
					showStatus={showStatus}
					showDelete={create ?? false}
				/>
>>>>>>> 15ba4eec28d670e4a2e0ad97d48b1a10c206c5ab
			)}
		</ClassSection>
	);
}

function ChallengeTable({
	challenges,
	classId,
	showStatus,
	showDelete,
}: {
	challenges: Challenge[];
	classId: string;
	showStatus: boolean;
	showDelete: boolean;
}) {
	const columns = helper.columns([
		titleColumn(classId),
		pointsColumn,
		createdAtColumn,
		...(showStatus ? [statusColumn] : []),
		...(showDelete ? [deleteColumn(classId)] : []),
	]);

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
