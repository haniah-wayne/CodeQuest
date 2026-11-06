"use client";

import {
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	FilterHorizontalIcon,
	TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, type ReactTable, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { useMemo } from "react";
import { CodeEditor } from "@/components/challenge/code-editor";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import {
	DataTable,
	type DataTableFeatures,
	dataTableFeatures,
	expandedRowId,
} from "@/components/class/data-table";
import { StudentAvatar } from "@/components/class/student-avatar";
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
import { Input } from "@/components/ui/input";
import { isLanguageId, LANGUAGE_IDS, LANGUAGES } from "@/lib/challenges/languages";

export interface SubmissionRow {
	id: number;
	studentName: string;
	language: string | null;
	status: string | null;
	score: number | null;
	submittedAt: string;
	code: string | null;
}

interface FilterGroup {
	columnId: keyof SubmissionRow;
	label: string;
	order: readonly string[];
	format: (value: string | null) => string;
}

function languageLabel(language: string | null) {
	return isLanguageId(language) ? LANGUAGES[language].label : (language ?? "Unknown");
}

const statusLabels: Record<string, string> = { correct: "Correct", incorrect: "Incorrect" };

function statusLabel(status: string | null) {
	return status === null ? "Unknown" : (statusLabels[status] ?? status);
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
		order: Object.keys(statusLabels),
		format: statusLabel,
	},
] as const satisfies FilterGroup[];

type FilterValue = string | null;

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

const helper = createColumnHelper<DataTableFeatures, SubmissionRow>();

const columns = helper.columns([
	helper.accessor("studentName", {
		header: "Student",
		sortFn: "alphanumeric",
		cell: (info) => {
			const row = info.row;
			const expanded = row.getIsExpanded();

			return (
				<span className="flex min-w-0 items-center gap-2">
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label={`${expanded ? "Hide" : "Show"} code for ${info.getValue()}`}
						aria-expanded={expanded}
						aria-controls={expanded ? expandedRowId(row.id) : undefined}
						onClick={row.getToggleExpandedHandler()}
					>
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className={cn("transition-transform", expanded && "rotate-90")}
						/>
					</Button>

					<StudentAvatar name={info.getValue()} size="sm" />
					<span className="truncate text-label">{info.getValue()}</span>
				</span>
			);
		},
	}),
	helper.accessor("language", {
		header: "Language",
		sortFn: "alphanumeric",
		filterFn: "arrHas",
		cell: (info) => {
			const language = info.getValue();

			return (
				<span className="text-muted-foreground">
					{language === null ? "—" : languageLabel(language)}
				</span>
			);
		},
	}),
	helper.accessor("status", {
		header: "Status",
		sortFn: "alphanumeric",
		filterFn: "arrHas",
		cell: (info) => <StatusBadge status={info.getValue()} />,
	}),
	helper.accessor("score", {
		header: "Score",
		sortFn: "basic",
		cell: (info) => <span className="tabular-nums">{info.getValue() ?? "—"}</span>,
	}),
	helper.accessor("submittedAt", {
		header: "Submitted",
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
	}),
]);

export function SubmissionList({
	submissions,
	error,
}: {
	submissions: SubmissionRow[];
	error: boolean;
}) {
	const table = useTable({
		features: dataTableFeatures,
		columns,
		data: submissions,
		getRowId: (s) => String(s.id),
		getRowCanExpand: () => true,
		globalFilterFn: "includesString",
		getColumnCanGlobalFilter: (column) => column.id === "studentName",
		initialState: { sorting: [{ id: "submittedAt", desc: true }] },
	});

	const search: string = table.state.globalFilter ?? "";
	const filtered = table.state.columnFilters.length > 0;
	const isEmpty = !error && submissions.length === 0;

	const emptyMessage = search
		? `No submissions match “${search}”${filtered ? " with the selected filters" : ""}`
		: "No submissions match the selected filters";

	return (
		<ClassSection
			id="submissions"
			title="Submissions"
			icon={TaskDone01Icon}
			count={submissions.length}
			action={
				error || isEmpty ? null : (
					<div className="flex items-center gap-2">
						<Input
							type="search"
							className="h-8 w-36 bg-card sm:w-56"
							placeholder="Search by student"
							aria-label="Search by student"
							value={search}
							onChange={(e) => table.setGlobalFilter(e.target.value)}
						/>
						<SubmissionFilters table={table} submissions={submissions} />
					</div>
				)
			}
		>
			{error ? (
				<SectionError what="submissions" />
			) : isEmpty ? (
				<SectionEmpty
					icon={TaskDone01Icon}
					title="No submissions yet"
					description="Student submissions for this challenge will show up here."
				/>
			) : (
				<DataTable
					table={table}
					emptyMessage={emptyMessage}
					renderExpanded={(row) => <SubmittedCode submission={row.original} />}
				/>
			)}
		</ClassSection>
	);
}

function SubmissionFilters({
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
						className="bg-card"
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

function SubmittedCode({ submission }: { submission: SubmissionRow }) {
	const { code, language } = submission;

	if (!code) {
		return <p className="px-3 py-4 text-body-sm text-muted-foreground">No code was saved.</p>;
	}

	return (
		<div className="overflow-hidden rounded-(--panel-inner-radius) bg-card smooth-shadow-ring-sm">
			{isLanguageId(language) ? (
				<CodeEditor language={language} value={code} onChange={() => {}} readOnly />
			) : (
				<pre className="m-0 overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre">
					{code}
				</pre>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string | null }) {
	switch (status) {
		case "correct":
			return (
				<Badge>
					<HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" />
					Correct
				</Badge>
			);
		case "incorrect":
			return <Badge variant="destructive">Incorrect</Badge>;
		default:
			return <Badge variant="secondary">{status ?? "Unknown"}</Badge>;
	}
}
