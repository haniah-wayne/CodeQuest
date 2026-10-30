"use client";
import {
	columnFilteringFeature,
	createColumnHelper,
	createFilteredRowModel,
	filterFn_includesString,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { RosterList } from "./class/roster-list";

type Student = {
	id: string;
	name: string;
	email: string | null;
};

const features = tableFeatures({
	columnFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: {
		includesString: filterFn_includesString,
	},
});

const columnHelper = createColumnHelper<typeof features, Student>();

const columns = columnHelper.columns([
	columnHelper.accessor("name", {
		header: "Name",
		cell: (info) => info.getValue(),
		filterFn: "includesString",
	}),
]);

type StudentRosterProps = {
	data: Student[];
	error: string | null;
	showEmails: boolean;
};

export function StudentRosterTable({ data, error, showEmails }: StudentRosterProps) {
	const table = useTable(
		{
			features,
			columns,
			data,
			debugTable: true,
			debugColumns: true,
		},
		(state) => state,
	);

	const filteredStudents = table.getRowModel().rows.map((row) => row.original);

	return (
		<div className="space-y-6">
			<Input
				placeholder="Search student name..."
				value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
				onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
				className="max-w-sm"
			/>

			<RosterList students={filteredStudents} error={error} showEmails={showEmails} />
		</div>
	);
}
