import { ArrowLeft01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeWorkspace } from "@/components/challenge/code-workspace";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { requireSessionUser } from "@/lib/auth/session";
import { DEFAULT_LANGUAGE, isLanguageId } from "@/lib/challenges/languages";
import { createClient } from "@/lib/supabase/server";

export default async function ChallengePage(
	props: PageProps<"/dashboard/classes/[classId]/challenges/[challengeId]">,
) {
	const params = await props.params;
	const classId = Number(params.classId);
	const challengeId = Number(params.challengeId);

	if (!Number.isSafeInteger(classId) || !Number.isSafeInteger(challengeId)) notFound();

	const user = await requireSessionUser();
	const supabase = await createClient();

	// RLS decides who can see the challenge, so a missing row means not found
	// or not allowed
	const [challengeResult, submissionsResult] = await Promise.all([
		supabase
			.from("Challenges")
			.select(
				"Title, Description, Instructions, Points, Classes(ClassName, ProfessorID, color)",
			)
			.eq("ChallengeID", challengeId)
			.eq("ClassID", classId)
			.maybeSingle(),
		supabase
			.from("Submission")
			.select("Code, Language, Score")
			.eq("ChallengeID", challengeId)
			.eq("StudentID", user.id)
			.order("SubmittedAt", { ascending: false }),
	]);

	const challenge = challengeResult.data;

	if (!challenge) {
		if (challengeResult.error) console.error(challengeResult.error);

		notFound();
	}

	if (challenge.Classes.ProfessorID === user.id) {
		// TODO: professor view
		return null;
	}

	if (submissionsResult.error) console.error(submissionsResult.error);

	const submissions = submissionsResult.data ?? [];
	const latest = submissions[0];
	const solved = submissions.some((s) => (s.Score ?? 0) > 0);

	// Pick up where the student left off with their last submission
	const initialLanguage = isLanguageId(latest?.Language) ? latest.Language : DEFAULT_LANGUAGE;
	const initialCode = latest && isLanguageId(latest.Language) ? latest.Code : null;

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
					<span
						aria-hidden
						className="h-1.5 w-10 rounded-full bg-wsu-green"
						style={
							challenge.Classes.color
								? { backgroundColor: challenge.Classes.color }
								: undefined
						}
					/>

					<DashboardPageHeader
						title={challenge.Title}
						description={challenge.Description}
						actions={
							<>
								{solved && (
									<Badge className="bg-emerald-50 text-wsu-green">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											data-icon="inline-start"
										/>
										Solved
									</Badge>
								)}

								<Badge className="bg-emerald-50 text-wsu-green tabular-nums">
									{challenge.Points} pts
								</Badge>
							</>
						}
					/>
				</div>
			</div>

			<div
				className={
					challenge.Instructions
						? "grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
						: "flex flex-col"
				}
			>
				{challenge.Instructions && (
					<section
						className="flex min-w-0 flex-col gap-3 rounded-3xl border border-accent bg-white px-5 py-4 sm:px-6 lg:sticky lg:top-28"
						aria-labelledby="instructions-heading"
					>
						<h2 className="text-label" id="instructions-heading">
							Instructions
						</h2>

						<p className="text-body-sm whitespace-pre-wrap text-muted-foreground">
							{challenge.Instructions}
						</p>
					</section>
				)}

				<CodeWorkspace
					challengeId={challengeId}
					initialLanguage={initialLanguage}
					initialCode={initialCode}
					solved={solved}
				/>
			</div>
		</>
	);
}
