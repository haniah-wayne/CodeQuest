import type * as React from "react";

function FormError({ children }: { children: React.ReactNode }) {
	return (
		<div
			role="alert"
			className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-sm text-destructive"
		>
			{children}
		</div>
	);
}

export { FormError };
