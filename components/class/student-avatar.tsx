import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

export function StudentAvatar({ name, size }: { name: string; size?: "default" | "sm" | "lg" }) {
	return (
		<Avatar size={size} aria-hidden>
			<AvatarFallback className="bg-emerald-50 text-xs font-medium text-wsu-green">
				{initials(name) || "?"}
			</AvatarFallback>
		</Avatar>
	);
}
