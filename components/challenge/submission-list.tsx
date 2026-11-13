"use client";

import { ArrowRight01Icon, TaskDone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { GradeCell, GradePanel, GradingProvider } from "@/components/challenge/ai-grade";
import { SubmissionFilters } from "@/components/challenge/submission-filters";
import { StatusBadge } from "@/components/challenge/submission-status";
import { SubmittedCode } from "@/components/challenge/submitted-code";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import {
	DataTable,
	type DataTableFeatures,
	dataTableFeatures,
	expandedRowId,
} from "@/components/class/data-table";
import { StudentAvatar } from "@/components/class/student-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { languageLabel } from "@/lib/challenges/languages";

export interface SubmissionRow {
	id: number;
	studentName: string;
	language: string | null;
	status: string | null;
	score: number | null;
	submittedAt: string;
	code: string | null;
}

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
	helper.display({
		id: "aiGrade",
		header: "AI grade",
		cell: (info) => <GradeCell row={info.row} />,
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
		<GradingProvider>
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
						renderExpanded={(row) => (
							<div className="flex flex-col gap-2">
								<GradePanel submissionId={row.original.id} />
								<SubmittedCode submission={row.original} />
							</div>
						)}
					/>
				)}
			</ClassSection>
		</GradingProvider>
	);
}
