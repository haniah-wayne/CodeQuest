import { Tick02Icon as Tick } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface Audience {
	title: string;
	body: string;
	points: { lead: string; rest: string }[];
}

const audiences: Audience[] = [
	{
		title: "Escape the 11:59 PM Screen Prison",
		body: "Coding practice doesn't have to mean staring at a laptop in your dorm at midnight. CodeQuest gets you out on campus, where every challenge is waiting on a real spot on the map.",
		points: [
			{
				lead: "Walk to unlock:",
				rest: " Get within range of a challenge's spot on the campus map to open it.",
			},
			{
				lead: "Code on your phone:",
				rest: " Write, run, and submit Python, Java, C++, or JavaScript right in your browser.",
			},
			{
				lead: "Climb the leaderboard:",
				rest: " Each correct solution earns the challenge's points, and your class ranking updates live.",
			},
		],
	},
	{
		title: "High-Engagement Campus Anchors",
		body: "Turn the places you already pass every day into checkpoints for your course.",
		points: [
			{
				lead: "Build challenges fast:",
				rest: " Write your own, or describe what you want and let AI draft one with a tested reference solution.",
			},
			{
				lead: "See every attempt:",
				rest: " Each submission is saved with the student's code, output, and timestamp, so you know who participated and when.",
			},
			{
				lead: "Grading built in:",
				rest: " Submissions are auto-checked against the expected output, and AI can review any of them with a suggested score and feedback.",
			},
		],
	},
];

export function Audience() {
	return (
		<section id="audience" className="bg-linear-to-b/oklch from-white to-emerald-50/50 py-24">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 sm:px-8">
				<hgroup className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
					<h2 className="text-title">Built for Warriors, Guided by Professors</h2>
				</hgroup>

				<ul className="grid gap-12 sm:grid-cols-2">
					{audiences.map((audience) => (
						<li
							className="flex flex-col gap-4 rounded-3xl border-border bg-white p-8 shadow-xs smooth-shadow-sm"
							key={audience.title}
						>
							<h3 className="text-heading">{audience.title}</h3>

							<p className="text-body-sm text-pretty text-muted-foreground">
								{audience.body}
							</p>

							<ul className="mt-3 flex flex-col gap-4">
								{audience.points.map((point) => (
									<li className="flex items-start gap-3" key={point.rest}>
										<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
											<HugeiconsIcon
												className="size-3.5"
												icon={Tick}
												strokeWidth={3}
											/>
										</span>

										<p className="text-body-sm text-pretty">
											<strong className="font-bold">{point.lead}</strong>
											<span className="text-muted-foreground">
												{point.rest}
											</span>
										</p>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
