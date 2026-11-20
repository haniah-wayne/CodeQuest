import { ArrowLeft01Icon, CheckmarkCircle02Icon, TestTube01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeWorkspace } from "@/components/challenge/code-workspace";
import { SubmissionFeedback } from "@/components/challenge/submission-feedback";
import { SubmissionList } from "@/components/challenge/submission-list";
import { ClassRealtime } from "@/components/class/class-realtime";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader, PanelIcon, PanelSurface } from "@/components/ui/panel";
import { requireSessionUser } from "@/lib/auth/session";
import { DEFAULT_LANGUAGE, isLanguageId } from "@/lib/challenges/languages";
import { isWithinUnlockRadius } from "@/lib/challenges/location";
import { getSavedPosition } from "@/lib/challenges/position";
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
	const [challengeResult, submissionResult, position] = await Promise.all([
		supabase
			.from("Challenges")
			.select(
				"Title, Description, Points, Classes(ClassName, ProfessorID), Locations(Longitude, Latitude, Radius), TestCase(Input, ExpectedOutput)",
			)
			.eq("ChallengeID", challengeId)
			.eq("ClassID", classId)
			.order("TestCaseID", { referencedTable: "TestCase" })
			.maybeSingle(),
		supabase
			.from("Submission")
			.select("Code, Language, Status, SubmittedAt, Feedback")
			.eq("ChallengeID", challengeId)
			.eq("StudentID", user.id)
			.maybeSingle(),
		getSavedPosition(),
	]);

	const challenge = challengeResult.data;

	if (!challenge) {
		if (challengeResult.error) console.error(challengeResult.error);

		notFound();
	}

	if (challenge.Classes.ProfessorID === user.id) {
		return <ProfessorView classId={classId} challengeId={challengeId} challenge={challenge} />;
	}

	if (submissionResult.error) {
		console.error(submissionResult.error);
	}

	const submission = submissionResult.data;
	const solved = submission?.Status === "correct";

	// Locked challenges stay hidden even if the student has the link
	if (!solved && !isWithinUnlockRadius(challenge.Locations, position)) {
		notFound();
	}

	const initialLanguage = isLanguageId(submission?.Language)
		? submission.Language
		: DEFAULT_LANGUAGE;

	const initialCode = submission && isLanguageId(submission.Language) ? submission.Code : null;
	// Only the first test case is shown, the rest are kept for grading
	const examples = challenge.TestCase.slice(0, 1);

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
						description={challenge.Description}
						actions={
							<>
								{solved && (
									<Badge>
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											data-icon="inline-start"
										/>
										Solved
									</Badge>
								)}

								<Badge className="bg-wsu-gold text-wsu-green tabular-nums">
									{challenge.Points} pts
								</Badge>
							</>
						}
					/>
				</div>
			</div>

			{submission?.Feedback && (
				<SubmissionFeedback
					status={submission.Status}
					submittedAt={submission.SubmittedAt}
					feedback={submission.Feedback}
				/>
			)}

			{examples.length > 0 && <Examples examples={examples} />}

			<CodeWorkspace
				challengeId={challengeId}
				initialLanguage={initialLanguage}
				initialCode={initialCode}
				solved={solved}
				exampleInput={examples[0]?.Input ?? ""}
			/>
		</>
	);
}

//shows visible test cases only
function Examples({
	examples,
}: {
	examples: { Input: string | null; ExpectedOutput: string | null }[];
}) {
	return (
		<Panel aria-labelledby="examples-heading">
			<PanelHeader>
				<PanelIcon icon={TestTube01Icon} />

				<h2 className="text-label" id="examples-heading">
					Examples
				</h2>
			</PanelHeader>

			<PanelSurface className="flex flex-col gap-4 p-5 sm:p-6">
				<p className="text-caption text-muted-foreground">
					Your program reads the input from stdin and must print the output exactly.
					Don&apos;t print prompts like &quot;Enter a number&quot;. Run uses the first
					example&apos;s input.
				</p>

				<ol className="flex flex-col gap-4">
					{examples.map((example, index) => (
						<li key={index} className="grid gap-3 sm:grid-cols-2">
							{[
								["Input", example.Input],
								["Output", example.ExpectedOutput],
							].map(([label, value]) => (
								<div key={label} className="flex min-w-0 flex-col gap-1">
									<span className="text-caption text-muted-foreground">
										{label} {index + 1}
									</span>

									<pre className="m-0 overflow-auto rounded-xl bg-muted px-3 py-2 font-mono text-sm whitespace-pre-wrap">
										{value || (
											<span className="text-muted-foreground italic">
												(empty)
											</span>
										)}
									</pre>
								</div>
							))}
						</li>
					))}
				</ol>
			</PanelSurface>
		</Panel>
	);
}

async function ProfessorView({
	classId,
	challengeId,
	challenge,
}: {
	classId: number;
	challengeId: number;
	challenge: { Title: string; Points: number; Classes: { ClassName: string } };
}) {
	const supabase = await createClient();

	const [submissionsResult, rosterResult] = await Promise.all([
		supabase
			.from("Submission")
			.select("SubmissionID, StudentID, Code, Language, Status, Score, SubmittedAt, Feedback")
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
		maxScore: challenge.Points,
		submittedAt: s.SubmittedAt,
		code: s.Code,
		feedback: s.Feedback,
	}));

	return (
		<>
			<ClassRealtime classId={classId} />

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
						description="Review each student's latest submission for this challenge."
						actions={
							<Badge className="bg-wsu-gold text-wsu-green tabular-nums">
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
