import type * as React from "react";

export function DashboardPageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
			<div className="flex max-w-2xl min-w-0 flex-col gap-2">
				<h1 className="text-title text-balance">{title}</h1>

				{description && (
					<p className="max-w-prose text-body-sm text-pretty text-muted-foreground">
						{description}
					</p>
				)}
			</div>

			{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
		</header>
	);
}
