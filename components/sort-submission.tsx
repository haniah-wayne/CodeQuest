"use client";

import { createColumnHelper, useTable } from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import React from "react";
import { DataTable, dataTableFeatures } from "@/components/class/data-table";
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
	Score: number | null;
	SubmittedAt: string;
	Status: string | null;
};

type SubmissionListtableProps = {
	data: Submission[];
};

export function SubmissionListtable({ data }: SubmissionListtableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([{ id: "SubmittedAt", desc: true }]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const columnHelper = createColumnHelper<typeof dataTableFeatures, Submission>();

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
					sortFn: "alphanumeric",
					sortUndefined: "last",
				}),
				columnHelper.accessor("Score", {
					header: "Score",
					sortFn: "basic",
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
					header: "Time",
					sortFn: "basic",
					sortUndefined: "last",
				}),
			]),
		[],
	);

	const table = useTable({
		features: dataTableFeatures,
		columns,
		data,
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
	});

	return (
		<div className="space-y-4">
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
			<DataTable table={table} emptyMessage="No submissions" />
		</div>
	);
}
