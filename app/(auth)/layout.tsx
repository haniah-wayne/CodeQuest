import type * as React from "react";
import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SiteHeader />

			<main className="flex flex-1 flex-col justify-center bg-linear-to-br/oklch from-emerald-100/40 to-white px-5 pt-28 pb-16 sm:px-8">
				{children}
			</main>
		</>
	);
}
