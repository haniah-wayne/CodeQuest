import { Code, Cursor02Icon as Cursor, Trophy } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

interface Step {
	title: string;
	body: string;
	tagline: string;
	icon: IconSvgElement;
	tileClass: string;
	labelClass: string;
}

const steps: Step[] = [
	{
		title: "Stomp the Campus",
		body: "Nostrud occaecat officia ipsum cillum quis consectetur sunt. Sit amet consectetur adipisicing elit.",
		tagline: "Geofenced trigger",
		icon: Cursor,
		tileClass: "bg-pink-300/40 text-pink-800",
		labelClass: "text-pink-900",
	},
	{
		title: "Hack the Quest",
		body: "Nostrud occaecat officia ipsum cillum quis consectetur sunt. Sit amet consectetur adipisicing elit.",
		tagline: "Interactive debugging",
		icon: Code,
		tileClass: "bg-teal-400/40 text-teal-800",
		labelClass: "text-teal-900",
	},
	{
		title: "Climb the Leaderboard",
		body: "Nostrud occaecat officia ipsum cillum quis consectetur sunt. Sit amet consectetur adipisicing elit.",
		tagline: "Live class standings",
		icon: Trophy,
		tileClass: "bg-amber-400/40 text-amber-800",
		labelClass: "text-amber-900",
	},
];

export function HowItWorks() {
	return (
		<section
			id="how-it-works"
			className="bg-linear-to-b/oklch from-emerald-50/50 to-white py-24"
		>
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 sm:px-8">
				<hgroup className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
					<h2 className="text-title">How It Works</h2>

					<p className="text-body-sm text-muted-foreground">
						Fugiat non deserunt amet sunt consequat voluptate ad eu elit ipsum enim.
					</p>
				</hgroup>

				<ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{steps.map((step, i) => (
						<li
							className="step flex flex-col justify-between rounded-3xl border border-accent bg-white p-8"
							key={i}
						>
							<div className="flex flex-col items-start gap-4">
								<span
									className={`flex size-14 items-center justify-center rounded-2xl text-heading ${step.tileClass}`}
								>
									{(i + 1).toString().padStart(2, "0")}
								</span>

								<h3 className="text-heading">{step.title}</h3>

								<p className="text-body-sm text-pretty text-muted-foreground">
									{step.body}
								</p>
							</div>

							<div
								className={`mt-6 flex items-center gap-2 border-t border-muted pt-4 ${step.labelClass}`}
							>
								<HugeiconsIcon className="size-6 shrink-0" icon={step.icon} />

								<span className="text-label">{step.tagline}</span>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
