export const ROLES = ["student", "professor"] as const;

export type Role = (typeof ROLES)[number];
