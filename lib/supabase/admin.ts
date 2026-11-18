import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/database.types";

export function createAdminClient() {
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!serviceRoleKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
	}

	return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}
