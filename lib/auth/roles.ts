export const ROLES = ["student", "professor"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
	return typeof value === "string" && ROLES.includes(value as Role);
}

// TODO: update once dashboard route is created
export function roleHome(role: Role | null): string {
	switch (role) {
		case "student":
		case "professor":
		default:
			return "/";
	}
}
