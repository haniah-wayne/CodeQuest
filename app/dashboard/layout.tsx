import { SiteHeader } from "@/components/site-header";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
	return (
		<>
			<SiteHeader />

			<main className="flex flex-1 flex-col px-5 pt-24 pb-16 sm:px-8 sm:pt-36">
				<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
					{children}
				</div>
			</main>
		</>
	);
}
