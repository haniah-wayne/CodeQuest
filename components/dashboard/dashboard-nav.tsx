"use client";

import {
	Book02Icon as Book,
	Flag02Icon as Flag,
	RankingIcon as Ranking,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	label: string;
	href: string;
	icon: IconSvgElement;
}

const items: NavItem[] = [
	{ label: "Classes", href: "/dashboard", icon: Book },
	{ label: "Quests", href: "/dashboard/quests", icon: Flag },
	{ label: "Leaderboard", href: "/dashboard/leaderboard", icon: Ranking },
];

export function DashboardNav() {
	const pathname = usePathname();

	return (
		<nav aria-label="Dashboard">
			<ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-0">
				{items.map((item) => {
					const active =
						item.href === "/dashboard"
							? pathname === item.href
							: pathname === item.href || pathname.startsWith(`${item.href}/`);

					const content = (
						<>
							<span
								className={cn(
									"flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
									active
										? "bg-wsu-green text-white"
										: "bg-muted text-muted-foreground group-hover/nav:text-foreground",
								)}
							>
								<HugeiconsIcon className="size-4.5" icon={item.icon} />
							</span>

							<span className="text-label">{item.label}</span>
						</>
					);

					return (
						<li key={item.href}>
							<Link
								className={cn(
									"group/nav flex shrink-0 items-center gap-3 rounded-2xl border py-1.5 pr-3 pl-1.5 whitespace-nowrap transition-colors lg:border-transparent",
									active
										? "border-emerald-200 bg-emerald-50 text-wsu-green lg:border-emerald-100"
										: "border-accent bg-white hover:bg-muted lg:bg-transparent",
								)}
								href={item.href}
								aria-current={active ? "page" : undefined}
							>
								{content}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
