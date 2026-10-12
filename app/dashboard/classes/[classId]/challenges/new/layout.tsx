import type * as React from "react";
import { SiteHeader } from "@/components/site-header";
export default function ChallengeCreationLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SiteHeader />
			<main className="flex flex-1 flex-col justify-center bg-linear-to-b/oklch from-emerald-50/60 to-white px-5 pt-28 pb-16 sm:px-8">
				{children}
			</main>
		</>
	);
}

//my notes
//site header is its own component, uses user information
//color for the main
//children render the page
