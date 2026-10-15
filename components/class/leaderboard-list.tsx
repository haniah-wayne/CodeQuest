import { RankingIcon, Medal01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ClassSection, SectionEmpty, SectionError } from "@/components/class/class-section";
import type { Database } from "@/supabase/database.types";

type LeaderboardRow = Database["public"]["Functions"]["get_class_leaderboard"]["Returns"][number];

type LeaderboardListProps = {
	rows: LeaderboardRow[];
	error: unknown;
	viewerId: string;
};

export function LeaderboardList({ rows, error, viewerId }: LeaderboardListProps) {
	const sortedRows = [...rows].sort((a, b) => Number(a.rank) - Number(b.rank));

	return (
		<ClassSection id="leaderboard" title="Leaderboard" icon={RankingIcon} count={rows.length}>
			{error ? (
				<SectionError what="leaderboard" />
			) : rows.length === 0 ? (
				<SectionEmpty
					icon={RankingIcon}
					title="No rankings yet"
					description="Students show up here once they complete challenges."
				/>
			) : (
				<ol className="flex flex-col gap-2">
					{sortedRows.map((student) => (
						<li
							key={student.student_id}
							className={`flex items-center gap-4 rounded-2xl px-3 py-3.5 sm:px-4 ${
								student.student_id === viewerId ? "bg-muted" : ""
							}`}
						>
							<span className="flex size-8 shrink-0 items-center justify-center">
								{student.rank <= 3 ? (
									<HugeiconsIcon
										icon={Medal01Icon}
										size={20}
										color={
											student.rank === 1
												? "#D4AF37"
												: student.rank === 2
													? "#A8A9AD"
													: "#CD7F32"
										}
									/>
								) : (
									<span className="text-caption text-muted-foreground tabular-nums">
										{student.rank}
									</span>
								)}
							</span>
							<div className="flex min-w-0 flex-1 items-center justify-between gap-4">
								<h3 className="truncate text-label">
									{student.student_name}
									{student.student_id === viewerId && (
										<span className="ml-2 text-muted-foreground">(You)</span>
									)}
								</h3>

								<span className="shrink-0 font-medium tabular-nums">
									{student.total_score} pts
								</span>
							</div>
						</li>
					))}
				</ol>
			)}
		</ClassSection>
	);
}
