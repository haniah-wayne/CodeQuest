import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Panel, PanelHeader, PanelIcon, PanelSurface } from "@/components/ui/panel";

export function ClassSection({
	id,
	title,
	icon,
	count,
	children,
	action,
}: {
	id: string;
	title: string;
	icon: IconSvgElement;
	count?: number;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<Panel aria-labelledby={id}>
			<PanelHeader>
				<PanelIcon icon={icon} />

				<h2 className="text-label" id={id}>
					{title}
				</h2>

				{count !== undefined && count > 0 && (
					<Badge className="bg-card tabular-nums" variant="secondary">
						{count}
					</Badge>
				)}

				{action && <div className="ml-auto">{action}</div>}
			</PanelHeader>

			<PanelSurface className="flex flex-1 flex-col p-(--panel-gap)">{children}</PanelSurface>
		</Panel>
	);
}

export function SectionEmpty({
	icon,
	title,
	description,
	actions,
}: {
	icon: IconSvgElement;
	title: string;
	description: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<Empty className="gap-3 p-8">
			<EmptyHeader>
				<EmptyMedia className="bg-secondary text-wsu-green" variant="icon">
					<HugeiconsIcon icon={icon} />
				</EmptyMedia>

				<EmptyTitle>{title}</EmptyTitle>

				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>

			{actions && <EmptyContent>{actions}</EmptyContent>}
		</Empty>
	);
}

export function SectionError({ what }: { what: string }) {
	return (
		<SectionEmpty
			icon={Alert02Icon}
			title={`Couldn’t load ${what}`}
			description="Refresh the page to try again."
		/>
	);
}
