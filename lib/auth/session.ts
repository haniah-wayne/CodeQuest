import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isRole, type Role } from "./roles";

export interface SessionUser {
	id: string;
	email: string | null;
	name: string | null;
	role: Role | null;
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	const metadata = user.user_metadata ?? {};

	return {
		id: user.id,
		email: user.email ?? null,
		name: typeof metadata.name === "string" ? metadata.name : null,
		role: isRole(metadata.role) ? metadata.role : null,
	};
});

export async function requireSessionUser(): Promise<SessionUser> {
	const user = await getSessionUser();

	if (!user) {
		redirect("/sign-in");
	}

	return user;
}
