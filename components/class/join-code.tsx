"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function JoinCode({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;

		const timeout = setTimeout(() => setCopied(false), 2000);

		return () => clearTimeout(timeout);
	}, [copied]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
		} catch {
			// Clipboard access can be blocked; the code is still selectable
		}
	}

	return (
		<div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-white py-1 pr-1 pl-4">
			<span className="text-caption text-muted-foreground">Join code</span>

			<code className="font-mono text-label tracking-wider text-wsu-green select-all">
				{code}
			</code>

			<Button
				className="text-muted-foreground hover:text-foreground"
				size="icon-sm"
				variant="ghost"
				aria-label={copied ? "Copied" : "Copy join code"}
				onClick={copy}
			>
				<HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-4" />
			</Button>

			<span aria-live="polite" className="sr-only">
				{copied ? "Join code copied" : ""}
			</span>
		</div>
	);
}
