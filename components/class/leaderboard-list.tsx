import { RankingIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import { StudentAvatar } from "@/components/class/student-avatar";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/supabase/database.types";

type LeaderboardRow = Database["public"]["Functions"]["get_class_leaderboard"]["Returns"][number];

// sort by score, any ties share the same rank
function rank(rows: LeaderboardRow[]) {
	const sorted = rows.toSorted(
		(a, b) => b.total_score - a.total_score || a.student_name.localeCompare(b.student_name),
	);

	return sorted.map((row) => ({
		...row,
		rank: sorted.findIndex((r) => r.total_score === row.total_score) + 1,
	}));
}

export function LeaderboardList({
	rows,
	error,
	viewerId,
}: {
	rows: LeaderboardRow[];
	error: unknown;
	viewerId: string;
}) {
	const entries = rank(rows);

	return (
		<ClassSection id="leaderboard" title="Leaderboard" icon={RankingIcon}>
			{error ? (
				<SectionError what="the leaderboard" />
			) : entries.length === 0 ? (
				<SectionEmpty
					icon={RankingIcon}
					title="No rankings yet"
					description="Students show up here once they complete challenges."
				/>
			) : (
				<ol className="flex flex-col gap-0.5">
					{entries.map((entry) => {
						const isViewer = entry.student_id === viewerId;
						const podium = entry.total_score > 0 && entry.rank <= 3;

						return (
							<li
								key={entry.student_id}
								className={cn(
									"flex items-center gap-3 rounded-2xl px-3 py-2.5",
									isViewer && "bg-emerald-50/70",
								)}
							>
								<span
									className={cn(
										"w-6 shrink-0 text-center text-label tabular-nums",
										podium ? "text-foreground" : "text-muted-foreground",
									)}
								>
									{entry.rank}
								</span>

								<StudentAvatar name={entry.student_name} />

								<span className="flex min-w-0 flex-1 items-center gap-2">
									<span className="truncate text-label">
										{entry.student_name}
									</span>

									{isViewer && <Badge variant="secondary">You</Badge>}

									{podium && entry.rank === 1 && (
										<Badge className="bg-wsu-gold/25 text-foreground">
											Top
										</Badge>
									)}
								</span>

								<span className="shrink-0 text-label tabular-nums">
									{entry.total_score}
									<span className="ml-1 text-caption text-muted-foreground">
										pts
									</span>
								</span>
							</li>
						);
					})}
				</ol>
			)}
		</ClassSection>
	);
}
