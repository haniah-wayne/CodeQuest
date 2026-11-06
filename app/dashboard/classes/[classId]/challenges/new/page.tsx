import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { ChallengeForm } from "@/components/challenge/challenge-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { createChallenge } from "./actions";

export default async function CreateChallengePage(
	props: PageProps<"/dashboard/classes/[classId]/challenges/new">,
) {
	const { classId } = await props.params;

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
					title="New challenge"
					description="Write a problem, then pin it somewhere on campus. Students have to be within the radius to unlock and solve it."
				/>
			</div>

			<ChallengeForm
				classId={classId}
				action={createChallenge}
				submitLabel="Create challenge"
				pendingLabel="Creating challenge…"
			/>
		</>
	);
}
