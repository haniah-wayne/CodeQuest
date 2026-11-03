"use client";

import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import {
	DataTable,
	type DataTableFeatures,
	dataTableFeatures,
} from "@/components/class/data-table";
import { StudentAvatar } from "@/components/class/student-avatar";
import { Input } from "@/components/ui/input";

interface RosterStudent {
	id: string;
	name: string;
	email: string | null;
}

const helper = createColumnHelper<DataTableFeatures, RosterStudent>();

const nameColumn = helper.accessor("name", {
	header: "Name",
	cell: (info) => (
		<span className="flex min-w-0 items-center gap-3">
			<StudentAvatar name={info.getValue()} />
			<span className="truncate text-label">{info.getValue()}</span>
		</span>
	),
});

const emailColumn = helper.accessor("email", {
	header: "Email",
	cell: (info) => <span className="text-muted-foreground">{info.getValue() ?? "—"}</span>,
});

const professorColumns = helper.columns([nameColumn, emailColumn]);
const studentColumns = helper.columns([nameColumn]);

export function RosterList({
	students,
	error,
	showEmails,
}: {
	students: RosterStudent[];
	error: boolean;
	showEmails: boolean;
}) {
	const table = useTable({
		features: dataTableFeatures,
		columns: showEmails ? professorColumns : studentColumns,
		data: students,
		getRowId: (student) => student.id,
		enableSorting: false,
		globalFilterFn: "includesString",
		getColumnCanGlobalFilter: () => true,
	});

	const search: string = table.state.globalFilter ?? "";
	const label = showEmails ? "Search by name or email" : "Search by name";

	const isEmpty = !error && students.length === 0;

	return (
		<ClassSection
			id="roster"
			title="Roster"
			icon={UserGroupIcon}
			count={students.length}
			action={
				error || isEmpty ? null : (
					<Input
						type="search"
						className="h-8 w-36 sm:w-56"
						placeholder={label}
						aria-label={label}
						value={search}
						onChange={(e) => table.setGlobalFilter(e.target.value)}
					/>
				)
			}
		>
			{error ? (
				<SectionError what="the roster" />
			) : isEmpty ? (
				<SectionEmpty
					icon={UserGroupIcon}
					title="No students yet"
					description="Share the join code with your students so they can join."
				/>
			) : (
				<DataTable table={table} emptyMessage={`No students match “${search}”`} />
			)}
		</ClassSection>
	);
}
