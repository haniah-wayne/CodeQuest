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
		body: "Nostrud occaecat officia ipsum cillum quis consectetur sunt. Sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt.",
		points: [
			{
				lead: "Lorem ipsum:",
				rest: " Ut enim ad minim veniam quis nostrud exercitation ullamco.",
			},
			{
				lead: "Lorem ipsum:",
				rest: " Duis aute irure dolor in reprehenderit in voluptate velit.",
			},
			{
				lead: "Lorem ipsum:",
				rest: " Excepteur sint occaecat cupidatat non proident sunt in culpa.",
			},
		],
	},
	{
		title: "High-Engagement Campus Anchors",
		body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		points: [
			{
				lead: "Lorem ipsum:",
				rest: " Quis autem vel eum iure reprehenderit qui in ea voluptate.",
			},
			{
				lead: "Lorem ipsum:",
				rest: " Nemo enim ipsam voluptatem quia voluptas sit aspernatur.",
			},
			{
				lead: "Lorem ipsum:",
				rest: " At vero eos et accusamus et iusto odio dignissimos ducimus.",
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

					<p className="text-body-sm text-muted-foreground">
						Duis non anim ullamco ad velit anim commodo culpa nostrud qui aliquip id
						incididunt minim.
					</p>
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
