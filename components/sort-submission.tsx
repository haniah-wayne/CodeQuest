"use client";
import {
	createColumnHelper,
	createSortedRowModel,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChallengeList } from "./class/challenge-list";

type Challenge = {
	StudentID: number;
	Name: string;
	Score: number;
	SubmittedAt: string;
};

type SortableChallenge = Challenge & {
	SubmittedAt: string | null;
};

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

type ChallengeListtableProps = {
	data: SortableChallenge[];
	error: unknown;
	classId: string;
};

export function ChallengeListtable({ data, error, classId }: ChallengeListtableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([{ id: "CreatedAt", desc: true }]);

	const columnHelper = createColumnHelper<typeof features, SortableChallenge>();

	const columns = React.useMemo(
		() =>
			columnHelper.columns([
				columnHelper.display({
					id: "rowNumber",
					header: "#",
					cell: ({ row }) => row.getDisplayIndex() + 1,
				}),
				columnHelper.accessor("ChallengeID", {
					cell: (info) => info.getValue(),
				}),

				columnHelper.accessor("CreatedAt", {
					header: "Date",
					sortFn: "alphanumeric",
					sortUndefined: "last",
				}),
				columnHelper.accessor("IsPublished", {
					header: () => "Status",
				}),
				columnHelper.accessor((row) => row.SubmittedAt ?? undefined, {
					id: "SubmittedAt",
					header: () => "Completion",
					sortFn: "alphanumeric",
					sortUndefined: "last",
				}),
			]),
		[],
	);

	const table = useTable({
		features,
		columns,
		data,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
	});

	const sortedChallenges = table.getRowModel().rows.map((row) => row.original);

	const [sortBy, setSortBy] = React.useState("CreatedAt");

	return (
		<div className="space-y-4">
			<Select
				value={sortBy}
				onValueChange={(value) => {
					if (value === null) return;
					setSortBy(value);
					table.setSorting([{ id: value, desc: true }]);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="CreatedAt">Date</SelectItem>
					<SelectItem value="IsPublished">Status</SelectItem>
					<SelectItem value="SubmittedAt">Completion</SelectItem>
				</SelectContent>
			</Select>
			<ChallengeList challenges={sortedChallenges} error={error} classId={classId} />
		</div>
	);
}
