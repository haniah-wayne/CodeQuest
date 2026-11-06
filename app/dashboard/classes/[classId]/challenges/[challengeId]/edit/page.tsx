import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateChallenge } from "@/app/dashboard/classes/[classId]/challenges/new/actions";
import { ChallengeForm } from "@/components/challenge/challenge-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { requireSessionUser } from "@/lib/auth/session";
import { DEFAULT_UNLOCK_RADIUS, UNLOCK_RADII, type UnlockRadius } from "@/lib/challenges/location";
import { createClient } from "@/lib/supabase/server";

function isUnlockRadius(radius: number): radius is UnlockRadius {
	return (UNLOCK_RADII as readonly number[]).includes(radius);
}

export default async function EditChallengePage(
	props: PageProps<"/dashboard/classes/[classId]/challenges/[challengeId]/edit">,
) {
	const params = await props.params;
	const classId = Number(params.classId);
	const challengeId = Number(params.challengeId);

	if (!Number.isSafeInteger(classId) || !Number.isSafeInteger(challengeId)) notFound();

	const user = await requireSessionUser();
	const supabase = await createClient();

	const { data: challenge, error } = await supabase
		.from("Challenges")
		.select(
			"Title, Description, Points, Hidden, Classes(ProfessorID), Solutions(Solution), Locations(Longitude, Latitude, Radius)",
		)
		.eq("ChallengeID", challengeId)
		.eq("ClassID", classId)
		.maybeSingle();

	if (error) console.error(error);

	// Only the class's professor can edit, so anyone else gets a 404
	if (!challenge || challenge.Classes.ProfessorID !== user.id) notFound();

	const solution = challenge.Solutions?.Solution;
	const location = challenge.Locations[0];

	if (solution === undefined || !location) {
		console.error(`Challenge ${challengeId} is missing its solution or location`);

		notFound();
	}

	return (
		<>
			<div className="flex flex-col gap-6">
				<Link
					className="flex w-fit items-center gap-1.5 rounded-sm text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					href={`/dashboard/classes/${classId}`}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
					Back to class
				</Link>

				<DashboardPageHeader
					title="Edit challenge"
					description="Update the problem, its expected output, or where it's pinned."
				/>
			</div>

			<ChallengeForm
				classId={params.classId}
				challengeId={challengeId}
				action={updateChallenge}
				submitLabel="Save changes"
				pendingLabel="Saving changes…"
				initial={{
					title: challenge.Title,
					description: challenge.Description ?? "",
					solution,
					points: challenge.Points,
					location: { longitude: location.Longitude, latitude: location.Latitude },
					// Older challenges may use a radius that's no longer offered
					radius: isUnlockRadius(location.Radius)
						? location.Radius
						: DEFAULT_UNLOCK_RADIUS,
					hidden: challenge.Hidden,
				}}
			/>
		</>
	);
}
