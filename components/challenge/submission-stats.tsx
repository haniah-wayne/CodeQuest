//11.20 - Haniah Ahmed - stats panel for the professor's challenge page (canvas style)

import { ChartAverageIcon } from "@hugeicons/core-free-icons";
import { ClassSection } from "@/components/class/class-section";
import type { SubmissionStats as Stats } from "@/lib/challenges/stats";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

//sizing the cirlce
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

//when no data yet
function format(value: number | null) {
	return value === null ? "no data" : numberFormat.format(value);
}

//how a score sits on the bar and circle
function toPercent(value: number, maxScore: number) {
	if (maxScore <= 0) return 0;
	return Math.min(100, Math.max(0, (value / maxScore) * 100));
}

//function for formatting the actual statistics
export function SubmissionStats({ stats, maxScore }: { stats: Stats; maxScore: number }) {
	const { meanScore, lowScore, highScore } = stats;

	return (
		<ClassSection id="statistics" title="Statistics" icon={ChartAverageIcon}>
			<div className="flex flex-col gap-5 p-3 sm:p-4">
				<div className="flex flex-col items-center gap-6 sm:flex-row">
					<MeanRing mean={meanScore} maxScore={maxScore} />

					<div className="flex w-full flex-col gap-3">
						<p className="text-caption text-muted-foreground">Out of {maxScore} pts</p>

						{/* dl = label/value pairs, screen readers read them together */}
						<dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
							<Fact label="Median" value={format(stats.medianScore)} />
							<Fact label="Mode" value={format(stats.modeScore)} />
							<Fact label="Mean attempts" value={format(stats.meanAttempts)} />
							<Fact
								label="Submitted"
								value={String(stats.studentsSubmitted)}
								suffix={`of ${stats.rosterSize}`}
							/>
							<Fact
								label="Solved"
								value={String(stats.solvedCount)}
								suffix={`of ${stats.studentsSubmitted}`}
							/>
							<Fact
								label="Unsolved"
								value={String(stats.unsolvedCount)}
								suffix={`of ${stats.studentsSubmitted}`}
							/>
						</dl>
					</div>
				</div>

				{/* only draw bar when scores are there */}
				{meanScore !== null && lowScore !== null && highScore !== null ? (
					<ScoreRange
						low={lowScore}
						mean={meanScore}
						high={highScore}
						maxScore={maxScore}
					/>
				) : (
					<p className="text-caption text-muted-foreground">No scores yet.</p>
				)}
			</div>
		</ClassSection>
	);
}

//one label/value pair, the suffix is the small grey "of 24" part
function Fact({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
	return (
		<div className="flex flex-col gap-0.5">
			<dt className="text-caption text-muted-foreground">{label}</dt>

			<dd className="text-label tabular-nums">
				{value}
				{suffix && (
					<span className="ml-1 text-caption text-muted-foreground">{suffix}</span>
				)}
			</dd>
		</div>
	);
}

//circle that goes ti the mean
function MeanRing({ mean, maxScore }: { mean: number | null; maxScore: number }) {
	const filled = mean === null ? 0 : toPercent(mean, maxScore) / 100;

	return (
		<div className="relative size-28 shrink-0">
			<svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					strokeWidth="6"
					className="stroke-secondary"
				/>

				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					strokeWidth="6"
					strokeLinecap={filled > 0 ? "round" : "butt"}
					className="stroke-wsu-green"
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={CIRCUMFERENCE * (1 - filled)}
				/>
			</svg>

			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-heading tabular-nums">{format(mean)}</span>
				<span className="text-caption text-muted-foreground">Mean</span>
			</div>
		</div>
	);
}

//the grading line
function ScoreRange({
	low,
	mean,
	high,
	maxScore,
}: {
	low: number;
	mean: number;
	high: number;
	maxScore: number;
}) {
	const lowPercent = toPercent(low, maxScore);
	const highPercent = toPercent(high, maxScore);

	return (
		<div className="flex flex-col gap-2">
			<div className="relative mx-1.5 h-4" aria-hidden="true">
				{/* grey line with ticks at the ends*/}
				<div className="absolute inset-x-0 top-1/2 h-px bg-border" />
				<div className="absolute top-1/2 left-0 h-3 w-px -translate-y-1/2 bg-border" />
				<div className="absolute top-1/2 right-0 h-3 w-px -translate-y-1/2 bg-border" />

				{/* the green part */}
				<div
					className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-wsu-green"
					style={{ left: `${lowPercent}%`, width: `${highPercent - lowPercent}%` }}
				/>

				{/* the caps */}
				{[lowPercent, highPercent].map((percent, index) => (
					<div
						key={index}
						className="absolute top-1/2 h-3 w-0.5 -translate-1/2 bg-wsu-green"
						style={{ left: `${percent}%` }}
					/>
				))}

				{/* making thr diamond */}
				<div
					className="absolute top-1/2 size-2.5 -translate-1/2 rotate-45 bg-wsu-gold ring-1 ring-wsu-green"
					style={{ left: `${toPercent(mean, maxScore)}%` }}
				/>
			</div>

			<div className="flex justify-between text-caption text-muted-foreground tabular-nums">
				<span>Low: {format(low)}</span>
				<span>Mean: {format(mean)}</span>
				<span>High: {format(high)}</span>
			</div>
		</div>
	);
}
