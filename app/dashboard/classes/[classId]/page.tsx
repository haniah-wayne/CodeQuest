import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinCode } from "@/components/class/join-code";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { createClient } from "@/lib/supabase/server";

export default async function ClassPage(props: PageProps<"/dashboard/classes/[classId]">) {
	const { classId } = await props.params;
	const id = Number(classId);

	if (!Number.isSafeInteger(id)) notFound();

	const supabase = await createClient();

	// RLS decides who can see the class and its rows, so a missing class means
	// not found or not allowed
	const classResult = await supabase
		.from("Classes")
		.select("ClassName, Description, ClassCode, ProfessorID, color")
		.eq("ClassID", id)
		.maybeSingle();

	if (classResult.error) {
		console.error(classResult.error);
	}

	const c = classResult.data;

	if (!c) notFound();

	return (
		<>
			<div className="flex flex-col gap-6">
				<Link
					className="flex w-fit items-center gap-1.5 rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					href="/dashboard"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
					All classes
				</Link>

				<div className="flex flex-col gap-4">
					<span
						aria-hidden
						className="h-1.5 w-10 rounded-full bg-wsu-green"
						style={c.color ? { backgroundColor: c.color } : undefined}
					/>

					<DashboardPageHeader
						title={c.ClassName}
						description={c.Description}
						actions={<JoinCode code={c.ClassCode} />}
					/>
				</div>
			</div>
		</>
	);
}
