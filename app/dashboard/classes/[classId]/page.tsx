import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChallengeList } from "@/components/class/challenge-list";
import { ChallengeMap } from "@/components/class/challenge-map";
import { JoinCode } from "@/components/class/join-code";
import { LeaderboardList } from "@/components/class/leaderboard-list";
import { RosterList } from "@/components/class/roster-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { requireSessionUser } from "@/lib/auth/session";
import { isWithinUnlockRadius } from "@/lib/challenges/location";
import { getSavedPosition } from "@/lib/challenges/position";
import { createClient } from "@/lib/supabase/server";

export default async function ClassPage(props: PageProps<"/dashboard/classes/[classId]">) {
	const { classId } = await props.params;
	const id = Number(classId);

	if (!Number.isSafeInteger(id)) notFound();

	const user = await requireSessionUser();
	const supabase = await createClient();

	const isStudent = user.role === "student";

	// RLS decides who can see the class and its rows, so a missing class means
	// not found or not allowed
	const [
		classResult,
		challengesResult,
		enrollmentResult,
		leaderboardResult,
		solvedResult,
		position,
	] = await Promise.all([
		supabase
			.from("Classes")
			.select("ClassName, Description, ClassCode, ProfessorID")
			.eq("ClassID", id)
			.maybeSingle(),
		supabase
			.from("Challenges")
			.select(
				"ChallengeID, Title, Description, ChallengeType, Points, Hidden, Locations(Longitude, Latitude, Radius)",
			)
			.eq("ClassID", id)
			.order("CreatedAt"),
		supabase
			.from("Enrollment")
			.select("StudentID, Profile(Name, Email)")
			.eq("ClassID", id)
			.order("EnrolledAt"),
		supabase.rpc("get_class_leaderboard", { p_class_id: id }),
		isStudent
			? supabase
					.from("Submission")
					.select("ChallengeID")
					.eq("StudentID", user.id)
					.eq("Status", "correct")
			: null,
		isStudent ? getSavedPosition() : null,
	]);

	const c = classResult.data;

	if (!c) notFound();

	for (const result of [challengesResult, enrollmentResult, leaderboardResult, solvedResult]) {
		if (result?.error) console.error(result.error);
	}

	const isProfessor = c.ProfessorID === user.id;

	const solved = new Set(solvedResult?.data?.map((s) => s.ChallengeID));

	const allChallenges = challengesResult.data ?? [];

	// Students only see challenges they're standing near or have already solved
	const unlocked = new Set(
		allChallenges
			.filter(
				(ch) =>
					!isStudent ||
					solved.has(ch.ChallengeID) ||
					isWithinUnlockRadius(ch.Locations, position),
			)
			.map((ch) => ch.ChallengeID),
	);

	const challenges = allChallenges.filter((ch) => unlocked.has(ch.ChallengeID));

	// Pins show from the start unless the professor hid them, but locked ones
	// don't link anywhere
	const mapChallenges = allChallenges
		.filter((ch) => !ch.Hidden || unlocked.has(ch.ChallengeID))
		.flatMap((ch) =>
			ch.Locations.map((l) => ({
				id: ch.ChallengeID,
				title: ch.Title,
				longitude: l.Longitude,
				latitude: l.Latitude,
				radius: l.Radius,
				href: unlocked.has(ch.ChallengeID)
					? `/dashboard/classes/${classId}/challenges/${ch.ChallengeID}`
					: null,
			})),
		);

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
					<DashboardPageHeader
						title={c.ClassName}
						description={c.Description}
						actions={<JoinCode code={c.ClassCode} />}
					/>
				</div>
			</div>

			{isStudent && <ChallengeMap challenges={mapChallenges} />}

			<ChallengeList
				challenges={challenges}
				error={challengesResult.error}
				classId={classId}
				create={isProfessor}
				empty={
					!isStudent
						? undefined
						: position
							? {
									title: "No challenges nearby",
									description:
										"Walk around campus. Challenges show up here once you're close to one.",
								}
							: {
									title: "Finding challenges near you",
									description:
										"Allow location access so challenges show up when you're close to one.",
								}
				}
			/>

			<div className="grid items-start gap-6 lg:grid-cols-2">
				<LeaderboardList
					rows={leaderboardResult.data ?? []}
					error={leaderboardResult.error}
					viewerId={user.id}
				/>

				<RosterList
					students={roster}
					error={enrollmentResult.error}
					showEmails={isProfessor}
				/>
			</div>
		</>
	);
}
