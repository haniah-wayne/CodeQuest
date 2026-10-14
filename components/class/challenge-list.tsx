import { Flag02Icon } from "@hugeicons/core-free-icons";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/supabase/database.types";

type Challenge = Pick<
	Tables<"Challenges">,
	"ChallengeID" | "Title" | "Description" | "ChallengeType" | "Points"
>;

export function ChallengeList({ challenges, error }: { challenges: Challenge[]; error: unknown }) {
	return (
		<ClassSection
			id="challenges"
			title="Challenges"
			icon={Flag02Icon}
			count={challenges.length}
		>
			{error ? (
				<SectionError what="challenges" />
			) : challenges.length === 0 ? (
				<SectionEmpty
					icon={Flag02Icon}
					title="No challenges yet"
					description="Challenges added to this class will show up here."
				/>
			) : (
				<ol className="flex flex-col">
					{challenges.map((ch, i) => (
						<li
							key={ch.ChallengeID}
							className="flex items-start gap-4 rounded-2xl px-3 py-3.5 sm:px-4"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-caption text-muted-foreground tabular-nums">
								{i + 1}
							</span>

							<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
								<div className="flex min-w-0 flex-col gap-0.5 pt-1">
									<h3 className="text-label">{ch.Title}</h3>

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
