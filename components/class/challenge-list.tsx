import { Flag02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Tables } from "@/supabase/database.types";

type Challenge = Pick<
	Tables<"Challenges">,
	"ChallengeID" | "Title" | "Description" | "ChallengeType" | "Points"
>;

export function ChallengeList({
	challenges,
	error,
	classId,
	create,
	empty = {
		title: "No challenges yet",
		description: "Challenges added to this class will show up here.",
	},
}: {
	challenges: Challenge[];
	error: unknown;
	classId: string;
	create?: boolean;
	empty?: { title: string; description: string };
}) {
	const createButton = create ? (
		<Link
			className={buttonVariants({ size: "sm" })}
			href={`/dashboard/classes/${classId}/challenges/new`}
		>
			Create a challenge
		</Link>
	) : null;

	const isEmpty = !error && challenges.length === 0;

	return (
		<ClassSection
			id="challenges"
			title="Challenges"
			icon={Flag02Icon}
			count={challenges.length}
			action={isEmpty ? null : createButton}
		>
			{error ? (
				<SectionError what="challenges" />
			) : isEmpty ? (
				<SectionEmpty
					icon={Flag02Icon}
					title={empty.title}
					description={empty.description}
					actions={createButton}
				/>
			) : (
				<ol className="flex flex-col">
					{challenges.map((ch, i) => (
						<li
							key={ch.ChallengeID}
							className="relative flex items-start gap-4 rounded-2xl px-3 py-3.5 transition-colors has-[a:hover]:bg-muted/60 sm:px-4"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-caption text-muted-foreground tabular-nums">
								{i + 1}
							</span>

							<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
								<div className="flex min-w-0 flex-col gap-0.5 pt-1">
									<h3 className="text-label">
										<Link
											className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
											href={`/dashboard/classes/${classId}/challenges/${ch.ChallengeID}`}
										>
											{ch.Title}
										</Link>
									</h3>

									{ch.Description && (
										<p className="line-clamp-2 text-body-sm text-pretty text-muted-foreground">
											{ch.Description}
										</p>
									)}
								</div>

								<div className="flex shrink-0 items-center gap-1.5 sm:pt-1.5">
									{ch.ChallengeType && (
										<Badge className="capitalize" variant="outline">
											{ch.ChallengeType}
										</Badge>
									)}

									<Badge className="bg-emerald-50 text-wsu-green tabular-nums">
										{ch.Points} pts
									</Badge>
								</div>
							</div>
						</li>
					))}
				</ol>
			)}
		</ClassSection>
	);
}
