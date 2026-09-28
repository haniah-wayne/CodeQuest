import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookies) {
					try {
						for (const c of cookies) {
							cookieStore.set(c.name, c.value, c.options);
						}
					} catch {
						// Server Components can't write cookies. The proxy
						// refreshes the session, so this is safe to ignore.
					}
				},
			},
		},
	);
}
