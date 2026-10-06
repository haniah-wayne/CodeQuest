import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SiteHeader } from "@/components/site-header";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
	return (
		<>
			<SiteHeader />

			<div className="flex flex-1 flex-col bg-linear-to-b/oklch from-emerald-50/60 to-white px-5 pt-24 pb-16 sm:px-8 sm:pt-36 lg:px-5">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 lg:flex-row lg:gap-10">
					<aside className="lg:sticky lg:top-28 lg:w-60 lg:shrink-0 lg:self-start">
						<div className="flex flex-col gap-4 lg:rounded-3xl lg:border lg:border-accent lg:bg-white lg:p-3">
							<DashboardNav />
						</div>
					</aside>

					<main className="flex min-w-0 flex-1 flex-col gap-8">{children}</main>
				</div>
			</div>
		</>
	);
}
