"use client";

import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	columnFilteringFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_includesString,
	globalFilteringFeature,
	type ReactTable,
	type RowData,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	tableFeatures,
} from "@tanstack/react-table";
import { cn } from "cn";
import type * as React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const dataTableFeatures = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: { includesString: filterFn_includesString },
});

export type DataTableFeatures = typeof dataTableFeatures;

const ariaSort = { asc: "ascending", desc: "descending" } as const;

export function DataTable<TData extends RowData>({
	table,
	emptyMessage,
}: {
	table: ReactTable<DataTableFeatures, TData, unknown>;
	emptyMessage: React.ReactNode;
}) {
	const rows = table.getRowModel().rows;

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((group) => (
					<TableRow key={group.id} className="hover:bg-transparent">
						{group.headers.map((header) => {
							const sorted = header.column.getIsSorted();

							return (
								<TableHead
									key={header.id}
									aria-sort={sorted ? ariaSort[sorted] : undefined}
									className="text-caption text-muted-foreground"
								>
									{header.isPlaceholder ? null : header.column.getCanSort() ? (
										<button
											type="button"
											className="-mx-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
											onClick={header.column.getToggleSortingHandler()}
										>
											<table.FlexRender header={header} />

											<HugeiconsIcon
												icon={
													sorted === "asc"
														? ArrowUp01Icon
														: sorted === "desc"
															? ArrowDown01Icon
															: ArrowUpDownIcon
												}
												className={cn(
													"size-3.5",
													sorted && "text-foreground",
												)}
											/>
										</button>
									) : (
										<table.FlexRender header={header} />
									)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>

			<TableBody>
				{rows.length > 0 ? (
					rows.map((row) => (
						<TableRow key={row.id}>
							{row.getAllCells().map((cell) => (
								<TableCell key={cell.id}>
									<table.FlexRender cell={cell} />
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow className="hover:bg-transparent">
						<TableCell
							colSpan={table.getAllLeafColumns().length}
							className="h-24 text-center text-muted-foreground"
						>
							{emptyMessage}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
