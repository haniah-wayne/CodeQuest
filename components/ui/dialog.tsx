"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";

function Dialog(props: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-foreground/20 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function DialogPopup({
	className,
	children,
	showCloseButton = true,
	...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
	return (
		<DialogPrimitive.Portal>
			<DialogBackdrop />

			<DialogPrimitive.Popup
				data-slot="dialog-popup"
				className={cn(
					"fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw---spacing(8))] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-3xl border border-accent bg-card p-8 text-card-foreground shadow-lg transition-all duration-200 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
					className,
				)}
				{...props}
			>
				{children}

				{showCloseButton && (
					<DialogClose
						aria-label="Close"
						className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<HugeiconsIcon icon={Cancel01Icon} className="size-4" />
					</DialogClose>
				)}
			</DialogPrimitive.Popup>
		</DialogPrimitive.Portal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"hgroup">) {
	return (
		<hgroup
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 pr-8", className)}
			{...props}
		/>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn("text-heading", className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
};
