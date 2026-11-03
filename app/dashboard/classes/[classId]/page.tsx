import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ChallengeStatus, ChallengeList } from "@/components/class/challenge-list";
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
	const [classResult, challengesResult, rosterResult, leaderboardResult] = await Promise.all([
		supabase
			.from("Classes")
			.select("ClassName, Description, ClassCode, ProfessorID")
			.eq("ClassID", id)
			.maybeSingle(),
		supabase
			.from("Challenges")
			.select("ChallengeID, Title, Description, Points, CreatedAt, Submission(Status)")
			.eq("ClassID", id)
			.eq("Submission.StudentID", user.id)
			.order("CreatedAt"),
		supabase.rpc("get_class_roster", { p_class_id: id }),
		supabase.rpc("get_class_leaderboard", { p_class_id: id }),
	]);

	const c = classResult.data;

	if (!c) notFound();

	for (const { error } of [challengesResult, rosterResult, leaderboardResult]) {
		if (error) console.error(error);
	}

	const isProfessor = c.ProfessorID === user.id;

	const challenges = (challengesResult.data ?? []).map(({ Submission: submissions, ...ch }) => {
		const status: ChallengeStatus = submissions.some((s) => s.Status === "correct")
			? "solved"
			: submissions.length > 0
				? "attempted"
				: "not_started";

		return { ...ch, status };
	});

	// only professors get emails
	const roster = (rosterResult.data ?? [])
		.map((r) => ({
			id: r.student_id,
			name: r.student_name,
			email: isProfessor ? r.student_email : null,
		}))
		.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

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
					<DashboardPageHeader
						title={c.ClassName}
						description={c.Description}
						actions={<JoinCode code={c.ClassCode} />}
					/>
				</div>
			</div>

			<ChallengeList
				challenges={challenges}
				error={challengesResult.error !== null}
				classId={classId}
				create={isProfessor}
				showStatus={!isProfessor}
				showActions={isProfessor}
			/>

			<div className="grid items-start gap-6 lg:grid-cols-2">
				<LeaderboardList
					rows={leaderboardResult.data ?? []}
					error={leaderboardResult.error}
					viewerId={user.id}
				/>

				<RosterList
					students={roster}
					error={rosterResult.error !== null}
					showEmails={isProfessor}
				/>
			</div>
		</>
	);
}
