import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmissionList } from "@/components/challenge/submission-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function SubmissionsPage(
	props: PageProps<"/dashboard/classes/[classId]/challenges/[challengeId]/submissions">,
) {
	const params = await props.params;
	const classId = Number(params.classId);
	const challengeId = Number(params.challengeId);

	if (!Number.isSafeInteger(classId) || !Number.isSafeInteger(challengeId)) notFound();

	const user = await requireSessionUser();
	const supabase = await createClient();

	const challengeResult = await supabase
		.from("Challenges")
		.select("Title, Points, Classes(ClassName, ProfessorID)")
		.eq("ChallengeID", challengeId)
		.eq("ClassID", classId)
		.maybeSingle();

	const challenge = challengeResult.data;

	if (challengeResult.error) console.error(challengeResult.error);

	// Only the class's professor can review submissions
	if (!challenge || challenge.Classes.ProfessorID !== user.id) notFound();

	const [submissionsResult, rosterResult] = await Promise.all([
		supabase
			.from("Submission")
			.select("SubmissionID, StudentID, Code, Language, Status, Score, SubmittedAt")
			.eq("ChallengeID", challengeId)
			.order("SubmittedAt", { ascending: false }),
		supabase.rpc("get_class_roster", { p_class_id: classId }),
	]);

	for (const { error } of [submissionsResult, rosterResult]) {
		if (error) console.error(error);
	}

	const names = new Map(
		(rosterResult.data ?? []).map((r) => [r.student_id, r.student_name] as const),
	);

	const submissions = (submissionsResult.data ?? []).map((s) => ({
		id: s.SubmissionID,
		// Students who have left the class drop off the roster
		studentName: names.get(s.StudentID) ?? "Former student",
		language: s.Language,
		status: s.Status,
		score: s.Score,
		submittedAt: s.SubmittedAt,
		code: s.Code,
	}));

	return (
		<>
			<div className="flex flex-col gap-6">
				<Link
					className="flex w-fit items-center gap-1.5 rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					href={`/dashboard/classes/${classId}`}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
					{challenge.Classes.ClassName}
				</Link>

				<div className="flex flex-col gap-4">
					<DashboardPageHeader
						title={challenge.Title}
						description="Review every submission students have made for this challenge."
						actions={
							<Badge className="bg-emerald-50 text-wsu-green tabular-nums">
								{challenge.Points} pts
							</Badge>
						}
					/>
				</div>
			</div>

			<SubmissionList submissions={submissions} error={submissionsResult.error !== null} />
		</>
	);
}
