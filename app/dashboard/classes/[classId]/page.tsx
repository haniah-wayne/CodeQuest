import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChallengeList } from "@/components/class/challenge-list";
import { JoinCode } from "@/components/class/join-code";
import { LeaderboardList } from "@/components/class/leaderboard-list";
import { RosterList } from "@/components/class/roster-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function ClassPage(props: PageProps<"/dashboard/classes/[classId]">) {
	const { classId } = await props.params;
	const id = Number(classId);

	if (!Number.isSafeInteger(id)) notFound();

	const user = await requireSessionUser();
	const supabase = await createClient();

	// RLS decides who can see the class and its rows, so a missing class means
	// not found or not allowed
	const [classResult, challengesResult, enrollmentResult, submissionsResult] = await Promise.all([
		supabase
			.from("Classes")
			.select("ClassName, Description, ClassCode, ProfessorID, color")
			.eq("ClassID", id)
			.maybeSingle(),
		supabase
			.from("Challenges")
			.select("ChallengeID, Title, Description, ChallengeType, Points")
			.eq("ClassID", id)
			.order("CreatedAt"),
		supabase
			.from("Enrollment")
			.select("StudentID, Profile(Name, Email)")
			.eq("ClassID", id)
			.order("EnrolledAt"),
		supabase
			.from("Submission")
			.select("StudentID, ChallengeID, Score, Challenges!inner(ClassID)")
			.eq("Challenges.ClassID", id),
	]);

	const c = classResult.data;

	if (!c) notFound();

	for (const { error } of [challengesResult, enrollmentResult, submissionsResult]) {
		if (error) console.error(error);
	}

	const isProfessor = c.ProfessorID === user.id;

	const challenges = challengesResult.data ?? [];

	const roster = (enrollmentResult.data ?? []).map((e) => ({
		id: e.StudentID,
		name: e.Profile.Name,
		email: e.Profile.Email,
	}));

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

			<ChallengeList challenges={challenges} error={challengesResult.error} />

			<div className="grid items-start gap-6 lg:grid-cols-2">
				<LeaderboardList />

				<RosterList
					students={roster}
					error={enrollmentResult.error}
					showEmails={isProfessor}
				/>
			</div>
		</>
	);
}
