import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = { correct: "Correct", incorrect: "Incorrect" };

export const STATUS_ORDER = Object.keys(statusLabels);

export function statusLabel(status: string | null) {
	return status === null ? "Unknown" : (statusLabels[status] ?? status);
}

export function StatusBadge({ status }: { status: string | null }) {
	switch (status) {
		case "correct":
			return (
				<Badge>
					<HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" />
					Correct
				</Badge>
			);
		case "incorrect":
			return <Badge variant="destructive">Incorrect</Badge>;
		default:
			return <Badge variant="secondary">{status ?? "Unknown"}</Badge>;
	}
}
