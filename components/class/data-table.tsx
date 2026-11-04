"use client";

import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	columnFilteringFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_arrHas,
	filterFn_includesString,
	globalFilteringFeature,
	type ReactTable,
	type Row,
	type RowData,
	rowExpandingFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	tableFeatures,
} from "@tanstack/react-table";
import { cn } from "cn";
import { Fragment } from "react";
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
	filterFns: { arrHas: filterFn_arrHas, includesString: filterFn_includesString },
	rowExpandingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

const ariaSort = { asc: "ascending", desc: "descending" } as const;

export function DataTable<TData extends RowData>({
	table,
	emptyMessage,
	renderExpanded,
}: {
	table: ReactTable<DataTableFeatures, TData, unknown>;
	emptyMessage: React.ReactNode;
	// Detail panel shown under a row while it's expanded
	renderExpanded?: (row: Row<DataTableFeatures, TData>) => React.ReactNode;
}) {
	const rows = table.getRowModel().rows;
	const columnCount = table.getAllLeafColumns().length;

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
					rows.map((row) => {
						const expanded = renderExpanded && row.getIsExpanded();

						return (
							<Fragment key={row.id}>
								<TableRow
									data-state={expanded ? "expanded" : undefined}
									// relative lets a cell's link stretch over the whole row
									className={cn("relative", expanded && "border-b-0 bg-muted/50")}
								>
									{row.getAllCells().map((cell) => (
										<TableCell key={cell.id}>
											<table.FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>

								{expanded && (
									<TableRow className="bg-muted/50 hover:bg-muted/50">
										<TableCell
											id={expandedRowId(row.id)}
											colSpan={columnCount}
											className="p-2 pt-0 whitespace-normal sm:p-3 sm:pt-0"
										>
											{renderExpanded(row)}
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						);
					})
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

// Links a row's expand toggle to its detail panel
export function expandedRowId(rowId: string) {
	return `row-${rowId}-details`;
}
