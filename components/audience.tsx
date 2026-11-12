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
		body: "Coding practice doesn't have to mean staring at a laptop in your dorm at midnight. CodeQuest gets you out on campus , where every challenge is waiting on a real spot on the map",
		points: [
			{
				lead: "Walk to unlock:",
				rest: " Check in at a campus location to open its challenge.",
			},
			{
				lead: "Code anywhere:",
				rest: " Write and run code on your phone.",
			},
			{
				lead: "Climb the leaderboard:",
				rest: " Every solved challenge earns points, and your class ranking updates as you go.",
			},
		],
	},
	{
		title: "High-Engagement Campus Anchors",
		body: "Turn the places you already pass every day into checkpoints for your course.",
		points: [
			{
				lead: "Build challenges fast:",
				rest: " Write your own, or enter a topic and difficulty and let AI draft you one.",
			},
			{
				lead: "See who showed up:",
				rest: " Every check-in and submission is logges, so you know who participated and when.",
			},
			{
				lead: "Grading built in:",
				rest: " Code is run against the expected soution and gives feedback for each student.",
			},
		],
	},
];

export function Audience() {
	return (
		<section
			id="audience"
			className="bg-linear-to-b from-wsu-green to-background py-24 text-white"
		>
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 sm:px-8">
				<hgroup className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
					<h2 className="text-title">Built for Warriors, Guided by Professors</h2>

					<p className="text-body-sm text-white/80">
						Duis non anim ullamco ad velit anim commodo culpa nostrud qui aliquip id
						incididunt minim.
					</p>
				</hgroup>

				<ul className="grid gap-12 sm:grid-cols-2">
					{audiences.map((audience) => (
						<li
							className="flex flex-col gap-4 rounded-3xl bg-card p-8 text-card-foreground smooth-shadow-xl"
							key={audience.title}
						>
							<h3 className="text-heading">{audience.title}</h3>

							<p className="text-body-sm text-pretty text-muted-foreground">
								{audience.body}
							</p>

							<ul className="mt-3 flex flex-col gap-4">
								{audience.points.map((point) => (
									<li className="flex items-start gap-3" key={point.rest}>
										<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-wsu-gold text-wsu-green">
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
