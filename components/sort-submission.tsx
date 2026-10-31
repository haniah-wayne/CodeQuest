"use client";
import {
	createColumnHelper,
	createSortedRowModel,
	createFilteredRowModel,
	columnFilteringFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Submission = {
	StudentID: string;
	Name: string;
	Score: number;
	SubmittedAt: string;
	Status: string;
};

const features = tableFeatures({
	rowSortingFeature,
	columnFilteringFeature,
	sortedRowModel: createSortedRowModel(),
	filteredRowModel: createFilteredRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

type SubmissionListtableProps = {
	data: Submission[];
};

export function SubmissionListtable({ data }: SubmissionListtableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([{ id: "SubmittedAt", desc: true }]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const columnHelper = createColumnHelper<typeof features, Submission>();

	const columns = React.useMemo(
		() =>
			columnHelper.columns([
				columnHelper.display({
					id: "rowNumber",
					header: "#",
					cell: ({ row }) => row.getDisplayIndex() + 1,
				}),
				columnHelper.accessor("StudentID", {
					cell: (info) => info.getValue(),
				}),

				columnHelper.accessor("Name", {
					header: "Name",
					sortFn: "text",
					sortUndefined: "last",
				}),
				columnHelper.accessor("Score", {
					header: "Score",
					sortUndefined: "last",
				}),
				columnHelper.accessor("Status", {
					header: () => "Status",
					filterFn: (row, columnId, filterValue) => {
						const status = row.getValue(columnId);

						if (filterValue === "completed") {
							return status === "correct";
						}

						if (filterValue === "notCompleted") {
							return status !== "correct";
						}

						return true;
					},
				}),
				columnHelper.accessor((row) => row.SubmittedAt ?? undefined, {
					id: "SubmittedAt",
					header: () => "Time",
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
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
	});

	const sortedSubmissions = table.getRowModel().rows.map((row) => row.original);

	const [sortBy, setSortBy] = React.useState("SubmittedAt");

	return (
		<div className="space-y-4">
			<Select
				value={sortBy}
				onValueChange={(value) => {
					if (value === null) return;
					setSortBy(value);
					table.setSorting([{ id: value, desc: value !== "Name" }]);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="StudentID">StudentID</SelectItem>
					<SelectItem value="Name">Name</SelectItem>
					<SelectItem value="Score">Score</SelectItem>
					<SelectItem value="Status">Status</SelectItem>
					<SelectItem value="SubmittedAt">Time</SelectItem>
				</SelectContent>
			</Select>
			<Select
				defaultValue="all"
				onValueChange={(value) => {
					if (value === null) return;

					if (value === "all") {
						table.getColumn("Status")?.setFilterValue(undefined);
					} else {
						table.getColumn("Status")?.setFilterValue(value);
					}
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Filter by completion" />
				</SelectTrigger>

				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					<SelectItem value="completed">Completed</SelectItem>
					<SelectItem value="notCompleted">Not Completed</SelectItem>
				</SelectContent>
			</Select>
			<pre>{JSON.stringify(sortedSubmissions, null, 2)}</pre>
		</div>
	);
}
