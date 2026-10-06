import type * as React from "react";

export function DashboardPageHeader({
	title,
	actions,
}: {
	title: string;
	actions?: React.ReactNode;
}) {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<h1 className="max-w-2xl text-title">{title}</h1>

			{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
		</header>
	);
}
