"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "cn";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
	return (
		<RadioGroupPrimitive
			data-slot="radio-group"
			className={cn("grid gap-2", className)}
			{...props}
		/>
	);
}

function Radio({ className, ...props }: RadioPrimitive.Root.Props) {
	return (
		<RadioPrimitive.Root
			data-slot="radio"
			className={cn(
				"relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-input/30 transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary",
				className,
			)}
			{...props}
		>
			<RadioPrimitive.Indicator
				data-slot="radio-indicator"
				className="size-1.5 rounded-full bg-primary-foreground"
			/>
		</RadioPrimitive.Root>
	);
}

export { Radio, RadioGroup };
