import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "cn";
import type * as React from "react";

function Panel({ className, ...props }: React.ComponentProps<"section">) {
	return (
		<section
			data-slot="panel"
			className={cn(
				"flex min-w-0 flex-col gap-(--panel-gap) rounded-3xl bg-secondary p-(--panel-gap) smooth-shadow-ring-sm",
				className,
			)}
			{...props}
		/>
	);
}

function PanelHeader({ className, ...props }: React.ComponentProps<"header">) {
	return (
		<header
			data-slot="panel-header"
			className={cn("flex items-center gap-3 p-(--panel-gap) pr-2.5 sm:pr-3", className)}
			{...props}
		/>
	);
}

function PanelIcon({ icon, className }: { icon: IconSvgElement; className?: string }) {
	return (
		<span
			data-slot="panel-icon"
			className={cn(
				"flex size-9 shrink-0 items-center justify-center rounded-(--panel-inner-radius) bg-wsu-green text-wsu-gold",
				className,
			)}
		>
			<HugeiconsIcon icon={icon} className="size-4.5" />
		</span>
	);
}

function PanelSurface({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="panel-surface"
			className={cn("rounded-(--panel-radius) bg-card smooth-shadow-ring-sm", className)}
			{...props}
		/>
	);
}

export { Panel, PanelHeader, PanelIcon, PanelSurface };
