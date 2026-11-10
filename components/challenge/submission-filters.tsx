"use client";

import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import type { SubmissionRow } from "@/components/challenge/submission-list";
import { STATUS_ORDER, statusLabel } from "@/components/challenge/submission-status";
import type { DataTableFeatures } from "@/components/class/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGE_IDS, languageLabel } from "@/lib/challenges/languages";

interface FilterGroup {
	columnId: keyof SubmissionRow;
	label: string;
	order: readonly string[];
	format: (value: string | null) => string;
}

const filterGroups = [
	{
		columnId: "language",
		label: "Language",
		order: LANGUAGE_IDS,
		format: languageLabel,
	},
	{
		columnId: "status",
		label: "Completion status",
		order: STATUS_ORDER,
		format: statusLabel,
	},
] as const satisfies FilterGroup[];

type FilterValue = string | null;

export function SubmissionFilters({
	table,
	submissions,
}: {
	table: ReactTable<DataTableFeatures, SubmissionRow, unknown>;
	submissions: SubmissionRow[];
}) {
	const groups = useMemo(
		() =>
			filterGroups.map((group) => {
				const order: readonly FilterValue[] = group.order;
				const values = [...new Set(submissions.map((s) => s[group.columnId]))];
				// Known values in their set order, then anything else, then missing
				const rank = (v: FilterValue) =>
					v === null ? Infinity : order.includes(v) ? order.indexOf(v) : order.length;

				values.sort((a, b) => rank(a) - rank(b) || String(a).localeCompare(String(b)));

				return { ...group, values };
			}),
		[submissions],
	);

	const selected = (columnId: string): FilterValue[] =>
		(table.getColumn(columnId)?.getFilterValue() as FilterValue[] | undefined) ?? [];

	const activeCount = groups.reduce((n, g) => n + selected(g.columnId).length, 0);

	function toggle(columnId: string, value: FilterValue, checked: boolean) {
		table
			.getColumn(columnId)
			?.setFilterValue((old: FilterValue[] | undefined = []) =>
				checked ? [...old, value] : old.filter((v) => v !== value),
			);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="sm"
						aria-label={
							activeCount > 0
								? `Filter submissions, ${activeCount} active`
								: "Filter submissions"
						}
					>
						<HugeiconsIcon icon={FilterHorizontalIcon} data-icon="inline-start" />
						Filter
						{activeCount > 0 && (
							<Badge className="h-4 min-w-4 px-1 tabular-nums">{activeCount}</Badge>
						)}
					</Button>
				}
			/>

			<DropdownMenuContent align="end" className="w-auto">
				{groups.map((group, i) => (
					<DropdownMenuGroup key={group.columnId}>
						{i > 0 && <DropdownMenuSeparator />}
						<DropdownMenuLabel>{group.label}</DropdownMenuLabel>

						{group.values.map((value) => (
							<DropdownMenuCheckboxItem
								key={value ?? "__unknown__"}
								checked={selected(group.columnId).includes(value)}
								onCheckedChange={(checked) =>
									toggle(group.columnId, value, checked)
								}
							>
								{group.format(value)}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuGroup>
				))}

				{activeCount > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => table.resetColumnFilters()}>
							Clear filters
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
