"use client";

import {
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { cn } from "cn";
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
import { Input } from "@/components/ui/input";
import { isLanguageId, LANGUAGES } from "@/lib/challenges/languages";

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
		cell: (info) => {
			const language = info.getValue();

			return (
				<span className="text-muted-foreground">
					{isLanguageId(language) ? LANGUAGES[language].label : (language ?? "—")}
				</span>
			);
		},
	}),
	helper.accessor("status", {
		header: "Status",
		sortFn: "alphanumeric",
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
	const isEmpty = !error && submissions.length === 0;

	return (
		<ClassSection
			id="submissions"
			title="Submissions"
			icon={TaskDone01Icon}
			count={submissions.length}
			action={
				error || isEmpty ? null : (
					<Input
						type="search"
						className="h-8 w-36 sm:w-56"
						placeholder="Search by student"
						aria-label="Search by student"
						value={search}
						onChange={(e) => table.setGlobalFilter(e.target.value)}
					/>
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
					emptyMessage={`No submissions match “${search}”`}
					renderExpanded={(row) => <SubmittedCode submission={row.original} />}
				/>
			)}
		</ClassSection>
	);
}

function SubmittedCode({ submission }: { submission: SubmissionRow }) {
	const { code, language } = submission;

	if (!code) {
		return <p className="px-3 py-4 text-body-sm text-muted-foreground">No code was saved.</p>;
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
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
				<Badge className="bg-emerald-50 text-wsu-green">
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
