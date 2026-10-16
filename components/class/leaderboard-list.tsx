import { RankingIcon } from "@hugeicons/core-free-icons";
import { ClassSection, SectionEmpty } from "@/components/class/class-section";

export function LeaderboardList() {
	return (
		<ClassSection id="leaderboard" title="Leaderboard" icon={RankingIcon}>
			<SectionEmpty
				icon={RankingIcon}
				title="No rankings yet"
				description="Students show up here once they complete challenges."
			/>
		</ClassSection>
	);
}
